import { OAuth2Client } from 'google-auth-library';
import { ENV } from '../../config/env';

export class GoogleService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      ENV.GOOGLE_CLIENT_ID,
      ENV.GOOGLE_CLIENT_SECRET,
      ENV.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Exchanges an authorization code for tokens and verifies the ID token.
   * @param code The authorization code from the frontend
   * @returns Verified user information
   */
  async verifyCode(code: string, redirectUri?: string) {
    try {
      const finalRedirectUri = redirectUri || ENV.GOOGLE_REDIRECT_URI;
      
      const { tokens } = await this.client.getToken({
        code,
        redirect_uri: finalRedirectUri
      });
      
      const idToken = tokens.id_token;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: ENV.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid ID token payload');
      }

      return {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name,
        avatar: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (err: any) {
       console.error('[GoogleService] Error details:', err.response?.data || err.message);
       throw new Error('Failed to verify Google account: ' + (err.response?.data?.error_description || err.message));
    }
  }
}
