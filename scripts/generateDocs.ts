import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

/**
 * Generate documentation files. In this simple implementation the docs
 * directory already contains the Markdown sources. This script copies
 * them into a generated directory for deployment or other processing.
 */
function generateDocs() {
  const srcDir = join('docs');
  const destDir = join('docs', 'generated');
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  const files = [
    'unfiltereduk.md',
    'api-reference.md',
    'developer-guide.md',
    'legal/tos.md',
    'legal/privacy.md',
    'legal/moderation.md',
    'legal/community.md'
  ];
  for (const file of files) {
    const srcPath = join(srcDir, file);
    const destPath = join(destDir, file.replace(/\//g, '_'));
    copyFileSync(srcPath, destPath);
  }
  console.log('📄 Documentation generated');
}

generateDocs();