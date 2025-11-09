# Developer Guide

Welcome to the UnfilteredUK developer guide. This document explains how to set up a development environment, contribute to the project and build custom bots or clients using our SDK and API.

## Local Development

1. Ensure you have Node.js and pnpm installed.
2. Clone the repository and run `pnpm install` to install dependencies and build the project.
3. Set up a `.env` file with your environment variables. Use `.env.example` as a template.
4. Start the development server:
   ```bash
   pnpm start
   ```
   This command starts both the Express backend and the Next.js frontend on port 10000. The API is available under `/api` and the frontend under `/`.

### Hot Reloading

During development you may want to automatically reload the server when files change. You can use `nodemon` for this:

```bash
pnpm exec nodemon --watch app/backend --ext ts --exec "ts-node app/backend/server.ts"
```

For the frontend, Next.js automatically reloads pages when you save them.

## Encryption Details

UnfilteredUK uses modern cryptography to ensure that message contents remain private even from server operators. The following primitives are used:

- **Key exchange**: X25519 via [TweetNaCl](https://github.com/dchest/tweetnacl-js) to derive a shared secret between two parties.
- **Symmetric encryption**: XChaCha20‑Poly1305 for authenticated encryption. A random nonce is generated for every message.
- **Compression**: Brotli compression is applied to plaintext before encryption to reduce bandwidth usage.
- **Key storage**: Users generate a key pair on registration. The public key is sent to the server; the private key is stored locally on the client. In this demonstration code the private key is stored in the database for simplicity; in a real deployment it should be encrypted with a user‑provided passphrase and never leave the client.

## Building Bots

Custom bots can be implemented using the `UnfilteredUKClient` class from the SDK provided in `core/sdk/index.ts`. Bots authenticate using a bot token and then connect via WebSocket to receive events.

```ts
import { UnfilteredUKClient } from './core/sdk';

const client = new UnfilteredUKClient({ baseUrl: 'https://unfiltereduk.example.com', token: 'BOT_TOKEN' });
client.connect();

client.onMessage((msg) => {
  // respond to messages
  if (msg.content === 'ping') {
    client.sendMessage(msg.channelId, btoa('pong'));
  }
});
```

For security, bots run in a restricted context without access to sensitive user data.

## Testing

The `scripts/test.ts` file contains a simple test harness to validate critical functionality such as encryption and ID obfuscation. Run the tests with:

```bash
pnpm run test
```

This script uses Node's built‑in `assert` library and does not require any external dependencies.

## Contributing

When contributing code, please adhere to the following practices:

1. **Type Safety** – Use TypeScript throughout and avoid `any` types. Define clear interfaces for data structures.
2. **Security** – Never trust user input. Always sanitise and validate on both client and server. Use prepared statements with MongoDB queries.
3. **Documentation** – Update the API reference and developer guide when adding new features or changing existing behaviour.
4. **Testing** – Write unit and integration tests for your changes where applicable.
5. **Commits** – Keep commits small and focused. Include a descriptive commit message.