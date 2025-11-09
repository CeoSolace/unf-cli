import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage {
  channel: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string; // encrypted and base64 encoded
  createdAt: Date;
  reactions: Record<string, string[]>; // emoji => array of user IDs
  replyTo?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
}

export interface IMessageDocument extends IMessage, Document {}
export interface IMessageModel extends Model<IMessageDocument> {}

const MessageSchema = new Schema<IMessageDocument>({
  channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reactions: { type: Schema.Types.Mixed, default: {} },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  metadata: { type: Schema.Types.Mixed }
});

export const Message: IMessageModel = mongoose.models.Message as IMessageModel || mongoose.model<IMessageDocument, IMessageModel>('Message', MessageSchema);