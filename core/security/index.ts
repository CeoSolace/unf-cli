import crypto from "crypto";
import rateLimit, { RateLimitOptions } from "express-rate-limit";
import { config } from "../config";

/**
 * Derive a HMAC-based obfuscated identifier for sensitive IDs such as user IDs.
 * The obfuscation ensures that the original identifier cannot be easily guessed
 * while still being deterministic (the same input yields the same output).
 *
 * @param realId The original identifier to obfuscate.
 * @returns A deterministic HMAC SHA-256 hash of the identifier.
 */
export function obfuscateId(realId: string): string {
  if (!config.idDeriveSecret) {
    throw new Error("Missing ID_DERIVE_SECRET in environment configuration.");
  }

  const hmac = crypto.createHmac("sha256", config.idDeriveSecret);
  hmac.update(realId);
  return hmac.digest("hex");
}

/**
 * Verify that a given obfuscated ID corresponds to the provided real ID.
 *
 * @param realId The original identifier.
 * @param obfuscated The obfuscated identifier to verify.
 * @returns True if the obfuscated ID matches the derived hash.
 */
export function verifyObfuscatedId(realId: string, obfuscated: string): boolean {
  try {
    const expected = obfuscateId(realId);
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(obfuscated));
  } catch {
    return false;
  }
}

/**
 * Create a generic rate limiter for Express routes. Applies sensible defaults
 * for UnfilteredUK's API endpoints. You can override any option as needed.
 *
 * @param options Optional configuration to override defaults.
 * @returns A configured Express middleware rate limiter.
 */
export function createRateLimiter(options?: RateLimitOptions) {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit each IP to 60 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
    ...(options || {}),
  });
}
