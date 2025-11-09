import crypto from 'crypto';

/**
 * Safely parse a JSON string. Returns undefined if parsing fails.
 *
 * @param json A JSON string to parse.
 */
export function safeParseJson<T = unknown>(json: string): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

/**
 * Safely stringify a value to JSON. Returns undefined on failure.
 *
 * @param value The value to stringify.
 */
export function safeStringifyJson(value: unknown): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

/**
 * Generate a cryptographically secure random ID. Useful for generating
 * message, server or user identifiers before obfuscation.
 *
 * @param length The length of the ID in bytes; doubled for hex string length.
 */
export function randomId(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Perform a constant‑time comparison between two strings. This is critical
 * when comparing secrets such as tokens to avoid timing attacks.
 *
 * @param a First string to compare.
 * @param b Second string to compare.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Basic HTML sanitisation. Removes script tags and encodes angle brackets.
 * In production consider using a robust library like `DOMPurify` on the
 * client side and a proper server‑side sanitiser. This helper provides a
 * minimal defence against XSS in contexts where HTML is not required.
 *
 * @param input The user provided input to sanitise.
 */
export function sanitize(input: string): string {
  return input
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}