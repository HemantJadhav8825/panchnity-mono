import { cn } from "@/lib/utils"

interface AnonymousAvatarProps {
  seed: string; // Format: "HEXCOLOR:INITIALS" e.g. "#FF5733:BW"
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AnonymousAvatar({ seed, className, size = 'md' }: AnonymousAvatarProps) {
  const [color, initials] = seed.split(':');

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
    xl: "h-24 w-24 text-3xl"
  };

  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-background",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color || '#ccc' }}
    >
      {initials || '?'}
    </div>
  );
}
