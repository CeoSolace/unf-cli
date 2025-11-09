import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IServer {
  name: string;
  owner: mongoose.Types.ObjectId;
  description?: string;
  icon?: string;
  channels: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  settings: Record<string, unknown>;
}

export interface IServerDocument extends IServer, Document {}
export interface IServerModel extends Model<IServerDocument> {}

const ServerSchema = new Schema<IServerDocument>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  icon: { type: String },
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  settings: { type: Schema.Types.Mixed, default: {} }
});

export const Server: IServerModel = mongoose.models.Server as IServerModel || mongoose.model<IServerDocument, IServerModel>('Server', ServerSchema);