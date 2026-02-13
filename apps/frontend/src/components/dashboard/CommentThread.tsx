'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { MessageCircle, CornerDownRight, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommentInput } from './CommentInput';

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isAuthor?: boolean; // If true, highlights as the OP
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  onReply: (parentId: string, content: string) => void;
}

const MAX_VISIBLE_REPLIES = 3;

export const CommentThread: React.FC<CommentThreadProps> = ({ comments, onReply }) => {
  return (
    <div className="space-y-6 mt-6">
      {comments.map((comment) => (
        <CommentNode key={comment.id} comment={comment} onReply={onReply} />
      ))}
    </div>
  );
};

const CommentNode: React.FC<{ comment: Comment; onReply: (id: string, c: string) => void }> = ({ comment, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  // Auto-collapse logic
  const hasManyReplies = (comment.replies?.length || 0) > MAX_VISIBLE_REPLIES;
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, MAX_VISIBLE_REPLIES);

  return (
    <div className="group">
      {/* Main Comment */}
      <div className={cn(
        "p-4 rounded-2xl space-y-2 transition-colors",
        comment.isAuthor ? "bg-primary/5 border border-primary/10" : "bg-white/5 hover:bg-white/[0.07]"
      )}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
              comment.isAuthor ? "bg-primary text-background" : "bg-white/10 text-white/60"
            )}>
              {comment.author[0]}
            </div>
            <Text size="xs" weight="semibold" className="text-text/70">
              {comment.author} {comment.isAuthor && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">OP</span>}
            </Text>
            <Text size="xs" muted>• {comment.timestamp}</Text>
          </div>
          
          {/* Action: Report / Concern */}
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text/20 hover:text-red-400" aria-label="Raise Concern">
            <ShieldAlert className="w-3 h-3" />
          </button>
        </div>

        <Text size="sm" className="leading-relaxed pl-8 text-text/90">
          {comment.content}
        </Text>

        <div className="flex items-center gap-4 pl-8 pt-1">
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="text-[10px] uppercase font-bold tracking-widest text-text/40 hover:text-primary transition-colors flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            Reply
          </button>
        </div>
      </div>

      {/* Reply Input */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-8 mt-2"
          >
            <div className="border-l-2 border-white/5 pl-4 py-2">
              <CommentInput 
                onSubmit={(content) => {
                  onReply(comment.id, content);
                  setIsReplying(false);
                }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies (Method: Flat Hierarchy - Max Depth 1) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 mt-2 space-y-2">
           {visibleReplies?.map((reply) => (
             <div key={reply.id} className="relative pl-6 py-2">
               {/* Connector Line */}
               <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="absolute top-4 left-0 w-4 h-px bg-white/5 group-hover:bg-white/10" />
               </div>
               
               <div className="bg-white/5 p-3 rounded-xl hover:bg-white/[0.08] transition-colors">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50">{reply.author[0]}</div>
                   <Text size="xs" weight="medium" className="text-text/60">{reply.author}</Text>
                   <Text size="xs" muted>• {reply.timestamp}</Text>
                 </div>
                 <Text size="sm" className="text-text/80">{reply.content}</Text>
               </div>
             </div>
           ))}

           {/* Auto-collapse trigger */}
           {hasManyReplies && !showAllReplies && (
             <div className="pl-6">
               <button 
                 onClick={() => setShowAllReplies(true)}
                 className="text-xs text-primary/60 hover:text-primary flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-primary/5 transition-colors w-full text-left"
               >
                 <CornerDownRight className="w-3 h-3" />
                 View {comment.replies.length - MAX_VISIBLE_REPLIES} more supportive replies
               </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
