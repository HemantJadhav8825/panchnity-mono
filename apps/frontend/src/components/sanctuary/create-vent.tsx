"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Button } from "@/components/ui/Button"
import client from "@/api/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Loader2, Send } from "lucide-react"
import { markSanctuaryInteraction } from "@/lib/sanctuary-suppression"

interface CreateVentProps {
  onPosted: () => void
}

export function CreateVent({ onPosted }: CreateVentProps) {
  const { user } = useCurrentUser()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLimitReached, setIsLimitReached] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setLoading(true)
    setError(null)
    try {
      const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:3200'

      const author = user?.anonymousProfile ? {
        id: user.id,
        pseudonym: user.anonymousProfile.pseudonym,
        color: user.anonymousProfile.color
      } : undefined;

      await client.post(`${chatApiUrl}/v1/vents`, {
        content,
        mood: 'neutral', // Default to neutral
        author
      })

      setContent("")
      markSanctuaryInteraction()
      onPosted()
    } catch (err: any) {
      console.error(err)
      if (err.response?.status === 429) {
        setIsLimitReached(true)
      } else {
        setError(err.response?.data?.error || "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const router = useRouter()

  if (isLimitReached) {
    return (
      <Card className="mb-6 border-border bg-muted/20 shadow-none">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              You’ve already released a thought today.
            </p>
            <p className="text-xs text-muted-foreground">
              This space opens again tomorrow.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pb-8 px-8">
          <Button
            variant="outline"
            className="w-full rounded-full bg-background border-border text-xs h-9"
            onClick={() => {
              markSanctuaryInteraction()
              router.push('/')
            }}
          >
            Return to Panchnity
          </Button>
          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
            onClick={() => {
              markSanctuaryInteraction()
              router.push('/')
            }}
          >
            Close Sanctuary
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-dashed bg-card shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vent into the void</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Textarea
            placeholder="You can write here, if you want."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none bg-muted/20 border-border focus-visible:ring-muted-foreground"
            rows={3}
            disabled={loading}
            maxLength={280}
          />
          <div className="flex justify-end pr-1">
            <span className={`text-[9px] uppercase tracking-widest ${content.length >= 250 ? 'text-orange-400' : 'text-muted-foreground/40'}`}>
              {content.length} / 280
            </span>
          </div>
        </div>
        {error && (
          <p className="text-[10px] text-muted-foreground text-center">
            {error}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="text-xs h-8"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Send className="h-3 w-3 mr-2" />}
          Release
        </Button>
      </CardFooter>
    </Card>
  )
}
