import mongoose, { Schema, Document } from 'mongoose';

export interface ICircle extends Document {
  name: string;
  description: string;
  rules: string[];
  tags: string[];
  subscribers: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}

const CircleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    rules: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    subscribers: { type: [String], default: [] },
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

// Index for search
CircleSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const CircleModel = mongoose.model<ICircle>('Circle', CircleSchema);
