import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipantSettings {
  userId: string;
  isMuted: boolean;
  isArchived: boolean;
  lastReadAt: Date;
}

export interface IConversation extends Document {
  participants: string[]; // User IDs
  participantSettings: IParticipantSettings[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (v: string[]) => v.length === 2,
          message: 'A conversation must have exactly 2 participants.',
        },
        {
          validator: (v: string[]) => new Set(v).size === v.length,
          message: 'Participants must be unique.',
        }
      ],
    },
    participantSettings: [
      {
        userId: { type: String, required: true },
        isMuted: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        lastReadAt: { type: Date, default: new Date(0) }, // Default to epoch for old convos
      },
    ],
    lastMessageAt: { type: Date, default: Date.now },
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

// Index for quick participant lookup
ConversationSchema.index({ participants: 1 });
// Compound index for sorting conversations by last message
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });

// Index for archived conversation queries
ConversationSchema.index({ 'participantSettings.userId': 1, 'participantSettings.isArchived': 1 });
// Index for muted conversation queries
ConversationSchema.index({ 'participantSettings.userId': 1, 'participantSettings.isMuted': 1 });


export const ConversationModel = mongoose.model<IConversation>('Conversation', ConversationSchema);
