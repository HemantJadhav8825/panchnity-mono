import mongoose, { Schema, Document } from 'mongoose';

export interface IVent extends Document {
  author: {
    id: string;
    pseudonym: string;
    color: string;
  };
  content: string;
  mood?: string;
  expiresAt: Date;
  reactions: Array<{
    userId: string;
    type: 'SUPPORT' | 'HUG' | 'SAME' | 'LISTEN';
  }>;
  createdAt: Date;
}

const VentSchema: Schema = new Schema(
  {
    author: {
      id: { type: String, required: true },
      pseudonym: { type: String, required: true },
      color: { type: String, required: true },
    },
    content: { type: String, required: true, maxlength: 280 },
    mood: { type: String },
    expiresAt: { type: Date, required: true },
    reactions: [
      {
        userId: { type: String, required: true },
        type: { type: String, enum: ['SUPPORT', 'HUG', 'SAME', 'LISTEN'], required: true },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Vents are immutable
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        
        if (ret.author) {
          // Backward compatibility for old documents
          if ((ret.author as any).anonymousName && !ret.author.pseudonym) {
            ret.author.pseudonym = (ret.author as any).anonymousName;
          }
          if ((ret.author as any).anonymousColor && !ret.author.color) {
            ret.author.color = (ret.author as any).anonymousColor;
          }
          delete (ret.author as any).id;
        }

        if (ret.reactions && Array.isArray(ret.reactions)) {
          ret.reactions.forEach((r: any) => {
            if (r.userId) delete r.userId;
            if (r._id) delete r._id;
          });
        }

        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// TTL Index: Automatically delete documents when expiresAt is reached
VentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VentModel = mongoose.model<IVent>('Vent', VentSchema);
