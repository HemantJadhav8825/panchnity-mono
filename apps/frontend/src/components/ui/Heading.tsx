import React from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading: React.FC<HeadingProps> = ({ level = 1, className, children, ...props }) => {
  const Tag = `h${level}` as const;
  
  const sizes = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
    2: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
    3: 'text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug',
    4: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
    5: 'text-lg md:text-xl font-semibold',
    6: 'text-base md:text-lg font-semibold',
  };

  const Component = Tag as React.ElementType;

  return (
    <Component className={cn('font-heading text-text', sizes[level], className)} {...props}>
      {children}
    </Component>
  );
};
