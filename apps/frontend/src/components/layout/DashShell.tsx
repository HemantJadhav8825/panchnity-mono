import React from 'react';
import { cn } from '@/lib/utils';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';
import { usePathname } from 'next/navigation';

interface DashShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const DashShell: React.FC<DashShellProps> = ({ children, fullWidth = false }) => {
  const pathname = usePathname();
  const isMessages = pathname.startsWith('/messages');
  const shouldBeFullWidth = fullWidth || isMessages;

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Mobile Top Bar */}
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <SidebarNav />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 h-full pt-14 lg:pt-0 flex flex-col overflow-hidden">
          <div className={cn(
            'flex-1 flex flex-col w-full min-w-0 min-h-0 overflow-y-auto',
            !shouldBeFullWidth && 'w-full max-w-app-content mx-auto px-4 sm:px-6'
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
