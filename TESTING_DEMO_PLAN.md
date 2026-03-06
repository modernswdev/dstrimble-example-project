# Testing Demo Plan (dstrimble-example-project)

This guide is a live teaching script for a class session on software testing using this repo.

It is designed to show:
- The purpose of different test layers (unit-ish API, integration, UI)
- Why passing tests do not guarantee complete coverage
- How to intentionally break behavior and use tests to catch it
- How to add a missing test to close a coverage gap

## Audience Outcome

By the end, students should be able to:
- Explain the difference between unit, integration, and UI tests
- Read a failing test and identify expected vs actual behavior
- Understand branch coverage gaps (untested code paths)
- Apply red/green cycle: write test, fail, fix, pass

## Repo Test Map

- `test/server.test.js`: basic API checks using Supertest against Express app
- `test/integration.test.js`: end-to-end auth + widgets session flow
- `test/ui.test.js`: JSDOM tests of `public/static/js/bundle.js` behavior

## Important Setup Notes

- No rebuild is required when changing server code or tests.
- Jest reads source files directly each run.
- The app uses `NODE_ENV=test` behavior that avoids real Postgres dependency.

## Pre-Class Checklist (5 minutes)

1. Open project root in terminal.
2. Install dependencies if needed.
3. Confirm baseline tests are green.
4. Confirm `server.js` is in normal state before demo.

Commands:

```bash
npm install
npm test
```

Expected baseline:
- 3 suites passed
- 7 tests passed

## Suggested 45-Minute Demo Flow

## 1) Explain The Testing Layers (5 minutes)

Open each file and narrate the role:
- `test/server.test.js`: fast checks for API responses and status codes
- `test/integration.test.js`: realistic user/session flow across endpoints
- `test/ui.test.js`: browser-like behavior with mocked `fetch`

Talking points:
- Faster tests should be more numerous.
- Integration tests validate contracts between components.
- UI tests validate user-observable behavior and API call expectations.

## 2) Run Everything Green (2 minutes)

Command:

```bash
npm test
```

Talking point:
- "Green" means current tested expectations hold.
- Green does not mean all possible regressions are covered.

## 3) Show A Coverage Gap (8 minutes)

Context to explain:
- In `server.js`, `/api/widgets` has an unauthorized branch.
- Existing integration tests call `/api/widgets` only after successful login.
- Therefore unauthenticated `/api/widgets` path is currently untested.

Break change (intentional bug):
- In `server.js`, change unauthorized widgets response from `401` to `200`.
- Current buggy line example:

```js
if (req.cookies.token !== 'fake-jwt-token') return res.status(200).json({ error: 'unauthorized' });
```

Run:

```bash
npm run test:integration
```

Expected result:
- Tests still pass.

Teaching point:
- Passing tests can miss untested branches.
- This is a perfect real-world example of coverage gap.

## 4) Add Missing Test First (Red/Green) (10 minutes)

Add this test to `test/integration.test.js`:

```js
test('GET /api/widgets returns 401 when unauthenticated', async () => {
  const res = await request(app).get('/api/widgets');
  expect(res.statusCode).toBe(401);
  expect(res.body).toEqual({ error: 'unauthorized' });
});
```

Run:

```bash
npm run test:integration
```

Expected result while bug is still present:
- New test fails (expected 401, received 200)

Teaching point:
- Test captures intended behavior before fix.
- This is the "red" phase.

## 5) Fix The Bug (Green) (5 minutes)

Fix in `server.js`:

```js
if (req.cookies.token !== 'fake-jwt-token') return res.status(401).json({ error: 'unauthorized' });
```

Re-run:

```bash
npm run test:integration
```

Expected result:
- Integration suite passes.

Teaching point:
- This is "green" after fixing implementation to match expected behavior.

## 6) Optional UI Contract Break Demo (8 minutes)

If time allows, show a frontend regression and how UI tests catch it.

Intentional break in `public/static/js/bundle.js`:
- Change login request method from `POST` to `GET` in `Login` click handler.

Run:

```bash
npm run test:ui
```

Expected failure:
- Assertion fails where test expects `method: 'POST'` for `/api/login` request.

Restore code and re-run to green.

Talking point:
- UI tests protect behavior that users and APIs depend on.

## 7) Wrap-Up Discussion (7 minutes)

Key lessons:
- Good tests are about risk, not quantity.
- A passing suite can still have blind spots.
- Add tests for important negative paths (unauthorized, invalid input, failures).
- Use targeted suites during development (`test:integration`, `test:ui`).

Ask students:
- What other untested branches can they spot?
- Which test type should cover each branch and why?

## Suggested Narration Script Snippets

- "Watch this: I broke authorization behavior, but tests still pass. That means our suite has a gap, not that the bug is harmless."
- "Now we add a test for the missing branch first. We expect failure before fix."
- "After the fix, green tests now mean more than before because coverage improved."

## Troubleshooting During Live Demo

If a test unexpectedly passes or fails:
1. Confirm the file was saved.
2. Re-run the targeted suite, not all tests.
3. Verify you edited the intended branch/line.
4. If needed, run full suite once to ensure no unrelated issue.

Useful commands:

```bash
npm run test:integration
npm run test:ui
npm test
```

## Time-Compressed 20-Minute Version

1. Run `npm test` (2 min)
2. Break unauthorized widgets response (2 min)
3. Run `npm run test:integration` and show false confidence (3 min)
4. Add unauthenticated widgets test (5 min)
5. Fix code and rerun to green (4 min)
6. 4-minute debrief on test gaps and branch coverage

## Post-Class Follow-Up Ideas

- Add tests for:
  - `/api/login` missing body fields
  - `/api/widgets` server error path (mock DB failure)
  - `/api/logout` behavior validation
- Introduce coverage reporting and discuss what percentages do and do not mean.

