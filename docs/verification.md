# Executed verification — 16 September 2026

## Normal suite

Command: `npm run check`.

| Check | Actual result |
|---|---|
| ESLint | Passed |
| TypeScript strict checking | Passed |
| API tests | 25 passed |
| Chromium browser scenarios | 29 passed |
| Firefox browser scenarios | 29 passed |
| Total test executions | **83 passed, 0 failed, 0 skipped, 0 flaky** |
| Retry policy | 0 retries |

This represents **54 distinct parameterized cases**: 25 API cases plus 29 browser cases, with browser cases executed twice. It is not 83 distinct user journeys.

Environment: Windows, Node.js 24.19.0, npm 11.17.0, Playwright 1.63.0, TypeScript 6.0.3. Browser downloads: Chromium 153.0.8010.12 (revision 1243), Firefox 155.0 (revision 1543). Dependencies were pinned in package-lock.json. The test run began at 06:29:43 UTC; Playwright reported 97.7 seconds including runner/server overhead. This is a test-run duration, not an application performance result.

The build environment stored browser downloads in a workspace cache and supplied `PLAYWRIGHT_BROWSERS_PATH` during execution. The project configuration does not hard-code that machine-specific path. A normal installation uses `npx playwright install chromium firefox` as documented in the README.

Saved evidence:

- [Normal HTML report](../evidence/normal-report/index.html)
- [Original JSON results](../evidence/normal-report/results.json)
- [Storefront screenshot](../evidence/storefront.png)

After installing dependencies, open the preserved report with `npx playwright show-report evidence/normal-report`.

## Deliberate failure demonstration

Command: `npm run test:failure-demo`. Actual result: exactly **one failed Chromium test**, exit code **1**, as intended. The assertion reported expected **€22.95**, received **€22.96**. A screenshot and trace were created automatically. The normal suite's report remained separate.

- [Failure HTML report](../evidence/failure-report/index.html)
- [Original failure JSON](../evidence/failure-report/results.json)
- [Automatic failure screenshot](../evidence/intentional-failure.png)
- [Retained trace](../evidence/intentional-failure-trace.zip)
- [Expected-versus-actual investigation](defect-example.md)

Open with `npx playwright show-report evidence/failure-report` or `npx playwright show-trace evidence/intentional-failure-trace.zip`.

This is an injected response change, not a newly discovered commercial defect. The reporter correctly categorizes the assertion as an unexpected failure; the separate demonstration command deliberately triggers it.

## Browser and integration checks

The storefront was opened with a browser-verification utility, its interactive controls inspected, sign-in navigation exercised, and a full-page screenshot captured. No page errors were reported by that check. This is a visual sanity check, not an accessibility audit.

The automated `SHOP-01` workflow verified each key boundary: browser actions → real order POST → server-calculated totals → saved session order → confirmation UI and empty cart. `EDGE-05` verified an injected failed POST leaves the cart intact and permits a subsequent successful real request.

## Development finding

The first full run returned 82 passes and one failure in API-05. The intended malformed JSON string was automatically encoded into valid JSON by the request client, causing a 401 instead of the intended parse-error 400. The test was corrected to send `Buffer.from('{broken')`, preserving the invalid bytes. The complete normal suite was then rerun and produced the 83-pass result above. No application behaviour was relaxed to make that assertion pass.

## Limits

GitHub Actions is supplied but has **not** been executed on GitHub. The repository has not been published. No claim is made for WebKit, mobile devices, security certification, accessibility compliance, performance, external retailers, or real payment processing. The evidence describes this local fictional application and these exact executions.

`evidence/source-manifest.json` records SHA-256 hashes of the delivered source and documentation. The ZIP packaging step checks every archived file against its local counterpart. Generated dependency folders and ephemeral reports are excluded from the ZIP; preserved reports live under evidence/.
