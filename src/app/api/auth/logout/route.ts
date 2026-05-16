import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/server/supabase"

export async function POST() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()
  cookieStore.delete("__role")

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))
}
