---
description: The Master Workflow for shipping features using the Failproof Development System.
---

# Feature Ship Workflow: Failproof Orchestrator

## 0. INITIATE & ACKNOWLEDGE
- [ ] **STATE:** "Beginning Failproof Loop (LAW 1)."
- [ ] **RULE CHECK:** Explicitly read `agy/rules.md` using `view_file`.

## 1. ARCHITECT: Plan & Contract (LAW 1, LAW 3, LAW 7.1)
- [ ] **RESEARCH:** Use **Context7 MCP** for best practices. Use **GitHub MCP** to check for similar code.
- [ ] **STRATEGY GATE (LAW 7.1):** Present user choice: **"Cost-Effective Path"** or **"Full-Generation Path"** for UI. **WAIT for user selection.**
- [ ] **DEFINE CONTRACT:** Create/update `contracts/feature.ts` with exact API/data shapes. **LOCK THIS FILE.**
- [ ] **PLAN:** Create `plan.md` referencing the contract and the chosen UI strategy.
- [ ] **REVIEW GATE:** Present `plan.md` and `contracts/feature.ts` to user. **DO NOT PROCEED without explicit approval.**

## 2. QA: The Shadow Test (LAW 1 - VERIFY)
- [ ] **WRITE FAILURE:** Create `tests/feature.test.ts` that validates the **Contract**. The test **MUST FAIL** initially.
- [ ] **VERIFY RED:** Run the test suite to confirm the failure state.

## 3. FRONTEND: Execute UI (LAW 2, LAW 2.1, LAW 7)
- [ ] **PATH EXECUTION:**
    - **If Cost-Effective:** Search **21st.dev Inspirations (FREE)**. Adapt existing component. **Only use Magic MCP for final styling adjustments.**
    - **If Full-Generation:** Use Magic MCP to generate the complete component.
- [ ] **NO DEVIATION RULE (LAW 2.1):** Implement the generated code **EXACTLY**. If refactoring is needed, **REUSE** existing Magic components. If none exist, **STOP and present plan to user.**
- [ ] **MOCK DATA:** Build UI using mock data from the **Contract**.

## 4. BACKEND: Execute Logic (LAW 1, LAW 4)
- [ ] **IMPLEMENT:** Write API/Logic. **MUST** use `zod`/`Pydantic` for validation (LAW 4).
- [ ] **PASS SHADOW TEST:** Run the test from Step 2. **LOOP** until it passes (Green state). This is the **VALIDATE** phase of LAW 1.
- [ ] **CONNECT:** Replace frontend mocks with real API calls.

## 5. VALIDATE & LEARN (LAW 1, LAW 6)
- [ ] **FINAL VERIFICATION:** Run full test suite & linting. Use browser agent for a visual screenshot.
- [ ] **COMPOUNDING (LAW 6):** Analyze the process. **Propose a specific, one-line update** to `VERIFICATION.md` with any new learnings.
- [ ] **PRESENT:** Show user: working feature, screenshot, test logs, and the proposed knowledge update.

## 6. SHIP (Tool Maximization - LAW 5)
- [ ] **COMMIT:** Create atomic commit.
- [ ] **AUTOMATE:** Use **GitHub MCP** to create a Pull Request with a description of the contract and test results.