import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const role = cookieStore.get("__role")?.value ?? "buyer"
  redirect(`/${role}/dashboard`)
}
