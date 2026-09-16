import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
console.log('Intentional regression demonstration: expect ONE failed test and exit code 1.');
const result = spawnSync(process.execPath, [require.resolve('@playwright/test/cli'), 'test', '--project=chromium'], {
  stdio: 'inherit', env: { ...process.env, FAILURE_DEMO: '1' },
});
if (result.error) console.error(result.error);
process.exitCode = result.status ?? 1;
