import { config } from '../core/config';

/**
 * Basic security verification script. Checks that secrets are not left as
 * defaults and warns if insecure configuration is detected. In a real
 * production environment you might run more comprehensive scanners.
 */
function verifySecurity() {
  let failed = false;
  if (config.authSecret === 'changeme') {
    console.error('❌ AUTH_SECRET must be changed from the default value');
    failed = true;
  }
  if (config.nextAuthSecret === 'changeme') {
    console.error('❌ NEXTAUTH_SECRET must be changed from the default value');
    failed = true;
  }
  if (config.idDeriveSecret === 'changeme') {
    console.error('❌ ID_DERIVE_SECRET must be changed from the default value');
    failed = true;
  }
  if (!config.dbUrl) {
    console.error('❌ DATABASE_URL is not set');
    failed = true;
  }
  if (config.nodeEnv !== 'production') {
    console.warn('⚠️ NODE_ENV is not set to production. Ensure you use production mode in deployment.');
  }
  if (failed) {
    console.error('Security verification failed. Please address the issues above before deploying.');
    process.exit(1);
  } else {
    console.log('✅ Security verification passed');
  }
}

verifySecurity();