import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Derive a HMAC‑based obfuscated identifier for sensitive IDs such as user IDs.
 * The obfuscation ensures that the original identifier cannot be easily guessed
 * while still being deterministic (the same input yields the same output).
 *
 * @param realId The original identifier to obfuscate.
 */
export function obfuscateId(realId: string): string {
  const hmac = crypto.createHmac('sha256', config.idDeriveSecret);
  hmac.update(realId);
  return hmac.digest('hex');
}

/**
 * Verify that a given obfuscated ID corresponds to the provided real ID.
 *
 * @param realId The original identifier.
 * @param obfuscated The obfuscated identifier to verify.
 */
export function verifyObfuscatedId(realId: string, obfuscated: string): boolean {
  const expected = obfuscateId(realId);
  return expected === obfuscated;
}

/**
 * Create a generic rate limiter for Express routes. Applies sensible defaults
 * for UnfilteredUK's use cases. You can override any option as needed.
 *
 * @param options Optional configuration to override defaults.
 */
export function createRateLimiter(options?: rateLimit.Options): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit each IP to 60 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    ...(options || {})
  });
}