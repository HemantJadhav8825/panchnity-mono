import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"
import { AnonymousAvatar } from "@/components/ui/anonymous-avatar"
import { Badge } from "@/components/ui/Badge"

export interface Vent {
  id: string
  content: string
  mood: string
  createdAt: string
  expiresAt: string
  author: {
    id: string
    pseudonym: string
    color: string
  }
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
  }>
}

interface VentCardProps {
  vent: Vent
  onReact: (id: string, emoji: string) => void
}

export function VentCard({ vent, onReact }: VentCardProps) {
  // Construct seed for AnonymousAvatar (Format: "HEX:INITIALS")
  const initials = (vent.author?.pseudonym || "Anonymous")
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const avatarSeed = `${vent.author?.color || '#cccccc'}:${initials}`;

  return (
    <Card className="mb-4 overflow-hidden border-border bg-card shadow-none">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 text-sm pb-2">
        <AnonymousAvatar seed={avatarSeed} size="sm" />
        <div className="flex flex-col">
          <span className="text-muted-foreground">{vent.author.pseudonym}</span>
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
             {formatDistanceToNow(new Date(vent.createdAt))} ago
          </span>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{vent.content}</p>
      </CardContent>
      <CardFooter className="pt-2 flex gap-4 border-t border-border/50 mt-2 bg-muted/5">
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => onReact(vent.id, 'SUPPORT')}>
          <Heart className="h-3 w-3" />
          <span>Support</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => onReact(vent.id, 'HUG')}>
            🫂 Hug
        </Button>
         <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => onReact(vent.id, 'SAME')}>
            ✋ Me too
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/40 hover:text-red-400">
          <AlertCircle className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}
