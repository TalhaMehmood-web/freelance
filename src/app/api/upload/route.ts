import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireApiAuth } from "@/lib/server/apiAuth"

const BUCKET      = "freelance-project"
const MAX_BYTES   = 3 * 1024 * 1024          // 3 MB
const ALLOWED     = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ─── POST /api/upload ─────────────────────────────────────────────────────────
// Body: multipart/form-data  { file: File, folder?: string }
// Returns: { url: string, path: string }

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file   = formData.get("file")
  const folder = (formData.get("folder") as string | null) ?? "uploads"

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed. Accepted: ${ALLOWED.join(", ")}` },
      { status: 422 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 3 MB limit" },
      { status: 422 }
    )
  }

  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path     = `${folder}/${filename}`

  const buffer   = Buffer.from(await file.arrayBuffer())
  const supabase = serviceClient()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl, path }, { status: 201 })
}

// ─── DELETE /api/upload ───────────────────────────────────────────────────────
// Body: JSON { path: string }

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  const path = body?.path as string | undefined

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "path is required" }, { status: 400 })
  }

  const supabase = serviceClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
