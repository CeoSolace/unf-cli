import mongoose from 'mongoose';
import { config } from '../config';

import './models/User';
import './models/Server';
import './models/Channel';
import './models/Message';

/**
 * Initialize a connection to the MongoDB database. This function returns
 * a promise that resolves once the connection is successfully opened.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = config.dbUrl;
  if (!uri) {
    throw new Error('DATABASE_URL is not defined. Please set it in your environment.');
  }
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri);
}