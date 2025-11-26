import path from 'node:path';
import fs from 'fs-extra';
import signale from 'signale';
import { $ } from 'zx';

async function generateDts() {
  try {
    await $`yarn tsc --project tsconfig.build.json`;

    // index.d.ts
    await fs.copy(
      path.join(process.cwd(), 'dist/types/index.d.ts'),
      path.join(process.cwd(), 'dist/types/index.d.mts')
    );
    await fs.copy(
      path.join(process.cwd(), 'dist/types/index.d.ts'),
      path.join(process.cwd(), 'dist/types/index.d.cts')
    );
    await fs.remove(path.join(process.cwd(), 'dist/types/index.d.ts'));

    //core.d.ts
    const coreDtsPath = path.join(process.cwd(), 'dist/types/core.d.ts');
    if (await fs.pathExists(coreDtsPath)) {
      await fs.copy(coreDtsPath, path.join(process.cwd(), 'dist/types/core.d.mts'));
      await fs.copy(coreDtsPath, path.join(process.cwd(), 'dist/types/core.d.cts'));
      await fs.remove(coreDtsPath);
    }
  } catch (err) {
    signale.error('Failed to generate d.ts files');
    signale.error(err);
    process.exit(1);
  }
}

generateDts();
