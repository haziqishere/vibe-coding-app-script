# Vibe Coding Competition

Monorepo for all 5 Vibe coding challenges with automated CI/CD.

## Quick Start

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd vibe-coding-comp
chmod +x scripts/*.sh
```

### 2. Initialize Challenges
```bash
# NPM install clasp if you still havent have
npm install -g @google/clasp

# Login to clasp
clasp login

# Initialize each challenge
./scripts/init-challenge.sh 1 "Challenge 1 Title"
./scripts/init-challenge.sh 2 "Challenge 2 Title"
# ... repeat for 3, 4, 5
```

### 3. Setup GitHub Secrets
1. Get clasp credentials:
```bash
   cat ~/.clasprc.json
```
2. Go to GitHub repo → Settings → Secrets → Actions
3. Create secret `CLASP_TOKEN` with the content

### 4. Connect Claude to GitHub
1. In Claude.ai, go to integrations
2. Connect GitHub and authorize this repository
3. Claude can now read your codebase automatically

## Development Workflow

### Working on a Challenge
```bash
# Create feature branch
git checkout -b feature/challenge-2-api

# Edit code
code challenges/challenge-2/src/main.js

# Test locally
./scripts/deploy-challenge.sh 2

# Commit and push
git add challenges/challenge-2/
git commit -m "feat(c2): add API integration"
git push origin feature/challenge-2-api
```

### Auto-Deployment
- **Push to master** → Auto-detects changed challenges → Deploys only those
- **Shared code changes** → Deploys ALL challenges automatically

### Manual Deployment

**Via GitHub:**
- Go to Actions → Deploy Changed Challenges → Run workflow
- Enter challenge numbers: `1,3,5` or `all`

**Via CLI:**
```bash
# Single challenge
./scripts/deploy-challenge.sh 3

# All challenges
./scripts/deploy-all.sh
```

## Working with Claude

### Get code help
```
"Claude, check challenges/challenge-3/src/ and help me add email 
validation. Use the shared utilities if applicable."
```

### Review architecture
```
"Claude, review challenges/challenge-1/ and challenge-2/ and tell me 
if there's duplicated code we should move to shared/utils/"
```

### Debug deployment
```
"Claude, check the recent commit changes in challenges/challenge-4/ 
and tell me why the deployment might be failing."
```

## Project Structure
```
vibe-coding-comp/
├── challenges/          # 5 independent Apps Script projects
├── shared/             # Shared utilities across challenges
├── docs/               # Documentation
├── scripts/            # Deployment scripts
└── .github/workflows/  # CI/CD automation
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `./scripts/deploy-challenge.sh N` | Deploy specific challenge |
| `./scripts/deploy-all.sh` | Deploy all challenges |
| `clasp open` | Open Apps Script editor (from challenge dir) |
| `clasp logs` | View execution logs |
| `clasp deployments` | List all deployments |

## Troubleshooting

### "No .clasp.json found"
Run `./scripts/init-challenge.sh <number>` first

### "Deployment failed"
1. Check GitHub Actions logs
2. Verify `CLASP_TOKEN` secret is set
3. Test locally: `cd challenges/challenge-N && clasp push`

### "Permission denied"
```bash
chmod +x scripts/*.sh
```

## Links
- [Challenge Index](docs/challenge-index.md)
- [Conventions](docs/CONVENTIONS.md)
- [Architecture](docs/ARCHITECTURE.md)