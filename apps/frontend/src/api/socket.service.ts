import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./client";
import { env } from "@/config/env";

const CHAT_API_URL = env.NEXT_PUBLIC_CHAT_API_URL;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const token = getAccessToken();
    if (!token) return;

    this.socket = io(CHAT_API_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep Trying
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      // Trigger a state resync when reconnected
      this.listeners.get("reconnected")?.forEach(cb => cb());
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      console.log(`Socket reconnection attempt: ${attempt}`);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed after maximum attempts");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    this.socket.on("ping", () => {
      this.socket?.emit("pong");
    });

    // Reattach listeners if any were added before connection
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => this.socket?.on(event, cb));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (...args: any[]) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, payload: any) {
    if (this.socket) {
      this.socket.emit(event, payload);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
