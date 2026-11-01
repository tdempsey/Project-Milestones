import { spawnSync } from 'node:child_process';
for (const file of ['asana.test.cjs', 'output.test.cjs', 'sorting.test.cjs', 'iconize.test.cjs']) {
  const result = spawnSync(process.execPath, [`tests/${file}`], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
