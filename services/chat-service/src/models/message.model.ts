import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  clientMessageId?: string;
  senderId: string;
  content: string;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    clientMessageId: { type: String, unique: true, sparse: true }, // sparse because old messages don't have it
    senderId: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Messages are immutable
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Index for pagination and conversation lookup
MessageSchema.index({ conversationId: 1, createdAt: -1 });
// Compound index for sender specific queries
MessageSchema.index({ conversationId: 1, senderId: 1, createdAt: -1 });

// Sparse indexes for status queries
MessageSchema.index({ deliveredAt: 1 }, { sparse: true });
MessageSchema.index({ readAt: 1 }, { sparse: true });


export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
