import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
const order = JSON.parse(await readFile('source-order.json', 'utf8'));
for (const file of [...order, 'dist/project-milestone-gpt-tracker/main.js']) new Script(await readFile(file, 'utf8'), { filename: file });
const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (manifest.version !== pkg.version) throw Error('Manifest/package versions differ');
console.log('Source/artifact syntax and version consistency passed. JavaScript project: no TypeScript type-check claimed.');
