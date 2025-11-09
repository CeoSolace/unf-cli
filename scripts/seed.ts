import { connectDatabase } from '../core/db';
import { User } from '../core/db/models/User';
import { Server as ServerModel } from '../core/db/models/Server';
import { Channel } from '../core/db/models/Channel';
import { generateKeyPair, toBase64 } from '../core/crypto';

async function seed() {
  await connectDatabase();
  console.log('Connected to database');
  // Create root admin if none exists
  const existing = await User.findOne({ roles: { $in: ['root'] } });
  if (!existing) {
    const kp = generateKeyPair();
    const user = new User({
      username: 'admin_root',
      email: 'admin@example.com',
      publicKey: toBase64(kp.publicKey),
      secretKey: toBase64(kp.secretKey),
      roles: ['root', 'admin']
    });
    await user.setPassword('password123');
    await user.save();
    console.log('Created root admin with username "admin_root" and password "password123"');
    // Create system server and channel for announcements
    const sysServer = new ServerModel({
      name: 'UnfilteredUK System',
      owner: user._id,
      members: [user._id],
      channels: [],
      settings: { system: true }
    });
    const sysChannel = new Channel({
      server: sysServer._id,
      name: 'system',
      type: 'system',
      members: [user._id],
      messages: []
    });
    await sysChannel.save();
    sysServer.channels.push(sysChannel._id);
    await sysServer.save();
    console.log('Created system server and channel');
  } else {
    console.log('Root admin already exists; skipping seeding');
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});