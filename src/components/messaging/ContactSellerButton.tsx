"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { MessageCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/client/axios"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth/AuthButton"

interface ContactSellerButtonProps {
  sellerUserId: string
  className?:   string
}

export function ContactSellerButton({ sellerUserId, className }: ContactSellerButtonProps) {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () =>
      apiClient
        .post<{ conversationId: string }>("/api/conversations", {
          type:          "direct",
          participantId: sellerUserId,
        })
        .then((r) => r.data),
    onSuccess: ({ conversationId }) => {
      router.push(`/buyer/messages/${conversationId}`)
    },
    onError: () => {
      toast.error("Could not start conversation. Please try again.")
    },
  })

  return (
    <AuthButton>
      <Button
        variant="outline"
        className={className}
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending
          ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          : <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
        }
        {mutation.isPending ? "Opening…" : "Contact"}
      </Button>
    </AuthButton>
  )
}
