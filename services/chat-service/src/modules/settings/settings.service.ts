import { UserSettingsModel } from '../../models/user-settings.model';

export class SettingsService {
  static async getSettings(userId: string) {
    let settings = await UserSettingsModel.findOne({ userId });
    if (!settings) {
      settings = await UserSettingsModel.create({ userId });
    }
    return settings;
  }

  static async updateSettings(userId: string, updates: { showReadReceipts?: boolean; muteUnreadBadges?: boolean }) {
    return UserSettingsModel.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );
  }
}
