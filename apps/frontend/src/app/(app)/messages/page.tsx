'use client';

import React from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { DashShell } from '@/components/layout/DashShell';

export default function MessagesPage() {
  return (
    <div className="h-full w-full">
       <ChatLayout />
    </div>
  );
}
