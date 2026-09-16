import { defineConfig, devices } from '@playwright/test';

const failureDemo = process.env.FAILURE_DEMO === '1';
export default defineConfig({
  testDir: failureDemo ? './evidence-demo' : './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: failureDemo ? 'failure-demo-results' : 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: failureDemo ? 'failure-demo-report' : 'playwright-report', open: 'never' }],
    ['json', { outputFile: failureDemo ? 'failure-demo-report/results.json' : 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4187',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'en-GB',
  },
  projects: [
    { name: 'api', testMatch: '**/api/*.spec.ts' },
    { name: 'chromium', testMatch: '**/e2e/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: '**/e2e/*.spec.ts', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:4187/api/health',
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
