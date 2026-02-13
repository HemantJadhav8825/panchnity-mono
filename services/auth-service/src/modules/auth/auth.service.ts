import { UserService } from '../users/user.service';
import { TokenService } from '../tokens/token.service';
import { PasswordHasher } from '../../security/password';
import { JwtSigner } from '../../security/jwt';
import { CONSTANTS } from '../../config/constants';
import { GoogleService } from './google.service';

const userService = new UserService();
const tokenService = new TokenService();
const googleService = new GoogleService();

export class AuthService {
  async register(data: any) {
    const existing = await userService.findByEmail(data.email);
    if (existing) throw new Error('User already exists');

    const emailPrefix = data.email.split('@')[0];
    const baseUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    // Generate unique username
    let username = baseUsername || 'user';
    let suffix = 1;
    while (await userService.findByUsername(username)) {
       username = `${baseUsername}_${suffix}`;
       suffix++;
    }

    const passwordHash = await PasswordHasher.hash(data.password);
    return userService.createUser({
      email: data.email,
      username: data.username || username,
      displayName: data.displayName || (emailPrefix ? (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)) : 'Member'),
      passwordHash,
      authProvider: 'email',
      role: CONSTANTS.ROLES.USER,
      scopes: [CONSTANTS.SCOPES.READ],
    });
  }

  async login(email: string, pass: string) {
    const user = await userService.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    
    if (user.authProvider !== 'email' || !user.passwordHash) {
      throw new Error('Please use Google Login for this account');
    }

    const valid = await PasswordHasher.compare(pass, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const tokens = await tokenService.issueTokens(user);
    return {
      ...tokens,
      user: {
        id: user._id || user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar,
      }
    };
  }

  async googleLogin(code: string, redirectUri?: string) {
    const googleUser = await googleService.verifyCode(code, redirectUri);
    
    let user = await userService.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Check for email collision
      user = await userService.findByEmail(googleUser.email);

      if (user) {
        // Link Google account to existing email user
        user = await userService.updateUser(user.id, {
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
          // Sync displayName if missing
          displayName: user.displayName || googleUser.name || 'Member',
          authProvider: 'google',
        });
      } else {
        // Create new Google user
        const emailPrefix = googleUser.email.split('@')[0];
        const baseUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        // Ensure unique username for Google users
        let username = baseUsername || 'user';
        let suffix = 1;
        while (await userService.findByUsername(username)) {
          username = `${baseUsername}_${suffix}`;
          suffix++;
        }
        
        user = await userService.createUser({
          email: googleUser.email,
          username: username,
          displayName: googleUser.name || (emailPrefix ? (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)) : 'Member'),
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
          authProvider: 'google',
          role: CONSTANTS.ROLES.USER,
          scopes: [CONSTANTS.SCOPES.READ],
        });
      }
    }

    const tokens = await tokenService.issueTokens(user);
    return {
      ...tokens,
      user: {
        id: user._id || user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar,
      }
    };
  }

  async refresh(token: string) {
    try {
      const payload = JwtSigner.verify(token);
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      const user = await userService.findById(payload.sub);
      if (!user || user.isRevoked) {
        throw new Error('User not found or revoked');
      }

      return tokenService.issueTokens(user);
    } catch (err: any) {
      throw new Error('Invalid refresh token: ' + err.message);
    }
  }
}
