# Agent Bootstrap Instructions

Run these commands in your terminal to initialize a new project from the Failproof Template.

## 1. Clone & Rename
Replace `my-new-app` with your project name.
```bash
git clone https://github.com/JordanLmb/antigravity-failproof-template.git my-new-app
cd my-new-app
```

## 2. Detach from Template (Start Fresh)
Remove the old git history to start your own project history.
```bash
# Windows (PowerShell)
rm -r -fo .git
git init
git add .
git commit -m "root: Project initialized from Failproof Template"

# Mac/Linux
rm -rf .git
git init
git add .
git commit -m "root: Project initialized from Failproof Template"
```

## 3. Configure Keys
Copy the safe example config to the active config.
```bash
# Windows
copy mcp_config.example.json mcp_config.json

# Mac/Linux
cp mcp_config.example.json mcp_config.json
```
> **STOP**: Open `mcp_config.json` and paste your API keys before proceeding.

## 4. Launch
```bash
# Install dependencies
npm install

# Start the Failproof Workflow
# (Type this in your Agent chat)
/feature-ship "Analyze requirements for the MVP"
```
