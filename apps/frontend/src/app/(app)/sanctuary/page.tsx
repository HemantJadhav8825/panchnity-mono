"use client"

import { useEffect, useState } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useRouter } from "next/navigation"
import client from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Loader2, MessageCircle } from "lucide-react"
import { markSanctuaryInteraction } from "@/lib/sanctuary-suppression"
import { PageContainer } from "@/components/layout/PageContainer"

export default function SanctuaryPage() {
  const { user, isLoading } = useCurrentUser()
  const router = useRouter()
  const isReady = !isLoading && user && user.anonymousProfile

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (!user.anonymousProfile) {
      router.push('/sanctuary/setup')
    }
  }, [user, isLoading, router])

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">
          A moment of quiet.
        </h1>
        <p className="text-muted-foreground text-lg">
          This space is open to you. Your presence is enough.
        </p>
      </div>

      <div className="space-y-8 mb-16">
        {/* Global Vent / Feed Flow - Always leading towards the action */}
        <Card className="border-border bg-card shadow-none overflow-hidden">
          <CardContent className="p-0">
            <div className="p-8 text-center border-b border-border/50 bg-muted/20">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-medium mb-2">The Feed</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Thoughts here disappear after 24 hours. Nothing is required.
              </p>
              <Button size="lg" className="px-8 rounded-full" onClick={() => router.push('/sanctuary/feed')}>
                Write, if you want
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center justify-center pt-8 border-t border-dashed border-border text-center">
        <p className="text-xs text-muted-foreground mb-4">
          You&apos;re not alone. This will pass.
        </p>
        <Button variant="link" className="text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => {
          markSanctuaryInteraction();
          router.push('/');
        }}>
          Return to Panchnity
        </Button>
      </div>
    </PageContainer>
  )
}
