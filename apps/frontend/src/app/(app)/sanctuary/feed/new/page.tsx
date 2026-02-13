"use client"

import { useRouter } from "next/navigation"
import { CreateVent } from "@/components/sanctuary/create-vent"
import { Button } from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"

export default function NewVentPage() {
  const router = useRouter()

  const handlePosted = () => {
    // Navigate back to the feed after posting
    router.push('/sanctuary/feed')
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="pl-0 text-muted-foreground hover:text-foreground text-xs" 
          onClick={() => router.push('/sanctuary/feed')}
        >
          <ArrowLeft className="mr-2 h-3 w-3" /> Back to The Void
        </Button>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Release a thought
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Say it, then let it go.
        </p>
      </div>

      <CreateVent onPosted={handlePosted} />

      <div className="mt-8 text-center bg-muted/5 border border-dashed border-border/30 p-4 rounded-lg">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
          This post is ephemeral.<br/>
          It will be removed permanently in 24 hours.
        </p>
      </div>
    </div>
  )
}
