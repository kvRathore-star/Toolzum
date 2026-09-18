# Testing Honesty Notes (rescued — load-bearing judgment)

These three rules govern how test numbers may be stated externally
(changelog, scorecard, marketing). Violating any of them turns a true
number into a false claim.

## 1. Coverage definition: test-file coverage, not statement coverage

When we say "1,200+ tests" or "suite green," that counts **test files
and cases exercising behavioral contracts** (render-smoke per slug,
API contracts, gate suites) — NOT statement/branch coverage of the
codebase. Never present test counts as "X% covered" without running
`vitest run --coverage` and quoting that number instead. A green suite
with 1,300 tests can still leave entire modules unexecuted; the gates
(privacy, data-migrations, credit-badge) are the load-bearing parts,
not the count.

## 2. Dependency tests ≠ tool tests

A passing test for a library, hook, or shared shell (device detection,
consent helper, CalculatorShell rendering) proves the **dependency**,
not the **tool**. Tool correctness requires the tool's own oracle
(inputs → exact expected outputs, e.g. health-finance-oracles) or a
render-and-interact case. Counting shared-infra tests toward "tools
verified" is the specific inflation this rule forbids.

## 3. Revenue-critical first

Verification effort goes to money paths first, in this order: checkout
pricing correctness (create-order amounts vs advertised) → credit
accounting (deduction, floor logic, reset, Pass grant/expiry) →
quota gating (the conversion trigger) → everything else. A green
peripheral suite with an untested checkout is a red program wearing
green paint. New revenue-facing behavior ships with its contract test
in the same commit, or it does not ship.
