import React from 'react';
import { cn } from '@/lib/utils';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  muted?: boolean;
}

export const Text: React.FC<TextProps> = ({ 
  size = 'md', 
  weight = 'normal', 
  muted = false, 
  className, 
  children, 
  ...props 
}) => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <p 
      className={cn(
        'font-body text-text leading-relaxed',
        sizes[size],
        weights[weight],
        muted && 'text-text/60',
        className
      )} 
      {...props}
    >
      {children}
    </p>
  );
};
