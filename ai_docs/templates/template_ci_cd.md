---
title: "CI/CD Templates for agentland.saarland"
version: "1.0.0"
date: "2025-05-16"
status: "active"
---

# CI/CD Templates for agentland.saarland

This template defines the Continuous Integration and Continuous Deployment (CI/CD) workflows, GitHub Actions configurations, and development scripts for agentland.saarland projects.

## GitHub Workflows

### Pull Request Checks

```yaml
# .github/workflows/pr-main-checks.yml
name: PR Main Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    name: Lint Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
  
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
  
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
  
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run secret scanning
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Check for hardcoded secrets
        run: |
          # Custom patterns for finding potential hardcoded secrets
          ! grep -r --include="*.{ts,js,json}" -E "(secret|password|apikey|token)([ ]?[:=][ ]?[\'\"])[^\'\"]+" --exclude-dir={node_modules,.git,dist}
      
      - name: Run npm audit
        run: npm audit --audit-level=high
```

### Documentation Checks

```yaml
# .github/workflows/docs-check.yml
name: Documentation Checks

on:
  pull_request:
    paths:
      - '**/*.md'
      - 'ai_docs/**'
      - 'docs/**'

jobs:
  markdown-lint:
    name: Markdown Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run markdown lint
        run: npx markdownlint-cli "**/*.md" --ignore node_modules
  
  check-links:
    name: Check Links
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run link checker
        run: bash tools/ci/check_links.sh
  
  validate-toc:
    name: Validate Table of Contents
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run TOC validator
        run: bash tools/ci/validate_toc.sh
  
  check-memory-bank:
    name: Check Memory Bank
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run memory bank validator
        run: bash tools/ci/check_memory_bank.sh
```

### RTEF Trigger

```yaml
# .github/workflows/rtef-trigger.yml
name: RTEF Trigger

on:
  push:
    branches: [ main ]
    paths:
      - 'ai_docs/memory-bank/progress.md'
      - 'ai_docs/templates/**'

jobs:
  check-for-template-updates:
    name: Check for Template Updates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2
      
      - name: Check for RTEF updates
        id: rtef
        run: |
          git diff HEAD^ HEAD --name-only | grep -q "ai_docs/templates/" && echo "templates_changed=true" >> $GITHUB_OUTPUT || echo "templates_changed=false" >> $GITHUB_OUTPUT
          git diff HEAD^ HEAD --name-only | grep -q "ai_docs/memory-bank/progress.md" && echo "progress_changed=true" >> $GITHUB_OUTPUT || echo "progress_changed=false" >> $GITHUB_OUTPUT
      
      - name: Check for template_diff tags
        if: ${{ steps.rtef.outputs.progress_changed == 'true' }}
        id: template_diff
        run: |
          grep -q "<template_diff>" ai_docs/memory-bank/progress.md && echo "has_template_diff=true" >> $GITHUB_OUTPUT || echo "has_template_diff=false" >> $GITHUB_OUTPUT
      
      - name: Create RTEF issue
        if: ${{ steps.rtef.outputs.templates_changed == 'true' || steps.template_diff.outputs.has_template_diff == 'true' }}
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const templatesChanged = ${{ steps.rtef.outputs.templates_changed }};
            const hasTemplateDiff = ${{ steps.template_diff.outputs.has_template_diff }};
            
            let title, body;
            
            if (templatesChanged) {
              title = 'RTEF: Template updates detected';
              body = 'Changes to template files have been detected. Please review the changes and update dependent systems accordingly.';
            } else if (hasTemplateDiff) {
              title = 'RTEF: Template diff tag detected in progress.md';
              body = 'A template_diff tag has been detected in progress.md. Please review the suggested changes and update templates accordingly.';
            }
            
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['rtef', 'template-update']
            });
```

### Continuous Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]
    paths-ignore:
      - '**/*.md'
      - 'ai_docs/**'
      - 'docs/**'

jobs:
  deploy-development:
    name: Deploy to Development
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to development
        run: |
          # Deployment script for development environment
          echo "Deploying to development environment..."
  
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to production
        run: |
          # Deployment script for production environment
          echo "Deploying to production environment..."
```

## Pull Request Template

```markdown
# .github/pull_request_template.md
## Description

[Provide a brief description of the changes in this pull request]

