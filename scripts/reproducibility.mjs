import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const digest = async () => {
  const hashes = {};
  for (const file of ['main.js', 'manifest.json', 'styles.css']) hashes[file] = createHash('sha256').update(await readFile(`dist/project-milestone-gpt-tracker/${file}`)).digest('hex');
  return JSON.stringify(hashes);
};
const before = await digest();
const result = spawnSync(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
if (before !== await digest()) throw Error('Repeated builds differ');
console.log('Repeated build SHA-256 hashes match for all three artifact files.');
