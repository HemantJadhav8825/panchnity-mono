import { JwtSigner, TokenPayload } from '../../security/jwt';
import { ENV } from '../../config/env';
import { User } from '../users/user.model';

export class TokenService {
  async issueTokens(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      role: user.role,
      scopes: user.scopes,
      type: 'access',
      anonymousProfile: user.anonymousProfile,
    };

    const accessToken = JwtSigner.sign(payload, ENV.ACCESS_TOKEN_EXPIRES_IN);
    
    const refreshTokenPayload: TokenPayload = {
      ...payload,
      type: 'refresh',
    };
    const refreshToken = JwtSigner.sign(refreshTokenPayload, ENV.REFRESH_TOKEN_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN,
    };
  }

  async issueServiceToken(serviceName: string, scopes: string[]) {
    const payload: TokenPayload = {
      sub: serviceName,
      role: 'service',
      scopes,
      type: 'service',
    };

    return JwtSigner.sign(payload, '1h'); // Short TTL for service tokens
  }
}
