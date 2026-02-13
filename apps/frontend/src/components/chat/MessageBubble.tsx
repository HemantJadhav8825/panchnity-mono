import React from 'react';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/Text';
import { AlertCircle, RotateCcw, Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  isSelf: boolean;
  status?: 'sending' | 'sent' | 'failed';
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  timestamp?: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  isSelf,
  status = 'sent',
  deliveredAt,
  readAt,
  error,
  timestamp,
  isFirstInGroup = true,
  isLastInGroup = true,
  onRetry,
}) => {
  return (
    <div 
      className={cn(
        'flex w-full group relative transition-all duration-300',
        isSelf ? 'justify-end' : 'justify-start',
        isLastInGroup ? 'mb-4' : 'mb-0.5',
        status === 'sending' && 'opacity-70'
      )}
    >
      <div 
        className={cn(
          'max-w-[75%] lg:max-w-[65%] w-fit px-5 py-3 text-[15px] leading-relaxed transition-all duration-200 relative min-w-0 shadow-sm',
          // Adaptive Radius Logic
          isSelf 
            ? cn(
                'bg-primary text-primary-foreground',
                'rounded-2xl rounded-tr-sm',
                !isFirstInGroup && 'rounded-tr-2xl',
                !isLastInGroup && 'rounded-br-sm',
                status === 'failed' && 'bg-destructive text-destructive-foreground'
              )
            : cn(
                'bg-muted/40 backdrop-blur-sm text-foreground border border-border/40',
                'rounded-2xl rounded-tl-sm shadow-sm',
                !isFirstInGroup && 'rounded-tl-2xl',
                !isLastInGroup && 'rounded-bl-sm'
              )
        )}
      >
        <Text size="sm" className={cn(
          'block break-words [word-break:break-word] min-w-0 font-heading tracking-wide',
          isSelf ? 'text-primary-foreground' : 'text-foreground/90'
        )}>
          {content}
        </Text>
        
        {status === 'failed' && isSelf && (
          <div className="mt-2 flex items-center gap-2 pt-1 border-t border-white/20">
            <AlertCircle className="w-3 h-3" />
            <Text size="xs" className="text-[10px] flex-1">
              {error || 'Failed to send'}
            </Text>
            {onRetry && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                className="p-1 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Retry</span>
              </button>
            )}
          </div>
        )}

        {isSelf && status === 'sent' && (
          <div className="absolute right-2 bottom-1 flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
            {readAt ? (
              <CheckCheck className="w-3 h-3 text-white" />
            ) : deliveredAt ? (
              <CheckCheck className="w-3 h-3 text-white/60" />
            ) : (
              <Check className="w-3 h-3 text-white/60" />
            )}
          </div>
        )}
        
        {status === 'sending' && isSelf && (
          <div className="absolute -left-6 top-1/2 -translate-y-1/2">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        )}

        {timestamp && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap px-2',
            isSelf ? 'right-full' : 'left-full'
          )}>
            <Text size="xs" muted className="text-[10px] uppercase tracking-tighter">
              {timestamp}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};
