import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  userId: string;
  showReadReceipts: boolean;
  muteUnreadBadges: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    showReadReceipts: { type: Boolean, default: true },
    muteUnreadBadges: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);



export const UserSettingsModel = mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
