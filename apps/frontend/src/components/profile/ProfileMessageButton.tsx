import React, { useState } from 'react';
import { MessageCircle, Check } from 'lucide-react';
import { MessageRequestConfirmation } from './MessageRequestConfirmation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileMessageButtonProps {
  targetName: string;
}

export const ProfileMessageButton: React.FC<ProfileMessageButtonProps> = ({ targetName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleConfirm = () => {
    setStatus('sending');
    // Simulate intent processing
    setTimeout(() => {
      setStatus('sent');
      setIsModalOpen(false);
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => status === 'idle' && setIsModalOpen(true)}
        disabled={status !== 'idle'}
        className={cn(
          "relative flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm",
          status === 'idle' 
            ? "bg-muted hover:bg-muted/80 text-foreground active:scale-95" 
            : "bg-primary/10 text-primary cursor-default"
        )}
      >
        <AnimatePresence mode="wait">
          {status === 'sent' ? (
            <motion.div 
              key="sent"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Invitation Sent</span>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{status === 'sending' ? 'Sending...' : 'Message'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <MessageRequestConfirmation 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        targetName={targetName}
      />
    </>
  );
};
