import { cn } from "@/lib/utils"

export function QuietFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("py-12 text-center opacity-60 hover:opacity-100 transition-opacity select-none", className)}>
      <div className="w-12 h-px bg-border mx-auto mb-6" />
      <blockquote className="font-serif italic text-muted-foreground text-sm">
        &quot;Belonging doesn&apos;t ask you to change.&quot;
      </blockquote>
    </footer>
  )
}
