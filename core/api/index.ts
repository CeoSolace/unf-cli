/**
 * Shared API types used between the client and server. Keeping these
 * definitions in a single place ensures that both ends of the wire agree
 * on the shape of data being transmitted.
 */

export interface UserSummary {
  id: string;
  username: string;
  avatarUrl?: string;
  roles: string[];
}

export interface ServerSummary {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  memberCount: number;
  channelCount: number;
}

export type ChannelType = 'text' | 'voice' | 'system';

export interface ChannelSummary {
  id: string;
  name: string;
  type: ChannelType;
  memberCount: number;
  messageCount: number;
}

export interface MessageSummary {
  id: string;
  channelId: string;
  senderId: string;
  content: string; // base64 encoded encrypted content
  createdAt: string; // ISO timestamp
  replyTo?: string;
  reactions: Record<string, string[]>;
}

// Request bodies
export interface CreateServerRequest {
  name: string;
  description?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SendMessageRequest {
  content: string;
}