import mongoose, { Document, Model, Schema } from 'mongoose';
import argon2 from 'argon2';
import { randomId } from '../../utils';

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  publicKey: string;
  secretKey: string;
  roles: string[];
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {
  setPassword(password: string): Promise<void>;
  validatePassword(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {}

const UserSchema = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  publicKey: { type: String, required: true },
  secretKey: { type: String, required: true },
  roles: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.setPassword = async function (this: IUserDocument, password: string): Promise<void> {
  this.passwordHash = await argon2.hash(password);
};

UserSchema.methods.validatePassword = async function (this: IUserDocument, password: string): Promise<boolean> {
  try {
    return await argon2.verify(this.passwordHash, password);
  } catch {
    return false;
  }
};

export const User: IUserModel = mongoose.models.User as IUserModel || mongoose.model<IUserDocument, IUserModel>('User', UserSchema);