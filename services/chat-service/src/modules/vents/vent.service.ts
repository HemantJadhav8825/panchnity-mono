import { VentModel, IVent } from '../../models/vent.model';

export class VentService {
  async create(data: { 
    author: { id: string; pseudonym: string; color: string }; 
    content: string; 
  }): Promise<IVent> {
    // Soft limit: One active vent per user
    const activeVent = await VentModel.findOne({ 
      'author.id': data.author.id,
      expiresAt: { $gt: new Date() }
    });

    if (activeVent) {
      throw new Error('Limit reached: You can only have one active vent at a time.');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry (Hardcoded for v0)

    const vent = new VentModel({
      ...data,
      expiresAt,
      reactions: [],
    });
    return vent.save();
  }

  async getRecentFeed(limit: number = 20): Promise<IVent[]> {
    return VentModel.find({ expiresAt: { $gt: new Date() } })
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-author.id') // Ensure author.id is never exposed
      .exec();
  }

  async addReaction(ventId: string, userId: string, type: 'SUPPORT' | 'HUG' | 'SAME' | 'LISTEN'): Promise<IVent | null> {
    // Enforce one reaction per user per vent
    const vent = await VentModel.findById(ventId);
    if (!vent) return null;

    const existingReaction = vent.reactions.find(r => r.userId === userId);
    if (existingReaction) {
      throw new Error('You have already reacted to this vent.');
    }

    return VentModel.findByIdAndUpdate(
      ventId,
      {
        $push: { reactions: { userId, type } },
      },
      { new: true }
    ).select('-author.id').exec();
  }
}
