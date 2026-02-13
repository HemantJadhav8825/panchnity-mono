import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockedUser extends Document {
  blockerId: string;
  blockedUserId: string;
  createdAt: Date;
}

const BlockedUserSchema: Schema = new Schema(
  {
    blockerId: {
      type: String,
      required: true,
      index: true,
    },
    blockedUserId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// Compound unique index to prevent duplicate blocks
BlockedUserSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });

export const BlockedUserModel = mongoose.model<IBlockedUser>('BlockedUser', BlockedUserSchema);
