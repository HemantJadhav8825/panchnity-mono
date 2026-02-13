"use client"

import { useConversationsContext } from "@/context/ConversationsContext"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function ChatOverview() {
  const { conversations, isLoading } = useConversationsContext()
  const { user, isLoading: authLoading } = useCurrentUser()
  const router = useRouter()

  if (authLoading || !user) {
      return null;
  }

  // Filter and sort conversations
  const recentConversations = conversations
    .filter(chat => {
        // Must have at least one other participant we can identify
        return chat.participants.some(p => {
            const pId = typeof p === 'string' ? p : p.id;
            return pId !== user?.id;
        });
    })
    .slice(0, 3); // Take top 3

  if (isLoading) {
      return null; // Silent load on home page
  }

  const hasConversations = recentConversations.length > 0;

  if (!hasConversations) return null; // Don't show the empty state box on Home page if logged in but no chats

  return (
    <section className="max-w-2xl mx-auto mb-20 px-6">
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-6 text-center">Recent Connections</h3>
        <div className="grid gap-2">
          {recentConversations.map((chat) => {
             // Find the other participant
             // Participants can be string or object. If object, use displayName or username.
             const otherParticipant = chat.participants.find(p => {
                 const pId = typeof p === 'string' ? p : p.id;
                 return pId !== user?.id;
             });

             let name = "Visitor";
             if (otherParticipant && typeof otherParticipant !== 'string') {
                 name = otherParticipant.displayName || otherParticipant.username || "Visitor";
             } else if (otherParticipant) {
                 // If it's just an ID, we don't have the name yet.
                 // In Sanctuary, we might want to show "Anonymous" or similar.
                 name = "Visitor"; 
             }

             // Format time nicely (e.g., "Just now", "2h", "1d")
             const date = new Date(chat.lastMessageAt);
             const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

             return (
                  <div 
                    key={chat.id} 
                    className="p-5 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group border border-border/5"
                    onClick={() => router.push(`/messages/${chat.id}`)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-foreground/70 group-hover:text-foreground text-sm tracking-tight">{name}</span>
                      <span className="text-[10px] text-muted-foreground/30 uppercase tracking-tighter">{timeString}</span>
                    </div>
                    <div className="text-xs text-muted-foreground/60 truncate group-hover:text-muted-foreground/80 transition-colors">
                        {chat.lastMessageContent || "Speak only when you feel the call."}
                    </div>
                  </div>
             )
          })}
        </div>
      </div>
    </section>
  )
}
