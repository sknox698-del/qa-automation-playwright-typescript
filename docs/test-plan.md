# Test plan and requirement coverage

## Objective

Verify that a shopper can find products, manage a cart, sign in, and place a valid demo order with the correct server-calculated price. Prevent invalid input from creating orders. Keep test evidence understandable for a junior QA interview.

## Business rules agreed for this fictional target

| Requirement | Expected behaviour | Automated coverage |
|---|---|---|
| R01 Authentication | Only documented demo credentials succeed; logout invalidates the session; checkout requires login | AUTH-01–05, API-02–04 |
| R02 Catalog | Four seeded products; trimmed case-insensitive search; numeric price sorting; recoverable empty search | SHOP-03–05, API-01 |
| R03 Cart | Positive whole quantities within fixed stock; reload keeps quantities; removal updates totals | SHOP-02, EDGE-01–03, API-09 |
| R04 Shipping form | Trimmed name 2–60 characters, email with local/domain/dot, exactly five numeric postcode characters | FORM-01–10, API-10 |
| R05 Price integrity | Bag €49, bottle €18, notebook €7.50, headphones €89; server ignores submitted prices | SHOP-01–02, API-01, API-07 |
| R06 Shipping charge | €4.95 below €60 subtotal; free at/above €60; currency calculated in integer cents | SHOP-01–02, API-07–08 |
| R07 Order lifecycle | Valid order returns 201 and can be read in the same session; cart clears on success | SHOP-01, API-07 |
| R08 Invalid orders | Reject empty, unknown, duplicate, null, unavailable, fractional, nonnumeric, or out-of-range items without saving | EDGE-04, API-03, API-09–10 |
| R09 Failure recovery | Failed order preserves cart and permits retry; catalog failure offers reload | EDGE-05–06 |
| R10 Session isolation | One session cannot list another session's orders, even using the same demo login | API-11 |
| R11 HTTP errors | Invalid JSON gets 400; unknown route gets 404 with a JSON error | API-05–06 |

Parameterized cases share their scenario-family ID; their test titles identify the specific input. Browser cases run in Chromium and Firefox; API cases run once.

## Priority and selection

`@smoke` selects login persistence, complete purchase, catalog contract, and price-integrity order creation. These address blocked shopping and incorrect charges first. `@regression` currently includes every normal scenario. This overlap is intentional: smoke is a small subset, regression is the full baseline.

## Approach

Use equivalence partitions (valid/invalid login, available/unavailable products), boundary values (name lengths, quantity 0/1/maximum/above maximum, postcode lengths), and state transitions (logged out → logged in → logged out; cart → order → empty cart).

Seeded products stay constant; test expectations are written independently from application calculations. API request contexts and browser contexts are fresh per test. No global reset endpoint or shared saved login file is needed. Cart lives in sessionStorage, while orders live on the server inside a unique cookie session.

## Entry and exit conditions

Entry: dependencies and browsers installed; port 4187 free; local server can start. Exit: lint and types pass, all normal scenarios pass without retries/skips, purchase state is checked through the API, and the deliberate failure demo produces the documented mismatch plus screenshot/trace. Record actual results separately in verification.md.

## Useful follow-up work

Independently test a permitted public demo site, add a real defect found through exploratory testing, and expand to mobile or accessibility checks when those are actually executed. Avoid claiming these additions in advance.
