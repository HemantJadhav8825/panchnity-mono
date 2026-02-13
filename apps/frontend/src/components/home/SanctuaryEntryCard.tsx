"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export function SanctuaryEntryCard() {
  const router = useRouter()

  return (
    <section className="mb-16">
      <Card className="max-w-md mx-auto bg-muted/30 border-none shadow-sm hover:shadow-md transition-shadow duration-500">
        <CardContent className="p-8 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-foreground/80">
              A space that’s open to you.
            </h2>
            <p className="text-muted-foreground text-sm">
              Anonymous. No pressure.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              className="w-full sm:w-auto font-normal rounded-full px-8"
              onClick={() => router.push('/sanctuary')}
              data-testid="sanctuary-release-btn"
            >
              Enter, if you want
            </Button>
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto font-normal rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => {}}
              data-testid="sanctuary-read-btn"
            >
              Just be here
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
