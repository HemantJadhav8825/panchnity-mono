import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { ShieldCheck, X } from 'lucide-react';

interface MessageRequestConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetName: string;
}

export const MessageRequestConfirmation: React.FC<MessageRequestConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-3xl p-8 z-[70] shadow-2xl"
          >
            <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <Heading level={4}>Message Request</Heading>
                <Text size="sm" muted>
                  Sending an invitation to <strong>{targetName}</strong>.
                </Text>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl text-left">
                <Text size="xs" muted className="leading-relaxed">
                  They will choose whether to reply. You won&apos;t be able to send more messages until they accept.
                </Text>
              </div>

              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={onConfirm}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20"
                >
                  Send Request
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-3.5 text-foreground/40 text-sm font-medium hover:text-foreground transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
