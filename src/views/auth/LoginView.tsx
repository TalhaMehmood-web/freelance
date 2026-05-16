"use client"

import { LoginForm } from "@/components/auth/LoginForm"

export function LoginView() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1.5">Welcome back</h1>
        <p className="text-sm text-text-secondary">Sign in to your FreelanceHub account</p>
      </div>
      <LoginForm />
    </div>
  )
}
