"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBase } from "@/lib/api";

interface Registration {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  blood_group: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch all registrations
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${apiBase}/api/registrations/`);
        if (!res.ok) throw new Error("Failed to fetch user profiles");
        const data = await res.json();
        const simplified = data.map((u: any) => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          phone_number: u.phone_number,
          blood_group: u.blood_group,
        }));
        setUsers(simplified);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // ✅ Delete user
  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      setDeleting(id);
      const res = await fetch(`${apiBase}/api/registrations/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("User deleted successfully!");
    } catch (err: any) {
      alert(err.message || "Error deleting user");
    } finally {
      setDeleting(null);
    }
  }

  // ✅ Bulk upload Excel/CSV file
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch(`${apiBase}/api/registrations/bulk_upload/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      alert(`✅ ${result.created.length} records uploaded successfully!`);

      // Refresh list
      const newRes = await fetch(`${apiBase}/api/registrations/`);
      const updatedData = await newRes.json();
      setUsers(updatedData);
    } catch (err: any) {
      alert(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  }

  if (loading)
    return <div className="text-center text-gray-500 py-10">Loading users…</div>;

  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        Error fetching users: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
          {uploading ? "Uploading..." : "Upload Excel/CSV"}
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">No user registrations found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between border"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </h2>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Blood Group:</strong> {user.blood_group || "N/A"}
                </p>
                <p>
                  <strong>Mobile:</strong> {user.phone_number || "N/A"}
                </p>
              </div>

              <div className="mt-4 flex justify-around">
                <button
                  onClick={() =>
                    router.push(`/admin-dashboard/details?id=${user.id}`)
                  }
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Details
                </button>
                <button
                  onClick={() =>
                    router.push(`/admin-dashboard/edit?id=${user.id}`)
                  }
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deleting === user.id}
                  className={`px-3 py-1 rounded text-white ${
                    deleting === user.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {deleting === user.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
