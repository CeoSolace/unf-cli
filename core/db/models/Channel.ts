import mongoose, { Document, Model, Schema } from 'mongoose';

export type ChannelType = 'text' | 'voice' | 'system';

export interface IChannel {
  server: mongoose.Types.ObjectId;
  name: string;
  type: ChannelType;
  messages: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface IChannelDocument extends IChannel, Document {}
export interface IChannelModel extends Model<IChannelDocument> {}

const ChannelSchema = new Schema<IChannelDocument>({
  server: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'voice', 'system'], default: 'text' },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export const Channel: IChannelModel = mongoose.models.Channel as IChannelModel || mongoose.model<IChannelDocument, IChannelModel>('Channel', ChannelSchema);