## Type of Change

Please check the options that are relevant:

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update
- [ ] RTEF template update

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

## Security Checklist

- [ ] No hardcoded secrets or credentials in the codebase
- [ ] Environment variables are validated before use
- [ ] Input validation is implemented for all user inputs
- [ ] Authentication and authorization are properly implemented
- [ ] CSRF protection is implemented for state-changing operations
- [ ] API endpoints are properly secured
- [ ] Secure HTTP headers are set (Content-Security-Policy, X-XSS-Protection, etc.)
- [ ] Dependencies are free from known vulnerabilities
- [ ] Logging does not expose sensitive information
- [ ] Error handling does not expose sensitive information

## Additional Notes

[Add any other information or screenshots about the pull request here]
```

## CI Scripts

### Check Links

```bash
#!/bin/bash
# tools/ci/check_links.sh

# Check all links in markdown files for validity

set -e

echo "Checking links in markdown files..."

# Find all markdown files
FILES=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*")

# Check for broken internal links
for FILE in $FILES; do
  echo "Checking links in $FILE"
  
  # Extract all internal links
  LINKS=$(grep -o '\[.*\](.*\.md)' "$FILE" | sed -E 's/\[.*\]\((.*)\)/\1/')
  
  # Check each link
  for LINK in $LINKS; do
    # Handle relative links
    if [[ "$LINK" == /* ]]; then
      # Absolute path within the repository
      TARGET=".${LINK}"
    else
      # Relative path
      DIR=$(dirname "$FILE")
      TARGET="${DIR}/${LINK}"
    fi
    
    # Normalize path
    TARGET=$(realpath --relative-to="." "$TARGET")
    
    # Check if the file exists
    if [ ! -f "$TARGET" ]; then
      echo "ERROR: Broken link in $FILE: $LINK (target: $TARGET does not exist)"
      exit 1
    fi
  done
done

echo "All links are valid!"
```

### Validate Table of Contents

```bash
#!/bin/bash
# tools/ci/validate_toc.sh

# Validate table of contents in markdown files

set -e

echo "Validating table of contents in markdown files..."

# Find all markdown files with a table of contents
FILES=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" -exec grep -l "## Table of Contents" {} \;)

for FILE in $FILES; do
  echo "Checking TOC in $FILE"
  
  # Extract the table of contents
  TOC=$(awk '/## Table of Contents/,/^##[^#]/' "$FILE" | grep -E '^\s*\* \[.*\]\(#.*\)' | sed -E 's/\s*\* \[(.*)\]\(#(.*)\)/\1|\2/')
  
  # Extract all headings
  HEADINGS=$(grep -E '^##[^#]' "$FILE" | sed -E 's/^## (.*)/\1/')
  
  # Check each TOC entry
  while IFS='|' read -r TITLE ANCHOR; do
    if [ -z "$TITLE" ]; then
      continue
    fi
    
    # Check if the heading exists
    if ! echo "$HEADINGS" | grep -q "$TITLE"; then
      echo "ERROR: TOC entry '$TITLE' does not match any heading in $FILE"
      exit 1
    fi
  done <<< "$TOC"
  
  # Check each heading
  while IFS= read -r HEADING; do
    if [ -z "$HEADING" ]; then
      continue
    fi
    
    # Skip "Table of Contents" heading
    if [ "$HEADING" == "Table of Contents" ]; then
      continue
    fi
    
    # Check if the heading is in the TOC
    if ! echo "$TOC" | grep -q "^$HEADING|"; then
      echo "ERROR: Heading '$HEADING' is missing from the TOC in $FILE"
      exit 1
    fi
  done <<< "$HEADINGS"
done

echo "All tables of contents are valid!"
```

### Check Memory Bank

```bash
#!/bin/bash
# tools/ci/check_memory_bank.sh

# Validate memory bank files

set -e

echo "Checking memory bank files..."

# Required memory bank files
REQUIRED_FILES=(
  "ai_docs/memory-bank/activeContext.md"
  "ai_docs/memory-bank/memoryController.md"
  "ai_docs/memory-bank/productContext.md"
  "ai_docs/memory-bank/progress.md"
  "ai_docs/memory-bank/projectbrief.md"
  "ai_docs/memory-bank/systemPatterns.md"
  "ai_docs/memory-bank/techContext.md"
)

# Check if required files exist
for FILE in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "ERROR: Required memory bank file $FILE does not exist"
    exit 1
  fi
done

# Check if progress.md has YAML frontmatter
if ! grep -q "^---" "ai_docs/memory-bank/progress.md"; then
  echo "ERROR: progress.md does not have YAML frontmatter"
  exit 1
fi

# Check if progress.md has memory_update tags
if ! grep -q "<memory_update" "ai_docs/memory-bank/progress.md"; then
  echo "ERROR: progress.md does not have memory_update tags"
  exit 1
fi

# Check if memoryController.md exists and has the required sections
if ! grep -q "## Memory Controller System" "ai_docs/memory-bank/memoryController.md"; then
  echo "ERROR: memoryController.md does not have the required 'Memory Controller System' section"
  exit 1
fi

echo "Memory bank is valid!"
```

### Check Prompt Format

```bash
#!/bin/bash
# tools/ci/check_prompt_format.sh

# Validate prompt format in markdown files

set -e

echo "Checking prompt format in markdown files..."

# Find all prompt files
FILES=$(find . -name "*.md" -path "*/prompts/*" -not -path "./node_modules/*")

for FILE in $FILES; do
  echo "Checking prompt format in $FILE"
  
  # Check if the file has YAML frontmatter
  if ! grep -q "^---" "$FILE"; then
    echo "ERROR: Prompt file $FILE does not have YAML frontmatter"
    exit 1
  fi
  
  # Check if the file has a prompt template section
  if ! grep -q "## Prompt Template" "$FILE"; then
    echo "ERROR: Prompt file $FILE does not have a 'Prompt Template' section"
    exit 1
  fi
  
  # Check if the file has a prompt variables section
  if ! grep -q "## Variables" "$FILE"; then
    echo "ERROR: Prompt file $FILE does not have a 'Variables' section"
    exit 1
  fi
  
  # Check if the file has example prompts
  if ! grep -q "## Example" "$FILE"; then
    echo "ERROR: Prompt file $FILE does not have an 'Example' section"
    exit 1
  fi
done

echo "All prompt files have the correct format!"
```

### Check Structure

```bash
#!/bin/bash
# tools/ci/check_structure.sh

# Validate project structure

set -e

echo "Checking project structure..."

# Required directories
REQUIRED_DIRS=(
  "ai_docs"
  "ai_docs/memory-bank"
  "ai_docs/templates"
  "apps"
  "apps/web"
  "apps/cli"
  "configs"
  "docs"
  "libs"
  "libs/core"
  "libs/agents"
  "libs/mcp"
  "libs/rag"
  "libs/workflows"
  "scripts"
  "tools"
)

# Check if required directories exist
for DIR in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$DIR" ]; then
    echo "ERROR: Required directory $DIR does not exist"
    exit 1
  fi
done

# Required files
REQUIRED_FILES=(
  "CLAUDE.md"
  "README.md"
  "package.json"
  "nx.json"
  "tsconfig.base.json"
)

# Check if required files exist
for FILE in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "ERROR: Required file $FILE does not exist"
    exit 1
  fi
done

echo "Project structure is valid!"
```

### Advanced Prompt Lint

```bash
#!/bin/bash
# tools/ci/advanced_prompt_lint.sh

# Advanced linting for prompt files

set -e

echo "Advanced prompt linting..."

# Find all prompt files
FILES=$(find . -name "*.md" -path "*/prompts/*" -not -path "./node_modules/*")

for FILE in $FILES; do
  echo "Linting prompt file $FILE"
  
  # Check for common issues in prompts
  
  # 1. Check for token placeholder format
  if grep -q "{" "$FILE" && ! grep -q "{{\s*[\$a-zA-Z0-9_]\+\s*}}" "$FILE"; then
    echo "WARNING: Prompt file $FILE may have incorrectly formatted variable placeholders. Use format: {{ variable_name }}"
  fi
  
  # 2. Check for inconsistent placeholder styles
  if grep -q "{{\s*[\$a-zA-Z0-9_]\+\s*}}" "$FILE" && grep -q "\[\s*[\$a-zA-Z0-9_]\+\s*\]" "$FILE"; then
    echo "WARNING: Prompt file $FILE mixes different placeholder styles. Standardize on one style."
  fi
  
  # 3. Check for potential length issues
  TEMPLATE_LINES=$(grep -A 1000 "## Prompt Template" "$FILE" | grep -B 1000 -m 1 "^##" | wc -l)
  if [ "$TEMPLATE_LINES" -gt 100 ]; then
    echo "WARNING: Prompt template in $FILE is very long ($TEMPLATE_LINES lines). Consider breaking it into smaller prompts."
  fi
  
  # 4. Check for undefined variables
  VARIABLES=$(grep -A 1000 "## Variables" "$FILE" | grep -B 1000 -m 1 "^##" | grep -o "\`[a-zA-Z0-9_]\+\`" | tr -d '`')
  TEMPLATE=$(grep -A 1000 "## Prompt Template" "$FILE" | grep -B 1000 -m 1 "^##")
  
  while read -r VAR; do
    if [ -z "$VAR" ]; then
      continue
    fi
    
    if ! echo "$TEMPLATE" | grep -q "{{[[:space:]]*$VAR[[:space:]]*}}"; then
      echo "WARNING: Variable '$VAR' is defined but not used in the prompt template in $FILE"
    fi
  done <<< "$VARIABLES"
  
  # 5. Check for undefined placeholders
  PLACEHOLDERS=$(echo "$TEMPLATE" | grep -o "{{[[:space:]]*[a-zA-Z0-9_]\+[[:space:]]*}}" | sed -E 's/{{[[:space:]]*([a-zA-Z0-9_]+)[[:space:]]*}}/\1/')
  
  while read -r PLACEHOLDER; do
    if [ -z "$PLACEHOLDER" ]; then
      continue
    fi
    
    if ! echo "$VARIABLES" | grep -q "^$PLACEHOLDER$"; then
      echo "WARNING: Placeholder '$PLACEHOLDER' is used in the template but not defined in the variables section in $FILE"
    fi
  done <<< "$PLACEHOLDERS"
done

echo "Advanced prompt linting complete!"
```

### Check Naming

```bash
#!/bin/bash
# tools/ci/check_naming.sh

# Check naming conventions in the codebase

set -e

echo "Checking naming conventions..."

# Check for uppercase file names (except specified exceptions)
UPPERCASE_FILES=$(find . -type f -name "*[A-Z]*" -not -path "./node_modules/*" -not -path "./.git/*" | grep -v "README.md" | grep -v "CLAUDE.md" | grep -v "LICENSE")

if [ -n "$UPPERCASE_FILES" ]; then
  echo "ERROR: Found files with uppercase names (should be kebab-case):"
  echo "$UPPERCASE_FILES"
  exit 1
fi

# Check for camelCase directories (should be kebab-case)
CAMELCASE_DIRS=$(find . -type d -name "*[A-Z]*" -not -path "./node_modules/*" -not -path "./.git/*")

if [ -n "$CAMELCASE_DIRS" ]; then
  echo "ERROR: Found directories with camelCase names (should be kebab-case):"
  echo "$CAMELCASE_DIRS"
  exit 1
fi

# Check for snake_case files (should be kebab-case)
SNAKE_CASE_FILES=$(find . -type f -name "*_*" -not -path "./node_modules/*" -not -path "./.git/*")

if [ -n "$SNAKE_CASE_FILES" ]; then
  echo "ERROR: Found files with snake_case names (should be kebab-case):"
  echo "$SNAKE_CASE_FILES"
  exit 1
fi

# Check for TypeScript files not using .ts or .tsx extension
TS_FILES_WITHOUT_TS_EXT=$(find . -type f -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" | xargs grep -l "^import.*from" | grep -v "config")

if [ -n "$TS_FILES_WITHOUT_TS_EXT" ]; then
  echo "WARNING: Found JavaScript files that appear to use TypeScript imports:"
  echo "$TS_FILES_WITHOUT_TS_EXT"
  echo "Consider migrating these files to TypeScript."
fi

# Check for files without proper extension
FILES_WITHOUT_EXT=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" | grep -v "\." | grep -v "LICENSE" | grep -v "Dockerfile")

if [ -n "$FILES_WITHOUT_EXT" ]; then
  echo "WARNING: Found files without extensions:"
  echo "$FILES_WITHOUT_EXT"
  echo "Consider adding appropriate extensions to these files."
fi

echo "Naming conventions check complete!"
```

## Development Scripts

### Setup All

```bash
#!/bin/bash
# tools/scripts/setup/setup_all.sh

# Set up all components of the agentland.saarland project

set -e

echo "Setting up agentland.saarland..."

# Install dependencies
npm install

# Set up core
bash tools/scripts/setup/install_core.sh

# Set up neural framework
bash tools/scripts/setup/setup_neural_framework.sh

# Set up RAG
bash tools/scripts/setup/setup_rag.sh

# Set up git agent
bash tools/scripts/setup/setup_git_agent.sh

# Set up CICD integration
node tools/scripts/setup/cicd_integration.js

# Set up user color schema
node tools/scripts/setup/setup_user_colorschema.js

# Create about profile
node tools/scripts/setup/create_about.js

echo "agentland.saarland setup complete!"
```

### Start Dashboard

```bash
#!/bin/bash
# start-dashboard.sh

# Start the agentland.saarland dashboard

set -e

echo "Starting agentland.saarland dashboard..."

# Check if port 5000 is available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
  echo "Port 5000 is already in use. Trying to find an available port..."
  
  # Find an available port
  PORT=5001
  while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; do
    PORT=$((PORT+1))
  done
  
  echo "Using port $PORT instead."
else
  PORT=5000
fi

# Navigate to the web app directory
cd apps/web

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the dashboard
echo "Starting dashboard on port $PORT..."
npm run dev -- --port $PORT

echo "Dashboard stopped."
```

### Start MCP Servers

```bash
#!/bin/bash
# scripts/start-mcp-servers.sh

# Start MCP servers

set -e

echo "Starting MCP servers..."

# Check if MCP configuration exists
if [ ! -f "configs/mcp/config.json" ]; then
  echo "ERROR: MCP configuration not found. Please run setup first."
  exit 1
fi

# Start the main MCP server
echo "Starting main MCP server..."
node libs/mcp/src/server/start_server.js &
PID_MAIN=$!

# Start the quality guard server
echo "Starting quality guard server..."
npx ts-node libs/mcp/src/server/quality-guard/index.ts &
PID_QUALITY=$!

# Function to handle script termination
cleanup() {
  echo "Stopping MCP servers..."
  kill $PID_MAIN $PID_QUALITY
  exit 0
}

# Register the cleanup function for exit signals
trap cleanup SIGINT SIGTERM

echo "MCP servers started. Press Ctrl+C to stop."

# Wait for all processes
wait
```

## Git Workflow Scripts

### Feature Start

```bash
#!/bin/bash
# tools/scripts/git/feature-start.js
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get feature name
rl.question('Enter feature name: ', (featureName) => {
  try {
    // Validate feature name
    if (!featureName || featureName.trim() === '') {
      console.error('ERROR: Feature name cannot be empty');
      rl.close();
      return;
    }
    
    // Format feature name
    const formattedName = featureName.toLowerCase().replace(/\s+/g, '-');
    
    // Make sure we're on main branch
    execSync('git checkout main', { stdio: 'inherit' });
    
    // Pull latest changes
    execSync('git pull', { stdio: 'inherit' });
    
    // Create feature branch
    const branchName = `feature/${formattedName}`;
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    
    console.log(`\nFeature branch '${branchName}' created successfully!`);
    console.log(`Start working on your feature and commit your changes.`);
    console.log(`When you're done, run 'node tools/scripts/git/feature-finish.js' to finish the feature.`);
    
    rl.close();
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    rl.close();
  }
});
```

### Feature Finish

```bash
#!/bin/bash
# tools/scripts/git/feature-finish.js
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get current branch
const currentBranch = execSync('git branch --show-current').toString().trim();

// Check if we're on a feature branch
if (!currentBranch.startsWith('feature/')) {
  console.error('ERROR: You are not on a feature branch. Current branch:', currentBranch);
  rl.close();
  process.exit(1);
}

// Ask for confirmation
rl.question(`Are you sure you want to finish feature '${currentBranch}'? (y/n): `, (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Feature finish canceled.');
    rl.close();
    return;
  }
  
  try {
    // Make sure we have the latest changes
    execSync('git fetch', { stdio: 'inherit' });
    
    // Pull main branch
    execSync('git checkout main', { stdio: 'inherit' });
    execSync('git pull', { stdio: 'inherit' });
    
    // Go back to feature branch
    execSync(`git checkout ${currentBranch}`, { stdio: 'inherit' });
    
    // Rebase with main
    execSync('git rebase main', { stdio: 'inherit' });
    
    // Run tests
    console.log('Running tests...');
    execSync('npm test', { stdio: 'inherit' });
    
    // Merge to main
    console.log('Merging to main...');
    execSync('git checkout main', { stdio: 'inherit' });
    execSync(`git merge --no-ff ${currentBranch}`, { stdio: 'inherit' });
    
    // Delete feature branch
    console.log('Deleting feature branch...');
    execSync(`git branch -d ${currentBranch}`, { stdio: 'inherit' });
    
    console.log(`\nFeature '${currentBranch}' finished successfully!`);
    console.log('Push the changes to the remote repository with: git push');
    
    rl.close();
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.log('Please resolve the issues and try again.');
    rl.close();
  }
});
```

## QA Scripts

### Run Tests in Docker

```bash
#!/bin/bash
# tools/scripts/qa/run_tests_in_docker.sh

# Run tests in Docker container for consistent environment

set -e

echo "Running tests in Docker..."

# Build the test image
docker build -t agentland-tests -f Dockerfile.test .

# Run tests in container
docker run --rm agentland-tests npm test

echo "Tests completed successfully!"
```

### Daily Smoke Test

```bash
#!/bin/bash
# tools/scripts/qa/workflows/daily_smoke_test.sh

# Daily smoke test to verify the system is working

set -e

echo "Running daily smoke test..."

# Start the servers
echo "Starting servers..."
node libs/mcp/src/server/start_server.js &
SERVER_PID=$!

# Wait for servers to start
sleep 5

# Run smoke tests
echo "Running smoke tests..."

# Test MCP
curl -s http://localhost:5000/api/health | grep -q "ok" || (echo "MCP health check failed"; kill $SERVER_PID; exit 1)

# Test A2A
node test-a2a-security.js || (echo "A2A security test failed"; kill $SERVER_PID; exit 1)

# Test RAG
python libs/rag/src/rag_test.py || (echo "RAG test failed"; kill $SERVER_PID; exit 1)

# Stop servers
kill $SERVER_PID

echo "Smoke test completed successfully!"
```

## Best Practices

1. **Automated Testing**: Always include automated tests for all code changes
2. **CI/CD Integration**: All repositories should have CI/CD configured
3. **Documentation Checks**: Include documentation checks for all document changes
4. **Security Scanning**: Include security scanning in CI/CD pipeline
5. **Quality Gates**: Use quality gates to prevent merging of poor quality code
6. **Pull Request Reviews**: Require at least one review for all pull requests
7. **Automated Deployment**: Use automated deployment for all environments
8. **Script Documentation**: Document all scripts with comments
9. **Error Handling**: Include proper error handling in all scripts
10. **Consistent Naming**: Use consistent naming conventions for all files and directories

## Conclusion

This template provides a comprehensive set of CI/CD configurations, GitHub Actions workflows, and development scripts for agentland.saarland projects. By following these standards, projects can maintain high quality, security, and consistency across all components.

## Related Templates

| Template | Relationship |
|----------|--------------|
| [Structure](./template_structure.md) | Defines directory structure for CI/CD scripts and configurations |
| [Security](./template_security.md) | Outlines security scanning and validation integrated in CI/CD |
| [Changelog](./template_changelog.md) | Automated changelog generation connected to CI/CD |
| [Memory Bank](./template_memory_bank.md) | Memory bank validation in CI/CD workflows |

## Integration Points

CI/CD processes integrate with various components of the agentland.saarland system:

1. **RTEF System** - Workflows trigger template updates based on memory bank changes
2. **Security Framework** - Security scanning integrated in CI/CD pipeline
3. **Build System** - Build processes automated through CI/CD
4. **Documentation** - Documentation validation and generation in CI/CD
5. **Testing Framework** - Automated testing in CI/CD workflows

## Changelog

- **1.0.0** (2025-05-16): Initial version based on the agentland.saarland project