import bcrypt from 'bcryptjs';

export const PasswordHasher = {
  hash: async (password: string): Promise<string> => {
    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  },
  
  compare: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  }
};
