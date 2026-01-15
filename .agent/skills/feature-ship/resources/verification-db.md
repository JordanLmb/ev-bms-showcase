# PROJECT VERIFICATION DATABASE

## A. PRE-FLIGHT CHECKLIST (MANDATORY - Start of LAW 1)
- [ ] **RULE ACKNOWLEDGMENT:** Read `resources/prime-directive.md` using `view_file`. State: "Acknowledging Prime Directive."
- [ ] **TOOL CHECK:** Confirm MCP servers (`magic`, `github`, `supabase`, `postgres`, `context7`) are connected.
- [ ] **ENVIRONMENT CHECK:** Verify Node/npm, Git, and Docker are available.

## B. TECHNICAL SPECIFICS & TROUBLESHOOTING
*Add specific fixes here as per LAW 6 (Knowledge Compounding).*

### 1. Windows/Shell Commands
- **COMMAND:** Always use `npx.cmd` or `npm.cmd` explicitly if generic commands fail.
- **CHAINING:** PowerShell does NOT support `&&`. Use `;` for sequential execution, or wrap in `cmd /c "cmd1 && cmd2"`.
- **DELETION:** Use `Remove-Item -Recurse -Force` in PowerShell.
- **SECURITY/PERMS:** If you hit `PSSecurityException` or "running scripts is disabled":
    - Bypass by running: `cmd /c "npm run dev"`
    - Avoid `kill-port` if it triggers script blocks; use `taskkill /F /IM node.exe` (carefully) or just retry `npm run dev`.

### 2. Next.js Project Setup
- **DIRECTORY:** Run `create-next-app` in an empty `temp` folder, then move contents to root.

### 3. Testing (Jest)
- **SETUP:** Ensure `jest`, `@types/jest`, and `ts-node` are installed as devDependencies.
- **RUN:** Use `npm test` or `npx.cmd jest`.

### 4. Pyodide & Python Testing
- **SHADOW TEST:** To verify Python logic intended for Pyodide without complex mocking, write a standard Python unit test (`unittest`) and run it locally with `python tests/test_name.py`. This confirms the logic works before integrating with WASM.
- **VERSION MISMATCH:** If you see `Pyodide version does not match` in the browser console, ensure the `indexURL` in the worker matches the version installed via npm. Check with `npm list pyodide` and update the CDN URL accordingly (e.g., `https://cdn.jsdelivr.net/pyodide/v0.29.1/full/`).
- **WORKER FETCH URLS:** Web Workers cannot resolve relative URLs like `/path/to/file`. Use `${self.location.origin}/path/to/file` to construct absolute URLs for fetch calls inside workers.

## C. FEATURE-SPECIFIC VERIFICATION

### Feature: "Upload CSV and Display Chart"
- [ ] **Backend Test:** API accepts CSV, returns parsed JSON. Test with `curl`.
- [ ] **Frontend Test:** Chart library (Tremor/Recharts) renders with mock data.
- [ ] **Integration Test:** Full flow: upload -> parse -> display. Browser agent takes a screenshot.
- [ ] **UI Check:** Screenshot matches "Void Aesthetic" (dark purple, glassmorphism).
### 4. Vercel Deployment & Subpaths
- **ISSUE:** Deploying to a subpath (e.g., /ProjectName) causes 404s for assets and API routes.
- **FIX:** Set BasePath: "/ProjectName" in next.config.ts.
- **CRITICAL:** Manually prepend the base path to all internal fetch calls (e.g., fetch("/ProjectName/api/...")).

### 5. Mobile Responsiveness
- **TABLES:** Avoid wide tables on mobile. Use hidden md:block for table view and md:hidden for a stacked "Card List" view.
- **FILTERS:** Stack search bars and filters vertically on mobile to prevent overflow.

### 6. Framer Motion
- **ANIMATE PRESENCE:** Wrapping conditional renders with <AnimatePresence> is required for exit animations to trigger.
