import { cn } from "@/lib/utils"

export function ArrivalHeader({ className }: { className?: string }) {
  return (
    <header className={cn("py-12 md:py-16 text-center select-none", className)}>
      <h1 className="font-heading text-3xl md:text-4xl text-foreground/90 font-medium tracking-tight animate-fade-in">
        You’re here.
      </h1>
      <p className="mt-2 text-muted-foreground text-lg font-serif italic animate-fade-in animation-delay-200">
        Nothing else is required.
      </p>
    </header>
  )
}
