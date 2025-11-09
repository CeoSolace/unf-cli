import crypto from "crypto";
import rateLimit from "express-rate-limit";
import type { Options as RateLimitOptions } from "express-rate-limit";
import { config } from "../config";

/**
 * Derive a HMAC-based obfuscated identifier for sensitive IDs such as user IDs.
 * The obfuscation ensures the ID cannot be guessed while remaining deterministic.
 *
 * @param realId - The original identifier to obfuscate.
 * @returns A deterministic SHA-256 HMAC hash string.
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
 * @param realId - The original identifier.
 * @param obfuscated - The obfuscated identifier to verify.
 * @returns True if the provided obfuscated ID matches the derived value.
 */
export function verifyObfuscatedId(realId: string, obfuscated: string): boolean {
  try {
    const expected = obfuscateId(realId);
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(obfuscated, "utf8")
    );
  } catch {
    return false;
  }
}

/**
 * Create a generic rate limiter middleware for Express routes.
 * Default: 60 requests per minute per IP.
 *
 * @param options - Optional configuration to override defaults.
 * @returns An Express middleware rate limiter.
 */
export function createRateLimiter(options?: RateLimitOptions) {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit each IP to 60 requests per minute
    standardHeaders: true, // send rate limit info in headers
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
    ...(options || {}),
  });
}
