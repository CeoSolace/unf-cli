/**
 * Centralised configuration loader for UnfilteredUK.
 *
 * This module reads values from environment variables and exposes them
 * as a typed configuration object. For any missing values it falls back
 * to sensible defaults so that the application can still start in development.
 */

export interface UnfilteredUKConfig {
  authSecret: string;
  nextAuthSecret: string;
  idDeriveSecret: string;
  dbUrl: string;
  cloudinaryName: string;
  cloudinaryApi: string;
  cloudinaryApiSecret: string;
  port: number;
  nodeEnv: string;
}

/**
 * Reads an environment variable and returns a default value if it is undefined.
 * Numbers are parsed automatically.
 *
 * @param key The name of the environment variable.
 * @param fallback The fallback value if the variable is undefined.
 */
function getEnv<T extends string | number>(key: string, fallback: T): T {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return fallback;
  }
  if (typeof fallback === 'number') {
    const num = parseInt(value, 10);
    return (isNaN(num) ? fallback : (num as unknown as T));
  }
  return value as unknown as T;
}

/**
 * The global configuration object for the application. This is immutable
 * after initial load to prevent accidental mutation elsewhere in the code.
 */
export const config: Readonly<UnfilteredUKConfig> = Object.freeze({
  authSecret: getEnv('AUTH_SECRET', 'changeme'),
  nextAuthSecret: getEnv('NEXTAUTH_SECRET', 'changeme'),
  idDeriveSecret: getEnv('ID_DERIVE_SECRET', 'changeme'),
  dbUrl: getEnv('DATABASE_URL', ''),
  cloudinaryName: getEnv('CLOUDINARY_NAME', ''),
  cloudinaryApi: getEnv('CLOUDINARY_API', ''),
  cloudinaryApiSecret: getEnv('CLOUDINARY_API_SECRET', ''),
  port: getEnv('PORT', 10000),
  nodeEnv: getEnv('NODE_ENV', 'development')
});