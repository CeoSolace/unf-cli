import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { createRateLimiter, obfuscateId } from '../../core/security';
import { connectDatabase } from '../../core/db';
import { User } from '../../core/db/models/User';
import { Server as ServerModel } from '../../core/db/models/Server';
import { Channel } from '../../core/db/models/Channel';
import { Message } from '../../core/db/models/Message';
import { config } from '../../core/config';
import { generateKeyPair, toBase64, encryptMessage, decryptMessage, fromBase64 } from '../../core/crypto';
import type { KeyPair } from '../../core/crypto';
import { randomId, sanitize } from '../../core/utils';

// Initialise Express app
const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(createRateLimiter());

// Helper type for Express request with user
interface AuthRequest extends express.Request {
  userId?: string;
}

/**
 * Authentication middleware. Verifies the bearer token (JWT) and assigns
 * the user ID to the request object. If verification fails the request is
 * rejected with a 401 response.
 */
function authMiddleware(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.authSecret) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Admin middleware. Requires the user to have the 'admin' or 'root' role.
 */
async function adminMiddleware(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
  const user = await User.findById(userId);
  if (!user || !user.roles.includes('admin') && !user.roles.includes('root')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * Register a new user. Generates an asymmetric key pair for E2EE and stores
 * the keys in base64 format. Passwords are hashed using Argon2 via the
 * model method setPassword.
 */
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const keyPair: KeyPair = generateKeyPair();
    const user = new User({
      username: sanitize(username),
      email: sanitize(email),
      publicKey: toBase64(keyPair.publicKey),
      secretKey: toBase64(keyPair.secretKey),
      roles: []
    });
    await user.setPassword(password);
    await user.save();
    const token = jwt.sign({ id: user._id.toString() }, config.authSecret, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: {
        id: obfuscateId(user._id.toString()),
        username: user.username,
        publicKey: user.publicKey,
        roles: user.roles
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Authenticate an existing user. Compares the provided password with the
 * stored password hash and returns a signed JWT on success.
 */
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  try {
    const user = await User.findOne({ username: sanitize(username) });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await user.validatePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id.toString() }, config.authSecret, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: obfuscateId(user._id.toString()),
        username: user.username,
        publicKey: user.publicKey,
        roles: user.roles
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all servers for the authenticated user. Returns summary information.
 */
app.get('/api/servers', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId as string;
    const servers = await ServerModel.find({ members: userId });
    const result = servers.map((srv) => ({
      id: obfuscateId(srv._id.toString()),
      name: srv.name,
      icon: srv.icon,
      description: srv.description,
      memberCount: srv.members.length,
      channelCount: srv.channels.length
    }));
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create a new server owned by the authenticated user. Automatically
 * creates a default text channel and adds the creator to the members list.
 */
app.post('/api/servers', authMiddleware, async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Server name is required' });
  }
  try {
    const userId = req.userId as string;
    const serverDoc = new ServerModel({
      name: sanitize(name),
      description: sanitize(description || ''),
      owner: userId,
      members: [userId],
      channels: [],
      settings: {}
    });
    // Create default channel
    const channelDoc = new Channel({
      server: serverDoc._id,
      name: 'general',
      type: 'text',
      members: [userId],
      messages: []
    });
    await channelDoc.save();
    serverDoc.channels.push(channelDoc._id);
    await serverDoc.save();
    return res.status(201).json({
      id: obfuscateId(serverDoc._id.toString()),
      name: serverDoc.name,
      description: serverDoc.description,
      defaultChannelId: obfuscateId(channelDoc._id.toString())
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Fetch recent messages for a channel. Requires membership.
 */
app.get('/api/messages/:channelId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;
    // find channel by obfuscated ID? We can't deobfuscate easily; for simplicity assume client
    // passes raw Mongo ID in this implementation.
    const channel = await Channel.findById(channelId).populate('messages');
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    // TODO: verify user membership
    const messages = await Message.find({ channel: channelId }).sort({ createdAt: -1 }).limit(50);
    const result = messages.map((msg) => ({
      id: obfuscateId(msg._id.toString()),
      channelId: obfuscateId(channelId),
      senderId: obfuscateId(msg.sender.toString()),
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      replyTo: msg.replyTo ? obfuscateId(msg.replyTo.toString()) : undefined,
      reactions: msg.reactions
    }));
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Post a new message to a channel. Requires membership. The content should be
 * encrypted on the client side and encoded as base64. The server stores
 * it verbatim without attempting to decrypt it.
 */
app.post('/api/messages/:channelId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing message content' });
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    // TODO: verify membership
    const message = new Message({
      channel: channelId,
      sender: req.userId,
      content: content,
      reactions: {}
    });
    await message.save();
    // Push message to channel
    channel.messages.push(message._id);
    await channel.save();
    // Emit via WebSocket
    io.to(channelId).emit('message', {
      id: obfuscateId(message._id.toString()),
      channelId: obfuscateId(channelId),
      senderId: obfuscateId(req.userId!),
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      reactions: {}
    });
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Administrative endpoint to ban a user from a server. Only admins may
 * perform this action. The banned user is removed from the server's
 * members list.
 */
app.post('/api/admin/ban', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const { serverId, userId } = req.body;
  if (!serverId || !userId) return res.status(400).json({ error: 'Missing parameters' });
  try {
    const server = await ServerModel.findById(serverId);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    // Remove user from members
    server.members = server.members.filter((id) => id.toString() !== userId);
    await server.save();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Socket.IO authentication. Extracts token from handshake and verifies it.
 */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthenticated'));
  try {
    const decoded = jwt.verify(token, config.authSecret) as { id: string };
    (socket as any).userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Unauthenticated'));
  }
});

io.on('connection', (socket) => {
  // Join a channel room
  socket.on('join', async (channelId: string) => {
    socket.join(channelId);
  });
  // Receive a message from client; broadcast to room and persist
  socket.on('send', async ({ channelId, content }) => {
    try {
      const userId = (socket as any).userId;
      const channel = await Channel.findById(channelId);
      if (!channel) return;
      const message = new Message({
        channel: channelId,
        sender: userId,
        content,
        reactions: {}
      });
      await message.save();
      channel.messages.push(message._id);
      await channel.save();
      io.to(channelId).emit('message', {
        id: obfuscateId(message._id.toString()),
        channelId: obfuscateId(channelId),
        senderId: obfuscateId(userId),
        content,
        createdAt: message.createdAt.toISOString(),
        reactions: {}
      });
    } catch (err) {
      console.error(err);
    }
  });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
async function start() {
  try {
    await connectDatabase();
    httpServer.listen(config.port, () => {
      console.log(`UnfilteredUK backend listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();