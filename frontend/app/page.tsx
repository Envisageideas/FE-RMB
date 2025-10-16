"use client"

import RegistrationForm from "../components/registration-form"

export default function Page() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-pretty"> User Registration Form</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          
        </p>
        <RegistrationForm />
      </div>
    </main>
  )
}
