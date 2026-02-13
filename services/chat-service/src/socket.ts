import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { structuredLog } from '@panchnity/utils';
import { UserPresenceModel } from './models/user-presence.model';
import { ConversationService } from './modules/conversations/conversation.service';
import { MessageService } from './modules/messages/message.service';
import { ModerationService } from './modules/moderation/moderation.service';
import { featureFlagService } from './config/feature-flags';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGINS || 'http://localhost:3002'; // Updated to frontend port
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET || 'dev_secret_key_123';

interface SocketUser {
  sub: string;
  email?: string;
}

export class SocketService {
  private static instance: SocketService;
  public io: SocketIOServer | null = null;
  private onlineUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(httpServer: HttpServer): void {
    if (this.io) return; // Already initialized

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ALLOWED_ORIGIN,
        methods: ['GET', 'POST'],
      },
      pingTimeout: 10000,
      pingInterval: 5000,
    });

    // Authentication Middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256', 'HS256'] }, (err: any, decoded: any) => {
        if (err) {
          return next(new Error('Authentication error: Invalid token'));
        }
        
        // Attach user info to socket
        (socket as any).user = decoded as SocketUser;
        next();
      });
    });

    this.io.on('connection', async (socket) => {
      const user = (socket as any).user as SocketUser;
      const userId = user.sub;
      
      // Join a room specific to this user (for direct targeting)
      socket.join(userId);
      
      // Send initial list of online users to the connecting user
      socket.emit('presence:initial', Array.from(this.onlineUsers.keys()));
      
      // Add to online users
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
        // First connection for this user, broadcast online status
        this.io?.emit('presence:update', { userId, status: 'online' });
      }
      this.onlineUsers.get(userId)?.add(socket.id);

      structuredLog('info', 'socket:connect', `User connected: ${userId}`, {
        userId,
        socketId: socket.id,
      });

      // Typing Handlers
      socket.on('presence:sync', () => {
        socket.emit('presence:initial', Array.from(this.onlineUsers.keys()));
      });

      socket.on('typing:start', async ({ conversationId }) => {
        try {
          // Check feature flag
          if (!featureFlagService.isEnabled('ENABLE_TYPING_INDICATORS')) {
            structuredLog('info', 'socket:typing_disabled', 'Typing indicators disabled via feature flag', { userId, conversationId });
            return;
          }

          const conversation = await ConversationService.findConversationById(conversationId);
          if (!conversation) return;

          const recipientId = conversation.participants.find((p: string) => p !== userId);
          if (!recipientId) return;

          // Check if blocked
          const isBlocked = await ModerationService.isBlocked(userId, recipientId as string);
          if (isBlocked) return; // Silently ignore typing from blocked users

          this.emitToUser(recipientId as string, 'typing:start', { userId, conversationId });
        } catch (error: any) {
          structuredLog('error', 'socket:typing_error', 'Error handling typing:start', { userId, conversationId, error });
        }
      });

      socket.on('typing:stop', async ({ conversationId }) => {
        try {
          // Check feature flag
          if (!featureFlagService.isEnabled('ENABLE_TYPING_INDICATORS')) {
            return; // Silently ignore when disabled
          }

          const conversation = await ConversationService.findConversationById(conversationId);
          if (!conversation) return;

          const recipientId = conversation.participants.find((p: string) => p !== userId);
          if (!recipientId) return;

          // Check if blocked
          const isBlocked = await ModerationService.isBlocked(userId, recipientId as string);
          if (isBlocked) return; // Silently ignore typing from blocked users

          this.emitToUser(recipientId as string, 'typing:stop', { userId, conversationId });
        } catch (error: any) {
          structuredLog('error', 'socket:typing_error', 'Error handling typing:stop', { userId, conversationId, error });
        }
      });

      socket.on('message:delivered', async ({ messageId }) => {
        try {
          await MessageService.markAsDelivered(messageId, userId);
        } catch (error: any) {
          structuredLog('error', 'socket:message_error', 'Error handling message:delivered', { userId, messageId, error });
        }
      });

      socket.on('conversation:markRead', async ({ conversationId }) => {
        try {
          await ConversationService.markAsRead(conversationId, userId);
          // Sync to other devices of the same user
          this.emitToUser(userId, 'conversation:read', { conversationId, userId });
        } catch (error: any) {
          structuredLog('error', 'socket:conversation_error', 'Error handling conversation:markRead', { userId, conversationId, error });
        }
      });

      /* 
       * DEPRECATED in V3: message:read relies on per-message flags which we are moving away from.
       * Keeping for backward compatibility but V3 clients should use conversation:markRead.
       */
      socket.on('message:read', async ({ conversationId }) => {
        try {
          await MessageService.markAsRead(conversationId, userId);
        } catch (error: any) {
          structuredLog('error', 'socket:message_error', 'Error handling message:read', { userId, conversationId, error });
        }
      });

      socket.on('disconnect', async (reason) => {
        const sockets = this.onlineUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.onlineUsers.delete(userId);
            
            // Last connection for this user, broadcast offline status and update last seen
            const lastSeen = new Date();
            this.io?.emit('presence:update', { userId, status: 'offline', lastSeen });
            
            try {
              await UserPresenceModel.findOneAndUpdate(
                { userId },
                { lastSeen },
                { upsert: true, new: true }
              );
            } catch (error: any) {
              structuredLog('error', 'socket:presence_error', 'Error updating lastSeen', { userId, error });
            }
          }
        }

        structuredLog('info', 'socket:disconnect', `User disconnected: ${userId}`, {
          userId,
          socketId: socket.id,
          reason,
        });
      });
    });

    structuredLog('info', 'socket:init', 'Socket.IO initialized');
  }

  public emitToUser(userId: string, event: string, payload: any): void {
    if (!this.io) {
      structuredLog('warn', 'socket:emit_failure', 'SocketService not initialized, cannot emit', { userId, event });
      return;
    }
    
    // Emit to the "room" named after the userId
    this.io.to(userId).emit(event, payload);
  }
}

export const socketService = SocketService.getInstance();

// Helper function to get IO instance
export const getIO = (): SocketIOServer => {
  const io = socketService.io;
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
