"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/Button"

export function HeroActions() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button size="lg" className="px-8 flex gap-2" disabled>
            Loading...
        </Button>
      </div>
    )
  }

  if (isAuthenticated) {
    // If logged in, maybe "Go to Dashboard" is the primary action
    // Secondary "Learn More" can stay.
    return (
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/">
          <Button size="lg" className="px-8 flex gap-2">
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="#features">
          <Button variant="outline" size="lg" className="px-8">
            Learn More
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Link href="/signup">
        <Button size="lg" className="px-8 flex gap-2">
          Begin Journey <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="#features">
        <Button variant="outline" size="lg" className="px-8">
          Learn More
        </Button>
      </Link>
    </div>
  )
}
