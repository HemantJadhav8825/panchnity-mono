import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'narrow';
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className,
  variant = 'default',
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "w-full mx-auto px-4 sm:px-6",
        "max-w-app-content", // 680px
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
