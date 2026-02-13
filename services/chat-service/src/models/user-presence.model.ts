import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPresence extends Document {
  userId: string;
  lastSeen: Date;
  updatedAt: Date;
}

const UserPresenceSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    lastSeen: { type: Date, default: Date.now },
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

// Index for fast lookup by userId


export const UserPresenceModel = mongoose.model<IUserPresence>('UserPresence', UserPresenceSchema);
