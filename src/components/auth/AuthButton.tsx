"use client"

import { useEffect, useState, cloneElement, isValidElement } from "react"
import type { ReactElement, MouseEvent } from "react"
import type { AuthChangeEvent, Session, AuthResponse } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/client/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/LoginForm"

interface AuthButtonProps {
  children: ReactElement<{ onClick?: (e: MouseEvent) => void; disabled?: boolean }>
}

export function AuthButton({ children }: AuthButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    supabase.auth.getSession().then((result: AuthResponse) => {
      setIsLoggedIn(!!(result as { data: { session: Session | null } }).data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        setIsLoggedIn(!!currentSession)
        if (currentSession) setDialogOpen(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (!isValidElement(children)) return children

  // Still loading — render the button disabled to avoid layout shift
  if (isLoggedIn === null) {
    return cloneElement(children, { disabled: true })
  }

  // Logged in — pass through untouched
  if (isLoggedIn) {
    return children
  }

  // Not logged in — intercept click to open login dialog
  return (
    <>
      {cloneElement(children, {
        onClick: (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          setDialogOpen(true)
        },
      })}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to continue</DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              You need to be signed in to do that.
            </DialogDescription>
          </DialogHeader>
          <LoginForm onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
