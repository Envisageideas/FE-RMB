"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image"; // For converting the card to an image
import { apiBase } from "@/lib/api";

// Interface updated to match your final Django model fields
interface Registration {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  company_name: string;
  designation: string;
  profile_pics: string | null;
  company_logo: string | null;
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

export default function UserDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [user, setUser] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for the element to capture as an image (the V-Card style)
  const cardRef = useRef<HTMLDivElement>(null);

  // Data Fetching Logic
  useEffect(() => {
    if (!id) return;
    async function fetchUser() {
      try {
        const res = await fetch(`${apiBase}/api/registrations/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch user details");
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  // Image URL Builder
  const buildImageUrl = (path: string | null) => {
    if (!path || path.trim() === "" || path === "null") return null;
    if (path.startsWith("http")) return path;
    const base = apiBase.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  if (!id) return <p className="text-center py-10">User ID not provided.</p>;
  if (loading) return <p className="text-center py-10">Loading user details…</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!user) return <p className="text-center py-10">User not found.</p>;

  const profilePicUrl = buildImageUrl(user.profile_pics);
  const companyLogoUrl = buildImageUrl(user.company_logo);

  // V-Card string (for QR code)
  const vCardText = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${user.last_name};${user.first_name};;;`,
    `FN:${user.first_name} ${user.last_name}`,
    `ORG:${user.company_name || ""}`,
    `TITLE:${user.designation || ""}`,
    `EMAIL;TYPE=WORK:${user.email || ""}`,
    `TEL;TYPE=CELL:${user.phone_number || ""}`,
    `ADR;TYPE=WORK:;;${user.office_address || ""};;;;`,
    `URL:${user.company_website || ""}`,
    user.birth_date ? `BDAY:${user.birth_date}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  // Image Generation and Share Logic
  const handleGenerateImage = async (share = false) => {
    if (!cardRef.current) return;

    try {
      // Use toPng to convert the referenced element to a data URL
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2, 
        backgroundColor: user.change_background_colour || "#fdfdfd",
      });

      const fileName = `${user.first_name}_${user.last_name}_Card.png`;
      const imageBlob = await fetch(dataUrl).then((res) => res.blob());
      const file = new File([imageBlob], fileName, { type: "image/png" });

      // Share functionality
      if (share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${user.first_name} ${user.last_name} Digital Card`,
          files: [file],
        });
      } else {
        // Download functionality
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Image generation failed", err);
      setError("Could not generate image card.");
    }
  };

  // ====== Render ======
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        ← Back
      </button>

      {/* ====================================================
        1. MAIN CARD (Captured as Image) 🖼️
        (Includes Profile Pic, Name, Email, Phone, Blood Group, QR Code)
        ====================================================
      */}
      <div
        ref={cardRef}
        className="max-w-sm w-full bg-white rounded-2xl shadow-2xl overflow-hidden border"
        style={{ backgroundColor: user.change_background_colour || "#fdfdfd" }}
      >
        {/* Profile & Name */}
        <div className="relative flex flex-col items-center p-6 pb-3">
          {profilePicUrl ? (
            <Image
              src={profilePicUrl}
              alt="Profile"
              width={140}
              height={140}
              className="rounded-full border-4 border-white shadow-lg object-cover"
              unoptimized
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gray-200 mb-3" />
          )}
          <h2 className="text-2xl font-bold mt-3 text-gray-800 text-center">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-gray-600 text-center">{user.designation}</p>
          
          {companyLogoUrl && (
            <div className="mt-4 flex justify-center">
              <Image
                src={companyLogoUrl}
                alt="Company Logo"
                width={80}
                height={80}
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Essential Contact Info (as requested) */}
        <div className="bg-white px-6 py-4 border-y text-sm text-gray-800 space-y-1">
          <p><strong>Email:</strong> {user.email || "N/A"}</p>
          <p><strong>Phone:</strong> {user.phone_number || "N/A"}</p>
          <p><strong>Blood Group:</strong> {user.blood_group || "N/A"}</p>
        </div>

        {/* QR SECTION (as requested) */}
        <div className="flex flex-col items-center gap-2 p-5 bg-white">
          <div className="p-3 bg-gray-100 rounded-xl shadow-inner">
            <QRCodeCanvas value={vCardText} size={180} level="H" includeMargin />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Scan this QR to save contact (vCard)
          </p>
        </div>
      </div>

      {/* ====================================================
        2. BUTTONS (Outside the capture area) 
        ====================================================
      */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => handleGenerateImage(false)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold shadow-md"
        >
          Download Card (PNG) 🖼️
        </button>
        <button
          onClick={() => handleGenerateImage(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow-md"
        >
          Share Card 📤
        </button>
      </div>

      {/* ====================================================
        3. ADDITIONAL DETAILS SECTION (Not captured in image)
        ====================================================
      */}
      <div className="mt-8 max-w-sm w-full bg-white rounded-2xl shadow-lg p-6 border">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Complete Details</h3>
        <div className="text-sm text-gray-800 space-y-2">
          {/* Professional Details */}
          <p><strong>Company:</strong> {user.company_name || "N/A"}</p>
          <p><strong>Designation:</strong> {user.designation || "N/A"}</p>
          <p><strong>Industry:</strong> {user.industry || "N/A"}</p>
          <p><strong>Website:</strong> {user.company_website ? <a href={user.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{user.company_website}</a> : "N/A"}</p>
          <p><strong>Address:</strong> {user.office_address || "N/A"}</p>
          
          <hr className="my-2 border-gray-200" />
          
          {/* Personal & Social Details */}
          <p><strong>Birth Date:</strong> {user.birth_date || "N/A"}</p>
          <p><strong>Facebook:</strong> {user.facebook ? <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : "N/A"}</p>
          <p><strong>LinkedIn:</strong> {user.linkedin ? <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : "N/A"}</p>
          <p><strong>Instagram:</strong> {user.instagram ? <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : "N/A"}</p>
        </div>
      </div>
    </div>
  );
}