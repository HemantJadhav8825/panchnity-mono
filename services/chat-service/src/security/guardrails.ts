export const MAX_MESSAGE_LENGTH = 2000;

export class GuardrailService {
  private static userRates: Map<string, { count: number; lastReset: number }> = new Map();
  private static conversationRates: Map<string, { count: number; lastReset: number }> = new Map();

  private static RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
  private static MAX_MESSAGES_PER_WINDOW_USER = 5;
  private static MAX_MESSAGES_PER_WINDOW_CONV = 10;

  /**
   * Sanitizes content against XSS and script injection by escaping HTML.
   */
  public static sanitizeContent(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Checks if message exceeds length limit.
   */
  public static isLengthValid(content: string): boolean {
    return content.length <= MAX_MESSAGE_LENGTH;
  }

  /**
   * Checks and updates rate limits for user and conversation.
   * Returns true if allowed, false if rate limited.
   */
  public static checkRateLimit(userId: string, conversationId: string): boolean {
    const now = Date.now();

    // User Rate Limit
    if (!this.processLimit(this.userRates, userId, now, this.MAX_MESSAGES_PER_WINDOW_USER)) {
      return false;
    }

    // Conversation Rate Limit
    if (!this.processLimit(this.conversationRates, conversationId, now, this.MAX_MESSAGES_PER_WINDOW_CONV)) {
      return false;
    }

    return true;
  }

  private static processLimit(
    map: Map<string, { count: number; lastReset: number }>,
    id: string,
    now: number,
    limit: number
  ): boolean {
    let rate = map.get(id);

    if (!rate || now - rate.lastReset > this.RATE_LIMIT_WINDOW_MS) {
      rate = { count: 1, lastReset: now };
      map.set(id, rate);
      return true;
    }

    if (rate.count >= limit) {
      return false;
    }

    rate.count++;
    return true;
  }

  /**
   * Get remaining cooldown time in milliseconds for a user in a conversation.
   * Returns 0 if no cooldown is active.
   */
  public static getCooldownRemaining(userId: string, conversationId: string): number {
    const now = Date.now();
    
    // Check user rate limit
    const userRate = this.userRates.get(userId);
    if (userRate && userRate.count >= this.MAX_MESSAGES_PER_WINDOW_USER) {
      const userCooldown = this.RATE_LIMIT_WINDOW_MS - (now - userRate.lastReset);
      if (userCooldown > 0) return userCooldown;
    }

    // Check conversation rate limit
    const convRate = this.conversationRates.get(conversationId);
    if (convRate && convRate.count >= this.MAX_MESSAGES_PER_WINDOW_CONV) {
      const convCooldown = this.RATE_LIMIT_WINDOW_MS - (now - convRate.lastReset);
      if (convCooldown > 0) return convCooldown;
    }

    return 0;
  }
}
