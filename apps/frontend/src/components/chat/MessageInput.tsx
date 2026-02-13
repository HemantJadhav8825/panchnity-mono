import React, { useState } from 'react';
import { Send, Smile, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import type { EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  onSend?: (message: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  className?: string;
}

const MAX_LENGTH = 2000;

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, onTypingChange, className }) => {
  const [message, setMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const isTooLong = message.length > MAX_LENGTH;
  const isNotEmpty = message.trim().length > 0;
  const canSend = isNotEmpty && !isTooLong;

  const handleSend = () => {
    if (canSend && onSend) {
      onSend(message);
      setMessage('');
      setShowEmojiPicker(false);
      if (isTyping) {
        setIsTyping(false);
        onTypingChange?.(false);
      }
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || message.length;
    const end = input.selectionEnd || message.length;
    
    const newValue = message.substring(0, start) + emojiData.emoji + message.substring(end);
    
    setMessage(newValue);
    
    // Defer cursor update to next tick after React render
    setTimeout(() => {
        if (inputRef.current) {
            const newCursorPos = start + emojiData.emoji.length;
            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            inputRef.current.focus();
        }
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    if (!isTyping && newValue.trim().length > 0) {
      setIsTyping(true);
      onTypingChange?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingChange?.(false);
    }, 3000);
  };

  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className={cn('p-4 bg-background border-t border-border', className)}>
      <div className="relative flex flex-col gap-2">
        <div className="relative flex items-center gap-2 bg-muted/30 border border-border rounded-full px-4 py-1.5 transition-colors">
          <div className="relative">
            <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                    "p-1 hover:text-primary transition-colors", 
                    showEmojiPicker && "text-primary"
                )}
            >
                <Smile className="w-5 h-5 text-muted-foreground" />
            </button>
            {showEmojiPicker && (
                <EmojiPicker onEmojiClick={handleEmojiClick} />
            )}
          </div>
          
          <input 
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Write something..."
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />

          <div className="flex items-center gap-1">
            {!message.trim() && (
              <button className="p-1 hover:text-primary transition-colors opacity-40 cursor-not-allowed">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            
            <button 
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'p-2 rounded-full transition-all active:scale-90',
                canSend ? 'bg-primary text-primary-foreground' : 'text-muted-foreground opacity-20'
              )}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
        
        {message.length > MAX_LENGTH * 0.8 && (
          <div className="flex justify-end px-4">
            <span className={cn(
              "text-[10px] font-medium tracking-widest uppercase",
              isTooLong ? "text-destructive" : "text-muted-foreground opacity-40"
            )}>
              {message.length} / {MAX_LENGTH}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
