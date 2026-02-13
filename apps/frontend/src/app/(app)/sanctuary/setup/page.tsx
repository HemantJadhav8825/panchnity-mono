"use client"

import { useState } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import client from "@/api/client"
import { authService } from "@/api/auth.service"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"
import { AnonymousAvatar } from "@/components/ui/anonymous-avatar"
import { Loader2, RefreshCw, Check, Shield } from "lucide-react"
import { toast } from "sonner" 
import { useRouter } from "next/navigation"

export default function AnonymousSetupPage() {
  const { user, refreshUser } = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreateIdentity = async () => {
    try {
      setLoading(true)
      // client baseURL is NEXT_PUBLIC_API_URL (auth service)
      const res = await client.post('/v1/users/anonymous', { userId: user?.id })

      toast.success(`Welcome to the sanctuary, ${res.data.pseudonym}!`)
      
      // Refresh token to include the new anonymousProfile in the JWT
      try {
        await authService.refresh()
      } catch (refreshError) {
        console.error("Failed to refresh token after setup:", refreshError)
      }

      if (refreshUser) await refreshUser()
      
      router.push('/sanctuary')
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card className="w-full border-2 border-primary/10 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Sanctuary</CardTitle>
          <CardDescription>
            A quiet space that is open. 
            <br/>Your real identity will be hidden.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="bg-muted/50 p-6 rounded-xl border border-border/50 text-center space-y-4">
             <p className="text-sm text-muted-foreground">You will be assigned a random nature-inspired identity.</p>
             <div className="flex justify-center py-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 animate-pulse flex items-center justify-center text-3xl">
                    ?
                  </div>
                </div>
             </div>
             <p className="font-medium italic text-muted-foreground">&quot;Quiet River&quot;, &quot;Brave Oak&quot;, &quot;Calm Sky&quot;...</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground bg-yellow-500/5 p-4 rounded-lg border border-yellow-500/10">
            <p className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>No real names or photos allowed.</span>
            </p>
            <p className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Posts are ephemeral (24h).</span>
            </p>
            <p className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Kindness is mandatory.</span>
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            onClick={handleCreateIdentity} 
            className="w-full h-12 text-lg shadow-lg shadow-primary/20" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Enter Sanctuary
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
