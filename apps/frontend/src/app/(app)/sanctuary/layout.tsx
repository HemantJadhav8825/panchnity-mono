"use client"

import { env } from "@/config/env"
import { notFound, useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { markSanctuarySessionActive } from "@/lib/sanctuary-suppression"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { authService } from "@/api/auth.service"
import { AuthGuard } from "@/components/auth/AuthGuard"

export default function SanctuaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check feature flag
  const isEnabled = env.NEXT_PUBLIC_SANCTUARY_ENABLED === 'true'
  const { user, refreshUser } = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isEnabled) {
      markSanctuarySessionActive();
      
      // Skip auto-refresh logic on setup page to allow manual regeneration
      if (pathname === '/sanctuary/setup') return;

      // Auto-refresh token if we have a stale session (User has anonymous profile but token doesn't reflect it)
      // This happens if they created it in a past session but their current token is old/refreshed without the claim
      const checkAndRefreshToken = async () => {
        if (user?.anonymousProfile && !user.anonymousProfile.color) {
            const RETRY_KEY = 'sanctuary_refresh_retries';
            const retries = parseInt(sessionStorage.getItem(RETRY_KEY) || '0', 10);
            
            if (retries > 2) {
              console.error("SanctuaryLayout: Max refresh retries exceeded. Profile likely corrupted.");
              sessionStorage.removeItem(RETRY_KEY);
              // Force re-setup to fix corrupted profile
              router.push('/sanctuary/setup');
              return; 
            }

            try {
                console.log(`SanctuaryLayout: Refreshing token (Attempt ${retries + 1})...`)
                sessionStorage.setItem(RETRY_KEY, (retries + 1).toString());
                
                await authService.refresh()
                if (refreshUser) await refreshUser()
            } catch (e) {
                console.error("SanctuaryLayout: Token refresh failed", e)
            }
        } else {
             // If valid, clear retries
             sessionStorage.removeItem('sanctuary_refresh_retries');
        }
      }

      if (user) {
        checkAndRefreshToken()
      }
    }
  }, [isEnabled, user, refreshUser, pathname, router]);

  if (!isEnabled) {
    notFound()
  }

  return (
    <>
      {children}
    </>
  )
}
