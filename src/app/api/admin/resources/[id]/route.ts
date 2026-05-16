import { NextResponse } from "next/server"
import { deleteResource } from "@/actions/admin/permissions"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await deleteResource(id)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
}
