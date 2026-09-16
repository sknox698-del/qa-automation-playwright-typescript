# Steve Knox · QA Automation Portfolio

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

![Northstar Shop — fictional test target](evidence/storefront.png)

## What This Project Demonstrates

- End-to-end testing of realistic user workflows
- API validation including negative and tampering scenarios
- Boundary-value and input-validation testing
- Cross-browser execution in Chromium and Firefox
- Reusable Page Objects and isolated test fixtures
- Data-driven test scenarios
- Failure investigation using screenshots, Playwright traces, and reports
- Deliberate regression injection to prove the suite detects changed behavior rather than merely producing passing tests

This is a **personal, AI-assisted portfolio project**, not paid client work or testing of a production retailer.

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
playwright.config.ts          Browsers, server, isolation, timeouts, reports, traces
eslint.config.mjs             Basic JavaScript and TypeScript code checks
tsconfig.json                 Strict TypeScript checks for test code
package.json                  Project commands and dependencies
package-lock.json             Pinned dependency tree
