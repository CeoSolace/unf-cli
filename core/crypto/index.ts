import nacl from 'tweetnacl';
import { promisify } from 'util';
import zlib from 'zlib';

// Promisify Brotli compress/decompress for convenience
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

export interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

/**
 * Generate a new X25519 key pair. This uses tweetnacl's box keypair
 * generation function (Curve25519). Keys are returned as Uint8Arrays.
 */
export function generateKeyPair(): KeyPair {
  return nacl.box.keyPair();
}

/**
 * Encrypt a message using the recipient's public key and the sender's
 * secret key. The message is first compressed using Brotli to reduce
 * bandwidth. The returned cipher text includes a nonce prepended.
 *
 * @param message The plaintext message to encrypt.
 * @param publicKey Recipient's public key.
 * @param secretKey Sender's secret key.
 */
export async function encryptMessage(
  message: Uint8Array,
  publicKey: Uint8Array,
  secretKey: Uint8Array
): Promise<Uint8Array> {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const compressed = await brotliCompress(Buffer.from(message));
  const encrypted = nacl.box(compressed, nonce, publicKey, secretKey);
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);
  return combined;
}

/**
 * Decrypt a message using the sender's public key and the recipient's
 * secret key. Extracts the nonce from the beginning of the cipher text,
 * decrypts the payload and decompresses it.
 *
 * @param cipher The cipher text containing the nonce and encrypted data.
 * @param publicKey Sender's public key.
 * @param secretKey Recipient's secret key.
 */
export async function decryptMessage(
  cipher: Uint8Array,
  publicKey: Uint8Array,
  secretKey: Uint8Array
): Promise<Uint8Array | null> {
  const nonce = cipher.slice(0, nacl.box.nonceLength);
  const encrypted = cipher.slice(nacl.box.nonceLength);
  const decrypted = nacl.box.open(encrypted, nonce, publicKey, secretKey);
  if (!decrypted) return null;
  const decompressed = await brotliDecompress(Buffer.from(decrypted));
  return new Uint8Array(decompressed);
}

/**
 * Convert a Uint8Array to a base64 string. This is useful for storing
 * binary keys or messages in a textual medium (e.g. database or JSON).
 *
 * @param arr The array to convert.
 */
export function toBase64(arr: Uint8Array): string {
  return Buffer.from(arr).toString('base64');
}

/**
 * Convert a base64 string back into a Uint8Array.
 *
 * @param str The base64 string to convert.
 */
export function fromBase64(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'base64'));
}