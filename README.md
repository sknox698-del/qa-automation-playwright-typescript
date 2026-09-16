# Steve Knox · QA Automation Portfolio

[![QA Automation Tests](https://github.com/sknox698-del/qa-automation-playwright-typescript/actions/workflows/qa.yml/badge.svg)](https://github.com/sknox698-del/qa-automation-playwright-typescript/actions/workflows/qa.yml)

**Playwright + TypeScript | UI Testing | API Testing | Regression Testing | Cross-Browser QA**

A portfolio QA automation project built around **Northstar Shop**, a self-contained fictional e-commerce application. The suite demonstrates practical test design, browser automation, API validation, regression detection, edge-case testing, reusable test architecture, and failure investigation.

> **Verified locally · 16 September 2026:** **83 passing test executions** — 25 API checks plus 29 browser scenarios in Chromium and 29 in Firefox. Lint and TypeScript checks also passed.

## Quick Recruiter Snapshot

| Area | Evidence |
|---|---|
| Automation | Playwright + TypeScript |
| Browser coverage | Chromium and Firefox |
| API coverage | 25 REST/API checks |
| UI coverage | Authentication, validation, cart, checkout, search, sorting, edge cases |
| Regression testing | Deliberately injected price regression detected by the suite |
| Failure diagnostics | Screenshots, retained traces, HTML and JSON reports |
| Maintainability | Page Objects, isolated fixtures, data-driven scenarios |
| QA process | Test plan, documented business rules, reproducible setup |
| Postman API testing | 7 requests with 14 automated assertions passing |
| CI/CD | Verified GitHub Actions workflow running the full QA suite |

## What This Project Demonstrates

- End-to-end testing of realistic user workflows
- API validation including negative and tampering scenarios
- Boundary-value and input-validation testing
- Cross-browser execution in Chromium and Firefox
- Reusable Page Objects and isolated test fixtures
- Data-driven test scenarios
- Failure investigation using screenshots, Playwright traces, and reports
- Deliberate regression injection to prove the suite detects changed behavior rather than merely producing passing tests
- Automated API validation in Postman
- Continuous integration through GitHub Actions

This is a **personal, AI-assisted portfolio project**, not paid client work or testing of a production retailer.

## Postman API Testing

A Postman API test collection is included for hands-on REST API validation against the local Northstar Shop application.

The collection covers 7 API requests:

- Product catalog retrieval
- Invalid login
- Unauthorized order access
- Valid login
- Authenticated order access
- Invalid order quantity
- Malformed JSON handling

The collection includes automated assertions for both response status codes and expected response content.

> **Verified locally:** 14 automated assertions passed across 7 API requests with **0 failures and 0 errors**.

Postman files are available in:

```text
postman/
```

## Project Structure

```text
.github/workflows/qa.yml       GitHub Actions workflow for automated QA checks
demo/
  server.mjs                  Local HTTP API, demo sessions, order validation
  public/index.html           Page shell and navigation
  public/app.js               Storefront interactions and API requests
  public/style.css            Storefront styling and responsive layout
tests/
  data.ts                     Fictional account and shipping details
  fixtures.ts                 Fresh page objects and optional API login per test
  pages/LoginPage.ts          Reusable sign-in actions
  pages/ShopPage.ts           Product selection and cart navigation
  pages/CheckoutPage.ts       Shipping form actions
  e2e/login.spec.ts           Sign-in, sign-out, session, and guest access tests
  e2e/checkout-validation.spec.ts
                              Data-driven field and boundary tests
  e2e/shopping.spec.ts        Buying, cart, search, and sorting regressions
  e2e/edge-cases.spec.ts      Stock/quantity limits and service-failure recovery
  api/shop-api.spec.ts        HTTP status, response content, and stored-state checks
evidence-demo/e2e/            One deliberately failing price-regression test
scripts/failure-demo.mjs      Runs that demonstration separately
docs/test-plan.md             Requirements, coverage, priorities, and test approach
docs/defect-example.md        Reproducible injected-defect investigation
docs/verification.md          Actual local run record
postman/                      Verified Postman API test collection
playwright.config.ts          Browsers, server, isolation, timeouts, reports, traces
eslint.config.mjs             Basic JavaScript and TypeScript code checks
tsconfig.json                 Strict TypeScript checks for test code
package.json                  Project commands and dependencies
package-lock.json             Pinned dependency tree
```

## Quick Start

### Requirements

- Node.js 22.13+ or Node.js 24+

### Install dependencies

```sh
npm ci
npx playwright install chromium firefox
```

### Run the complete QA check

```sh
npm run check
```

This runs:

- ESLint
- TypeScript type checking
- API tests
- Chromium browser tests
- Firefox browser tests

### Open the latest HTML report

```sh
npm run report
```

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Run the API, Chromium, and Firefox suites |
| `npm run test:smoke` | Run critical smoke checks |
| `npm run test:regression` | Run regression scenarios |
| `npm run test:api` | Run API checks only |
| `npm run test:e2e` | Run Chromium browser scenarios |
| `npm run test:cross-browser` | Run Chromium and Firefox browser scenarios |
| `npm run test:headed` | Run Chromium tests in a visible browser |
| `npm run test:ui` | Open the Playwright interactive test runner |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run check` | Run the complete local quality gate |
| `npm run report` | Open the latest Playwright HTML report |
| `npm run test:failure-demo` | Run the deliberately failing regression example |

Run a single scenario with:

```sh
npx playwright test --project=chromium --grep SHOP-01
```

## Featured Test Examples

### End-to-End Purchase Workflow

`SHOP-01` adds products to the cart, verifies totals, completes checkout, reads the stored order through the API, and confirms the cart is cleared.

### Boundary and Validation Testing

Scenarios cover:

- Name-length boundaries
- Quantity limits
- Stock limits
- Postcode rules
- Form validation
- €60 shipping threshold

### Negative API Testing

API scenarios cover:

- Malformed JSON
- Anonymous access
- Invalid quantities
- Duplicate products
- Price tampering
- Invalid request data

### Regression Investigation

A separate test demonstration deliberately introduces a **€0.01 price regression**.

The displayed total becomes **€22.96** while the documented expected value remains **€22.95**.

The automation correctly detects the mismatch and produces diagnostic evidence rather than allowing the changed behavior to pass unnoticed.

See:

- [Defect investigation](docs/defect-example.md)
- [Verification evidence](docs/verification.md)

## Reports and Debugging

Normal runs create:

```text
playwright-report/index.html
playwright-report/results.json
test-results/
```

Browser-test failures generate:

- Screenshots
- Retained Playwright traces
- Assertion details
- HTML reporting
- JSON reporting

Open a trace with:

```sh
npx playwright show-trace <path-to-trace.zip>
```

Replace `<path-to-trace.zip>` with the actual trace file path.

API-only tests do not generate browser screenshots because no browser page is involved.

## GitHub Actions CI

GitHub Actions CI is configured and verified.

On each push to `main` and on pull requests targeting `main`, the workflow:

- Installs project dependencies
- Installs Chromium and Firefox for Playwright
- Runs ESLint
- Runs TypeScript type checking
- Executes the full Playwright QA suite
- Uploads the Playwright HTML report as a workflow artifact

The workflow has completed successfully in GitHub Actions.

This provides an automated quality gate in addition to the locally verified test execution.

## Deliberate Failure Demonstration

Run the isolated regression example with:

```sh
npm run test:failure-demo
npx playwright show-report failure-demo-report
```

Expect exactly one failed test.

This is intentional.

The injected price change produces a displayed value of **€22.96**, while the test expects **€22.95**.

The failure demonstration does not alter the normal test report.

## Test Design and Scope

- Each Playwright test receives an isolated browser context or API request context.
- API-created sessions are unique even when the same fictional account is used.
- Login-page tests exercise the sign-in interface directly.
- Authenticated shopping setup can use the API for fast and isolated setup.
- Assertions remain in the tests.
- Page Objects contain reusable actions and locators.
- Tests verify outcomes and saved state, not only successful clicks.
- No fixed sleeps are used.
- Test execution order is not a dependency.
- Two workers are used during normal execution.
- Most scenarios use the real local demo API.
- Separate edge-case scenarios simulate unavailable services.
- Expected prices and business rules are documented independently from application calculations.

A traceability table and business rules are available in:

[docs/test-plan.md](docs/test-plan.md)

## Scope and Limitations

Northstar Shop is intentionally a small, controlled demo application.

It does not contain:

- Real payment processing
- Production authentication
- A durable production database
- Real customer data
- Account registration
- Warehouse inventory management
- Production password storage
- External retailer integrations
- Order idempotency services

This project demonstrates **functional QA automation**.

It does not claim:

- Production security testing
- Load or performance testing
- Formal WCAG accessibility auditing
- Real mobile-device testing
- WebKit/Safari coverage
- Testing of an external production retailer
- Commercial iGaming QA experience

## Interview Walkthrough

A useful interview review path is:

1. Open `SHOP-01` and explain the full purchase workflow.
2. Show how stored order verification confirms backend state.
3. Review boundary-value and form-validation scenarios.
4. Review the API price-tampering test.
5. Review the Postman collection and explain the authenticated/unauthenticated API flow.
6. Run the deliberate failure demonstration.
7. Open the Playwright trace and explain how it supports debugging.
8. Explain why isolated fixtures and browser contexts matter.
9. Explain why expected business rules are documented separately from the application logic being tested.

## About the Author

**Steven Knox**

Technical professional developing hands-on experience in:

- QA automation
- Software testing
- Technical troubleshooting
- Application development
- API testing
- Postman
- Regression testing
- Cross-browser testing
- GitHub Actions CI

[Steven Knox on GitHub](https://github.com/sknox698-del)

[Steven Knox on LinkedIn](https://www.linkedin.com/in/steven-knox-4a16aa253/)

## Reference Documentation

- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Web Server](https://playwright.dev/docs/test-webserver)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
