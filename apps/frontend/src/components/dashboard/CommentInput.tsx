'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/Text';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}

const INTENT_CHECK_DELAY = 1000; // 1 second delay before "Send" becomes active

export const CommentInput: React.FC<CommentInputProps> = ({ onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [intentChecked, setIntentChecked] = useState(false);
  const [showIntentPrompt, setShowIntentPrompt] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (!intentChecked) {
      setShowIntentPrompt(true);
      // Simulate "thinking time" - friction feature
      setTimeout(() => {
        setIntentChecked(true);
        setShowIntentPrompt(false);
      }, INTENT_CHECK_DELAY);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !intentChecked) return;
    onSubmit(content);
    setContent('');
    setIsFocused(false);
    setIntentChecked(false); // Reset for next time
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <AnimatePresence>
        {showIntentPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full mb-2 left-0 w-full bg-primary/10 text-primary p-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Is this helpful? Is this kind?</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 transition-all duration-300",
        isFocused && "bg-white/10 border-primary/30 ring-1 ring-primary/20"
      )}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => !content && setIsFocused(false)}
          placeholder={showIntentPrompt ? "Taking a moment..." : "Share a supportive thought..."}
          className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-text placeholder:text-text/30"
          disabled={isSubmitting}
        />
        
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || !intentChecked || isSubmitting}
          className={cn(
            "rounded-xl transition-all duration-300",
            (!content.trim() || !intentChecked) ? "opacity-50" : "opacity-100"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};
