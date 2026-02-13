'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyQuiet } from '@/illustrations/components/EmptyQuiet';
import { Sparkles, Brain, Shield, Users } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Top Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 text-center"
      >
        <Heading level={2} className="font-heading">This is your space.</Heading>
        <Text size="lg" muted>A calm harbor for your thoughts.</Text>
      </motion.div>

      {/* Primary Empty State */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center justify-center space-y-6"
      >
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <EmptyQuiet size="200" className="relative z-10" />
        </div>
        <div className="text-center space-y-2 max-w-sm px-6">
          <Text className="text-foreground/80 font-medium">
            &quot;You&apos;re here. That&apos;s enough for now.&quot;
          </Text>
          <Text size="sm" muted>
            Your space will grow with you, at your own pace.
          </Text>
        </div>
      </motion.div>

      {/* Future Zones (Visual Only) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FutureZoneCard 
          icon={Brain}
          title="Mindful Feed"
          description="A quiet stream of collective wisdom."
        />
        <FutureZoneCard 
          icon={Shield}
          title="Private Vault"
          description="Encrypted space for your deepest reflections."
        />
        <FutureZoneCard 
          icon={Users}
          title="Member Connect"
          description="Find resonance in shared experiences."
        />
      </div>
    </div>
  );
};

function FutureZoneCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType, 
  title: string, 
  description: string 
}) {
  return (
    <Card className="opacity-50 grayscale select-none border-dashed bg-muted/20">
      <CardContent className="pt-6">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary/40">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-semibold text-foreground/40">{title}</h3>
          <p className="text-xs text-muted-foreground/40 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
