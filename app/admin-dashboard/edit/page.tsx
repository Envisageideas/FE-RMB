"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiBase } from "@/lib/api";

interface Registration {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  company_name: string;
  designation: string;
  profile_pics: string | File | null;
  company_logo: string | File | null;
  industry: string;
  office_address: string;
  blood_group: string;
  birth_date: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  change_background_colour: string;
  company_website: string;
  created_at: string;
}

export default function EditUserPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [user, setUser] = useState<Partial<Registration>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Previews for profile and logo
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Track if user changed the files
  const [profileChanged, setProfileChanged] = useState(false);
  const [logoChanged, setLogoChanged] = useState(false);

  // Fetch user data
  useEffect(() => {
    if (!id) return;
    async function fetchUser() {
      try {
        const res = await fetch(`${apiBase}/api/registrations/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);

        // Set initial previews
        setProfilePreview(data.profile_pics || null);
        setLogoPreview(data.company_logo || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files, type } = e.target as HTMLInputElement;
    if (type === "file") {
      const file = files && files.length > 0 ? files[0] : null;
      setUser({ ...user, [name]: file });

      if (name === "profile_pics") {
        setProfilePreview(file ? URL.createObjectURL(file) : profilePreview);
        setProfileChanged(!!file);
      } else if (name === "company_logo") {
        setLogoPreview(file ? URL.createObjectURL(file) : logoPreview);
        setLogoChanged(!!file);
      }
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    try {
      const formData = new FormData();

      Object.entries(user).forEach(([key, value]) => {
        if (key === "id" || key === "created_at") return;

        // Only append files if they are changed
        if (key === "profile_pics" && !profileChanged) return;
        if (key === "company_logo" && !logoChanged) return;

        if (value !== null && value !== "") {
          formData.append(key, value as any);
        }
      });

      const res = await fetch(`${apiBase}/api/registrations/${id}/`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data));
      }

      router.push("/admin-dashboard"); // redirect after save
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <p className="text-center py-10">User ID not provided.</p>;
  if (loading) return <p className="text-center py-10">Loading user data…</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Back
      </button>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4">Edit User</h2>

        {/* Profile Preview */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Profile Picture
          </label>
          {profilePreview && (
            <img
              src={profilePreview}
              alt="Profile Preview"
              className="w-32 h-32 object-cover rounded-full mb-2"
            />
          )}
          <input
            type="file"
            name="profile_pics"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Company Logo Preview */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Company Logo
          </label>
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="w-32 h-32 object-contain mb-2"
            />
          )}
          <input
            type="file"
            name="company_logo"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Other Fields */}
        {Object.entries(user).map(([key, value]) => {
          if (["id","created_at","profile_pics","company_logo"].includes(key)) return null;

          let inputType = "text";
          if (key === "birth_date") inputType = "date";
          if (key === "email") inputType = "email";
          if (key === "change_background_colour") inputType = "color";

          return (
            <div key={key}>
              <label className="block mb-1 font-semibold text-gray-700">
                {key.replace("_", " ")}
              </label>
              <input
                type={inputType}
                name={key}
                value={value || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        })}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
