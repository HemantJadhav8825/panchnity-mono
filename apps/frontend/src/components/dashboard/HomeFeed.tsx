'use client';

import React from 'react';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Aura } from '@/components/ui/Aura';
import { motion } from 'framer-motion';
import { PlusCircle, HeartHandshake } from 'lucide-react';
import { CreatePost } from './CreatePost';
import { useState } from 'react';
import { ResonanceTray } from './ResonanceTray';
import { CommentInput } from './CommentInput';
import { CommentThread } from './CommentThread';
import { cn } from '@/lib/utils';

export const HomeFeed: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([
    {
      id: '1',
      content: "Simply holding space for myself today. It&apos;s darker than usual, but I know the light returns. Just need to sit with it for a while.",
      author: 'Anonymous Soul',
      timestamp: '2h ago',
      visibility: 'community',
      reactions: [] as string[]
    }
  ]);

  const [activeTrayId, setActiveTrayId] = useState<string | null>(null);

  const handleReaction = (postId: string, type: string) => {
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        return { ...p, reactions: [...p.reactions, type] };
      }
      return p;
    }));
    setActiveTrayId(null);
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
        <div className="relative">
          <Aura color="#60A5FA" size={280} className="mb-4" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
             <div className="w-32 h-32 rounded-full glass flex items-center justify-center">
                <PlusCircle className="w-12 h-12 text-primary/40" />
             </div>
          </motion.div>
        </div>

        <div className="space-y-4 max-w-sm">
          <Heading level={3}>The space is quiet.</Heading>
          <Text size="lg" muted>
            This is your private canvas and a gateway to the community. When you&apos;re ready, share your first reflection.
          </Text>
        </div>

        <Button 
          size="lg" 
          className="px-10 group"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
          Share a Reflection
        </Button>

        <CreatePost 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onPost={(content, visibility, isAnonymous) => {
            const newPost = {
              id: Date.now().toString(),
              content,
              author: isAnonymous ? 'Anonymous Soul' : 'You',
              timestamp: 'Just now',
              visibility,
              reactions: []
            };
            setPosts([newPost, ...posts]);
            setIsModalOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 relative">
       {/* Header Action */}
       <div className="flex justify-between items-center mb-6">
        <Heading level={4}>Community Reflections</Heading>
        <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-5 h-5" />
        </Button>
      </div>

      {posts.map(post => (
        <motion.div 
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-3xl space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary/40" />
            </div>
            <div>
              <Text weight="bold" size="sm" className="leading-none">{post.author}</Text>
              <Text size="xs" muted>{post.timestamp} • {post.visibility}</Text>
            </div>
          </div>

          <Text size="lg" className="leading-relaxed font-serif">
            &quot;{post.content}&quot;
          </Text>


          {/* Footer / Interaction Zone */}
          <div className="flex flex-col gap-4 pt-4 border-t border-text/5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {post.reactions.length > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5">
                    <div className="flex -space-x-1">
                        {/* Aura Dots representing resonance without numbers */}
                        {[...Array(Math.min(3, post.reactions.length))].map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                    <Text size="xs" weight="medium" className="text-primary/60">
                      Community is holding space
                    </Text>
                  </div>
                ) : (
                  <Text size="xs" muted className="italic">Be the first to resonate</Text>
                )}
              </div>

              <div className="relative flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn("rounded-full px-3", activeTrayId === post.id && "bg-primary/10")}
                  onClick={() => setActiveTrayId(activeTrayId === post.id ? null : post.id)}
                >
                  <HeartHandshake className="w-5 h-5 text-text/40" />
                </Button>
                
                <ResonanceTray 
                  isOpen={activeTrayId === post.id}
                  onClose={() => setActiveTrayId(null)}
                  onSelect={(type) => handleReaction(post.id, type)}
                />
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
               {/* Top Level Input */}
               <CommentInput 
                 onSubmit={(content: string) => {
                   setPosts(current => current.map(p => {
                     if (p.id === post.id) {
                       return {
                         ...p,
                         comments: [
                           ...(p.comments || []),
                           {
                             id: Date.now().toString(),
                             author: 'You',
                             content: content,
                             timestamp: 'Just now',
                             isAuthor: true,
                             replies: []
                           }
                         ]
                       };
                     }
                     return p;
                   }));
                 }} 
               />
               
               {/* Thread */}
               {(post.comments && post.comments.length > 0) && (
                 <CommentThread 
                   comments={post.comments} 
                   onReply={(parentId: string, content: string) => {
                      setPosts(current => current.map(p => {
                        if (p.id === post.id) {
                          // Find parent and add reply (simplified for depth 1)
                          const updatedComments = p.comments.map((c: any) => {
                             if (c.id === parentId) {
                               return {
                                 ...c,
                                 replies: [
                                   ...(c.replies || []),
                                   {
                                     id: Date.now().toString(),
                                     author: 'You',
                                     content: content,
                                     timestamp: 'Just now'
                                   }
                                 ]
                               };
                             }
                             return c;
                          });
                          return { ...p, comments: updatedComments };
                        }
                        return p;
                      }));
                   }}
                 />
               )}
            </div>
          </div>
        </motion.div>
      ))}

      <CreatePost 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPost={(content, visibility, isAnonymous) => {
          const newPost = {
            id: Date.now().toString(),
            content,
            author: isAnonymous ? 'Anonymous Soul' : 'You',
            timestamp: 'Just now',
            visibility,
            reactions: []
          };
          setPosts([newPost, ...posts]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
