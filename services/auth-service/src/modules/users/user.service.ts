import { User, UserCreateDTO } from './user.model';
import { UserModel } from './user.schema';
import { generateAnonymousProfile } from './anonymous-profile.util';

export class UserService {
  async findByEmail(email: string): Promise<any | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<any | null> {
    return UserModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<any | null> {
    return UserModel.findOne({ username }).exec();
  }

  async findByGoogleId(googleId: string): Promise<any | null> {
    return UserModel.findOne({ googleId }).exec();
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<any[]> {
    return UserModel.find({ isRevoked: false })
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async createUser(data: UserCreateDTO): Promise<any> {
    const user = new UserModel({
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      passwordHash: data.passwordHash,
      authProvider: data.authProvider,
      googleId: data.googleId,
      avatar: data.avatar,
      role: data.role,
      scopes: data.scopes,
    });
    return user.save();
  }

  async updateUser(id: string, data: Partial<User>): Promise<any | null> {
    return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async createAnonymousProfile(userId: string): Promise<any> {
    const anonymousProfile = generateAnonymousProfile();
    
    return UserModel.findByIdAndUpdate(
      userId,
      { $set: { anonymousProfile } },
      { new: true }
    ).exec();
  }
}
