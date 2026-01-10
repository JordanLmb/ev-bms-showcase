---
description: A specialized Failproof workflow for fixing bugs.
---

# Bug Fix Workflow

// turbo-all
A disciplined protocol to fix bugs without creating new ones.

## 1. Investigator (Reproduce)
- [ ] **Research**: Use **Context7 MCP** if the error message is obscure to find the root cause.
- [ ] **Reproduction File**: Create `repro.test.ts` (or similar) that *fails* with the reported bug.
- [ ] **Confirm**: Run the test and confirm it is RED (failing).

## 2. Surgeon (Fix)
- [ ] **Analyze**: Read `agy/rules.md`.
- [ ] **Fix**: Edit the code to resolve the issue.
- [ ] **Verify**: Run `repro.test.ts` until it is GREEN (passing).

## 3. Auditor (Regression & Cleanup)
- [ ] **Scan**: Use **Context7** or **Jest** to run related tests ensuring no regressions.
- [ ] **Commit**: `git commit -m "fix: <description>"`
- [ ] **Compounding Rule**: Update `VERIFICATION.md` with a new check to prevent this bug from returning.
