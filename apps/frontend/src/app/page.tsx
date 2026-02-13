'use client';

import Link from "next/link"
import { ArrivalHeader } from "@/components/home/ArrivalHeader"
import { SanctuaryEntryCard } from "@/components/home/SanctuaryEntryCard"
import { QuietFooter } from "@/components/home/QuietFooter"
import { Container } from "@/components/ui/Container"
import { ThemeToggle } from "@/components/theme-toggle"
import { HomeHeaderActions } from "@/components/home/HomeHeaderActions"
import { brand } from "@/config/brand"
import { useAuth } from "@/context/AuthContext"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { DashShell } from "@/components/layout/DashShell"
import { DashboardHome } from "@/components/dashboard/DashboardHome"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AuthGuard>
        <DashShell>
          <DashboardHome />
        </DashShell>
      </AuthGuard>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Global Navigation (kept for utility) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="flex h-14 items-center justify-between">
          <div className="font-heading text-lg font-bold tracking-tight text-foreground/80">
            {brand.PRODUCT_NAME}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <HomeHeaderActions />
          </div>
        </Container>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <Container className="max-w-2xl">
          <ArrivalHeader />
          <SanctuaryEntryCard />
        </Container>
      </main>

      <QuietFooter />
    </div>
  )
}
