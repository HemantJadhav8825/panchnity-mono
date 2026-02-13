import mongoose, { Schema, Document } from 'mongoose';

export type ReportReason = 'harassment' | 'spam' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface IConversationReport extends Document {
  conversationId: mongoose.Types.ObjectId;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  additionalDetails?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationReportSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    reporterId: {
      type: String,
      required: true,
      index: true,
    },
    reportedUserId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['harassment', 'spam', 'inappropriate', 'other'],
    },
    additionalDetails: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
    },
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

// Index for admin queries
ConversationReportSchema.index({ status: 1, createdAt: -1 });

export const ConversationReportModel = mongoose.model<IConversationReport>(
  'ConversationReport',
  ConversationReportSchema
);
