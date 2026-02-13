"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CommentDTO } from "../types";
import { getComments } from "../api/getComments";
import { createComment } from "../api/createComment";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  SendHorizontal,
  AlertCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { AnonymousAvatar } from "@/components/ui/anonymous-avatar";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

interface CommentDrawerProps {
  shareId: string;
  count?: number; // Not used for display, maybe for fetching logic if needed
  isOpen: boolean;
  onClose: () => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  shareId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [frictionWarning, setFrictionWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(shareId);
      // Ensure chronological order (oldest first)
      const sorted = data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setComments(sorted);
      scrollToBottom();
    } catch (err) {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, loadComments]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setFrictionWarning(false);

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentDTO = {
      id: tempId,
      authorId: user?.id || "temp",
      shareId,
      content: newComment,
      createdAt: new Date().toISOString(),
      anonymous: false, // Default for now, could be toggleable
      isOwner: true,
    };

    setComments((prev) => [...prev, optimisticComment]);
    setNewComment("");
    scrollToBottom();

    try {
      const created = await createComment(shareId, optimisticComment.content);
      // Replace optimistic
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? { ...created, isOwner: true } : c)),
      );
    } catch (err: any) {
      // 429 / Friction Check
      if (err.response?.status === 429 || err.message?.includes("pause")) {
        setFrictionWarning(true);
        // Restore input
        setNewComment(optimisticComment.content);
        // Remove optimistic
        setComments((prev) => prev.filter((c) => c.id !== tempId));
      } else {
        // Generic Error
        setError("Failed to post. Please try again.");
        setNewComment(optimisticComment.content);
        setComments((prev) => prev.filter((c) => c.id !== tempId));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] bg-background rounded-t-xl border-t shadow-2xl flex flex-col sm:max-w-md sm:mx-auto"
          >
            {/* Handle/Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="w-8" /> {/* Spacer */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto self-center absolute left-1/2 -translate-x-1/2 top-3" />
              <span className="font-medium text-sm">Responses</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && comments.length === 0 ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                comments.map((comment) => {
                  const isMe = comment.isOwner || comment.authorId === user?.id;
                  return (
                    <div
                      key={comment.id}
                      className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      {comment.anonymous ? (
                        <AnonymousAvatar
                          seed={`#${comment.authorId.slice(0, 6)}:?`}
                          size="sm"
                        />
                      ) : (
                        <ProfileAvatar size="sm" name="Member" />
                      )}
                      <div
                        className={`flex flex-col max-w-[85%] ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary rounded-bl-none"}`}
                        >
                          {comment.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {comments.length === 0 && !loading && (
                <div className="text-center text-muted-foreground py-8 text-sm px-8">
                  <p>No responses yet.</p>
                  <p className="mt-1 opacity-70">
                    Be the first to offer a gentle word.
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Friction Warning */}
            {frictionWarning && (
              <div className="mx-4 mb-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={16} />
                <span>Let&apos;s pause before responding again.</span>
                <button
                  onClick={() => setFrictionWarning(false)}
                  className="ml-auto"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-background mt-auto pb-8 sm:pb-4">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Send a gentle response..."
                  className="resize-none min-h-[44px] max-h-[120px] py-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || submitting}
                  className="shrink-0 mb-0.5"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <SendHorizontal size={18} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
