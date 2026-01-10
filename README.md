# Antigravity Failproof Template

A disciplined, multi-agent workflow system designed to produce high-quality code with a "Contract-First" and "Failproof" philosophy.

## 🚀 Quick Start
1.  **Clone**: `git clone <your-repo-url> my-new-project`
2.  **Configure**: Copy `mcp_config.example.json` to `mcp_config.json`.
3.  **Fill Keys**: Add your API keys (see Guide below).
4.  **Ship**: Run `/feature-ship "Build a login page"`

---

## 🔑 Setup Guide: Getting Your Keys

### 1. 21st.dev (Magic MCP)
Used for generating premium UI components.
1.  Go to [21st.dev](https://21st.dev/).
2.  Sign up/Log in.
3.  Go to **Settings** or **Dashboard** to find your API Key.
4.  Variable: `TWENTYFIRST_DEV_API_KEY`

### 2. GitHub MCP
Used for creating Pull Requests and managing issues.
1.  Go to [GitHub Developer Settings](https://github.com/settings/tokens).
2.  Generate a **Personal Access Token (Classic)**.
3.  Scopes needed: `repo` (full control of private repositories).
4.  Variable: `GITHUB_PERSONAL_ACCESS_TOKEN`

### 3. Context7 (Upstash)
Used for deep research and context retrieval.
1.  Go to [Upstash Console](https://console.upstash.com/).
2.  Navigate to **Context7** service.
3.  Create an index or view your default project.
4.  Copy the **API Key**.
5.  Variable: `--api-key` in the args list.

### 4. Postgres (Database)
Used for backend data management.
*   **Local**: If you have Postgres installed, use: `postgresql://postgres:password@localhost:5432/your_db_name`
*   **Cloud**: Use a provider like [Neon](https://neon.tech) or [Supabase](https://supabase.com) to get a connection string.
*   Variable: `DATABASE_URL`

---

## 🛠️ Workflows
*   **/feature-ship**: The Master Loop. Plan -> Contract -> Shadow Test -> Build -> Verify -> Publish.
*   **/bug-fix**: The Repair Loop. Reproduce (Red) -> Fix (Green) -> Audit.

## 📜 The Constitution
See `agy/rules.md` for the immutable laws of this repository (Failproof Logic, Security, 21st.dev Protocol).
