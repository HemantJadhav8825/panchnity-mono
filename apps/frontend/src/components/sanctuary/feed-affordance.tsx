"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { MessageSquarePlus } from "lucide-react"

interface SanctuaryFeedAffordanceProps {
  remainingTime?: number; // milliseconds
}

export function SanctuaryFeedAffordance({ remainingTime = 0 }: SanctuaryFeedAffordanceProps) {
  const router = useRouter()
  
  if (remainingTime > 0) {
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const timeString = `${hours}h ${minutes}m`;

    return (
      <div 
        className="group mb-8 rounded-xl border border-dashed border-border/40 bg-muted/10 p-6 opacity-70 cursor-not-allowed"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/20 text-muted-foreground">
            <MessageSquarePlus className="h-5 w-5 opacity-50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              The space is quiet for now
            </p>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
              Next release available in <span className="font-medium text-foreground/80">{timeString}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={() => router.push('/sanctuary/feed/new')}
      className="group mb-8 cursor-pointer rounded-xl border border-dashed border-border/60 bg-muted/5 p-6 transition-all hover:bg-muted/10 hover:border-border"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/20 text-muted-foreground transition-colors group-hover:bg-primary/5 group-hover:text-primary/70">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            Release a thought
          </p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-tighter">
            This will disappear after 24 hours
          </p>
        </div>
      </div>
    </div>
  )
}
