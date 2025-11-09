import { execSync } from 'child_process';
import { copyFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Build script invoked during installation. This script compiles the
 * TypeScript sources into JavaScript using the TypeScript compiler and
 * copies runtime entry points into their expected locations. It also
 * performs any preparatory tasks needed prior to starting the server.
 */
function runBuild() {
  console.log('🔨 Compiling TypeScript...');
  execSync('npx tsc --project tsconfig.json', { stdio: 'inherit' });
  // Copy compiled server.js into source tree so that `node app/backend/server.js` works
  const compiledServerPath = join('dist', 'app', 'backend', 'server.js');
  const targetServerPath = join('app', 'backend', 'server.js');
  if (existsSync(compiledServerPath)) {
    copyFileSync(compiledServerPath, targetServerPath);
    console.log('✅ Copied compiled server.js to app/backend/server.js');
  }
  // Optionally clean up dist to save space
  rmSync('dist', { recursive: true, force: true });
  console.log('🎉 Build complete');
}

runBuild();