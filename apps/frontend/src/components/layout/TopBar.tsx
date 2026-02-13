import React from 'react';
import { Heading } from '@/components/ui/Heading';
import { brand } from '@/config/brand';
import { MessageCircle, User } from 'lucide-react';
import Link from 'next/link';

export const TopBar: React.FC = () => {
  return (
    <header className="lg:hidden fixed top-0 left-0 w-full h-14 bg-background border-b border-border z-40 flex items-center justify-between px-4">
      <Link href="/">
        <Heading level={5} className="text-primary font-bold tracking-tight">
          {brand.PRODUCT_NAME}
        </Heading>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link href="/messages" className="p-1 hover:text-primary transition-colors">
          <MessageCircle className="w-6 h-6" />
        </Link>
        <Link href="/profile" className="p-1 hover:text-primary transition-colors">
          <User className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
};
