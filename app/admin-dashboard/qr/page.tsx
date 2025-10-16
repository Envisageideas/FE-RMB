"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { apiBase } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface Registration {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string;
  profile_pics: string | null;
  change_background_colour: string;
}

export default function QRPage() {
  const [users, setUsers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${apiBase}/api/registrations/`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center py-10">Loading QR codes…</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  const buildImageUrl = (path: string | null) => {
    if (!path || path.trim() === "" || path === "null") return null;
    if (path.startsWith("http")) return path;
    const base = apiBase.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Member QR Codes 📱
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users.map((user) => {
          const profilePic = buildImageUrl(user.profile_pics);

          // ✅ Direct details page link (used inside the QR)
          const detailsUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/admin-dashboard/details?id=${user.id}`;

          return (
            <div
              key={user.id}
              className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center border"
              style={{
                backgroundColor: user.change_background_colour || "#ffffff",
              }}
            >
              {/* Profile Picture */}
              {profilePic ? (
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={80}
                  height={80}
                  // **FIXED: Ensured object-cover for perfect frame fit**
                  className="rounded-full border shadow-sm w-20 h-20 object-cover mb-3" 
                  unoptimized
                />
              ) : (
                // **FIXED: Fallback maintains w-20 h-20 for consistency**
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-3 flex items-center justify-center text-gray-500 text-xs">
                    No Pic
                </div> 
              )}

              {/* Name */}
              <h2 className="text-lg font-semibold text-center text-gray-800">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-600 text-center mb-2">
                {user.company_name || "N/A"}
              </p>

              {/* ✅ QR Code that opens the details page directly */}
              <div className="p-2 bg-gray-50 rounded-lg shadow-inner">
                <QRCodeCanvas
                  value={detailsUrl}
                  size={150}
                  level="H"
                  includeMargin
                />
              </div>

              
            </div>
          );
        })}
      </div>
    </div>
  );
}
