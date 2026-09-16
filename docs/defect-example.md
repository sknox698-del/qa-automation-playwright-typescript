# DEMO-01: One-cent price regression investigation

**Classification:** deliberately injected demonstration, not a defect discovered in an external system.

**Impact:** an incorrect price can reach the cart display. High priority for a real checkout because price consistency affects customer trust; this demo does not collect payments.

## Reproduce

1. Install the project and Chromium as described in the README.
2. Run `npm run test:failure-demo`.
3. The test changes only the browser's catalog response: Trail Bottle becomes 1,801 cents instead of the documented 1,800 cents.
4. The browser adds one bottle and opens the cart.
5. The regression assertion checks the expected €22.95 total (€18 + €4.95 shipping).

**Expected:** €22.95. **Injected actual:** €22.96. The command should report one failed Chromium test and exit 1.

## Evidence and diagnosis

Open `failure-demo-report/index.html` through `npx playwright show-report failure-demo-report`. Inspect the assertion mismatch, automatically captured screenshot, and retained trace. The injected test is in `evidence-demo/e2e/price-regression.spec.ts`; its request interception is explicit. The untouched server still calculates the correct price, so this demonstration targets a UI price regression rather than claiming the backend overcharged.

No source rollback is required: the response override exists only inside that test's browser context. The normal suite does not collect this deliberately failing test. Confirm the normal suite passes with `npm test` and compare the normal run with the isolated failure report. See verification.md for executed evidence.
