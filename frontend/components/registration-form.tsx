"use client"

import type React from "react"
import { useState } from "react"

type FormState = {
  first_name: string
  last_name: string
  blood_group: string
  company_name: string
  designation: string
  birth_date: string
  industry: string
  email: string
  office_address: string
  facebook: string
  linkedin: string
  instagram: string
  change_background_colour: string
  phone_number: string
  company_website: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    blood_group: "",
    company_name: "",
    designation: "",
    birth_date: "",
    industry: "",
    email: "",
    office_address: "",
    facebook: "",
    linkedin: "",
    instagram: "",
    change_background_colour: "#ffffff",
    phone_number: "",
    company_website: "",
  })

  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleProfileChange = (file: File | null) => {
    setProfilePic(file)
    setProfilePreview(file ? URL.createObjectURL(file) : null)
  }

  const handleLogoChange = (file: File | null) => {
    setCompanyLogo(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v ?? ""))

      // Only append files if user selected new ones
      if (profilePic) data.append("profile_pics", profilePic)
      if (companyLogo) data.append("company_logo", companyLogo)

      const res = await fetch(`${API_BASE}/api/registrations/`, {
        method: "POST",
        body: data,
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || "Failed to submit form")
      }

      setMessage("Registration submitted successfully.")

      // Reset form
      setForm({
        first_name: "",
        last_name: "",
        blood_group: "",
        company_name: "",
        designation: "",
        birth_date: "",
        industry: "",
        email: "",
        office_address: "",
        facebook: "",
        linkedin: "",
        instagram: "",
        change_background_colour: "#ffffff",
        phone_number: "",
        company_website: "",
      })
      setProfilePic(null)
      setCompanyLogo(null)
      setProfilePreview(null)
      setLogoPreview(null)
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First Name" required>
          <input
            required
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            placeholder="John"
          />
        </Field>
        <Field label="Last Name" required>
          <input
            required
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            placeholder="Doe"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Blood Group">
          <select
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.blood_group}
            onChange={(e) => handleChange("blood_group", e.target.value)}
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </Field>
        <Field label="Birth Date">
          <input
            type="date"
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.birth_date}
            onChange={(e) => handleChange("birth_date", e.target.value)}
          />
        </Field>
        <Field label="Phone Number">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
            placeholder="+1 555 123 4567"
          />
        </Field>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Company Name">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.company_name}
            onChange={(e) => handleChange("company_name", e.target.value)}
            placeholder="Acme Inc."
          />
        </Field>
        <Field label="Designation">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.designation}
            onChange={(e) => handleChange("designation", e.target.value)}
            placeholder="Product Manager"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Industry">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            placeholder="Technology"
          />
        </Field>
        <Field label="Company Website">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.company_website}
            onChange={(e) => handleChange("company_website", e.target.value)}
            placeholder="https://example.com"
          />
        </Field>
      </div>

      <Field label="Office Address">
        <textarea
          className="w-full rounded-md border bg-background px-3 py-2"
          rows={3}
          value={form.office_address}
          onChange={(e) => handleChange("office_address", e.target.value)}
          placeholder="123 Main St, City, Country"
        />
      </Field>

      {/* Socials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Facebook">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.facebook}
            onChange={(e) => handleChange("facebook", e.target.value)}
            placeholder="https://facebook.com/yourprofile"
          />
        </Field>
        <Field label="LinkedIn">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.linkedin}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </Field>
        <Field label="Instagram">
          <input
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
            placeholder="https://instagram.com/yourprofile"
          />
        </Field>
      </div>

      {/* Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Profile Pics">
          {profilePreview && (
            <img
              src={profilePreview}
              alt="Profile Preview"
              className="w-32 h-32 object-cover rounded-full mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm"
            onChange={(e) => handleProfileChange(e.target.files?.[0] ?? null)}
          />
        </Field>

        <Field label="Company Logo">
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="w-32 h-32 object-contain mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm"
            onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
          />
        </Field>

        <Field label="Change Background Colour">
          <input
            type="color"
            className="h-10 w-full rounded-md border bg-background px-3 py-2"
            value={form.change_background_colour}
            onChange={(e) =>
              handleChange("change_background_colour", e.target.value)
            }
            aria-label="Choose background color"
          />
        </Field>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Email">
          <input
            type="email"
            className="w-full rounded-md border bg-background px-3 py-2"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
        {message ? (
          <span aria-live="polite" className="text-sm text-muted-foreground">
            {message}
          </span>
        ) : null}
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </span>
      {children}
    </label>
  )
}

