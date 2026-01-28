# Quick Reference Guide

Quick reference for common tasks and commands related to the submodule update automation.

## Common Commands

### Local Testing

```bash
# Validate workflow syntax
./scripts/validate-workflows.sh

# Test notifier workflow locally (requires act)
act -W .github/workflows/submodule-update-notifier.yml --dryrun

# Test with secrets
act -W .github/workflows/submodule-update-notifier.yml \
  --secret-file .secrets \
  --container-architecture linux/amd64

# Test specific job
act -W .github/workflows/submodule-update-notifier.yml \
  --job discover-and-dispatch \
  --dryrun
```

### Manual Workflow Triggers

```bash
# Trigger notifier workflow manually via GitHub CLI
gh workflow run submodule-update-notifier.yml \
  -f sha=<commit-sha>

# View workflow runs
gh run list --workflow=submodule-update-notifier.yml

# Watch specific run
gh run watch <run-id>

# View workflow logs
gh run view <run-id> --log
```

### Superproject Management

```bash
# Update submodule manually in a superproject
git submodule update --remote path/to/db

# Check submodule status
git submodule status

# See submodule commit history
cd path/to/db
git log --oneline -10

# Sync all submodules
git submodule sync --recursive
```

## GitHub Actions Cheatsheet

### Workflow Syntax

```yaml
# Basic workflow structure
name: Workflow Name
on:
  push:
    branches: [main]
  repository_dispatch:
    types: [event-name]
  workflow_dispatch:
    inputs:
      parameter:
        description: 'Description'
        required: true
        type: string

jobs:
  job-name:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Step name
        run: echo "Hello"
```

### Common Actions

```yaml
# Checkout repository
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.PAT }}

# Run GitHub Script
- uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      // JavaScript code here
      console.log("Hello from GitHub Script");

# Create Pull Request
- uses: peter-evans/create-pull-request@v6
  with:
    token: ${{ secrets.PAT }}
    branch: feature-branch
    title: PR Title
    body: PR Body

# Retry action with exponential backoff
- uses: nick-fields/retry-action@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    retry_on: error
    command: |
      # Your command here
```

### GitHub Script API

```javascript
// List repositories in organization
const repos = await github.rest.repos.listForOrg({
  org: 'organization-name',
  per_page: 100
});

// Get repository contents
const content = await github.rest.repos.getContent({
  owner: 'owner',
  repo: 'repo-name',
  path: 'path/to/file'
});

// Create issue
const issue = await github.rest.issues.create({
  owner: context.repo.owner,
  repo: context.repo.repo,
  title: 'Issue Title',
  body: 'Issue Body',
  labels: ['bug', 'needs-attention']
});

// Create pull request
const pr = await github.rest.pulls.create({
  owner: context.repo.owner,
  repo: context.repo.repo,
  title: 'PR Title',
  head: 'feature-branch',
  base: 'main',
  body: 'PR Body'
});

// Add comment to issue/PR
await github.rest.issues.createComment({
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: 123,
  body: 'Comment body'
});
```

## Troubleshooting Commands

### Check Workflow Status

```bash
# List recent workflow runs
gh run list --workflow=submodule-update-notifier.yml --limit 10

# View specific run details
gh run view <run-id>

# View failed run with logs
gh run view <run-id> --log-failed

# Cancel running workflow
gh run cancel <run-id>

# Re-run failed workflow
gh run rerun <run-id>
```

### Debug Repository Dispatch

```bash
# Check if dispatch was sent
gh api repos/1fi-finance/<repo-name>/dispatches

# View recent dispatch events
gh api /repos/1fi-finance/Master-DB/actions/workflows/submodule-update-notifier.yml/dispatches

# Test dispatch manually
gh api -X POST \
  repos/1fi-finance/<repo-name>/dispatches \
  -f event_type=submodule-updated \
  -f client_payload='{"sha":"test123","branch":"main"}'
```

### Check Secrets

```bash
# List secrets (names only, values hidden)
gh secret list

# Check if specific secret exists
gh secret get SECRET_NAME

# Set secret via CLI
echo "secret-value" | gh secret set SECRET_NAME
```

### Monitor GitHub API Rate Limits

```bash
# Check rate limit status
gh api rate_limit

# Check specific rate limit (e.g., search)
gh api rate_limit --jq .resources.search
```

## Common Issues and Quick Fixes

### Issue: Workflow not triggering

**Check:**
```bash
# Verify workflow file exists
ls -la .github/workflows/

# Validate YAML syntax
yamllint .github/workflows/submodule-update-notifier.yml

# Check workflow is enabled
gh workflow view submodule-update-notifier.yml
```

**Fix:** Ensure workflow is in `.github/workflows/` and has valid YAML syntax

### Issue: Permission denied errors

**Check:**
```bash
# Verify PAT scopes
# (Manual check in GitHub Settings)
```

**Fix:** Regenerate PAT with correct scopes: `repo`, `workflow`, `admin:org`

### Issue: Dispatch not received

**Check:**
```bash
# Verify webhook is enabled in target repo
gh api repos/1fi-finance/<repo-name>/hooks

# Check repo settings allow actions
gh repo view --json actionsAllowed
```

**Fix:** Ensure workflow file exists in target repo and `MASTER_DB_PAT` secret is set

### Issue: Tests failing

**Check:**
```bash
# Run tests locally
npm test

# Check test output in workflow logs
gh run view <run-id> --log | grep -A 50 "Run tests"
```

**Fix:** Fix failing tests or configure `skip_tests: true` in `.github/submodule-config.yml`

### Issue: Migration conflicts

**Check:**
```bash
# Check migration status
npm run db:check

# View migration diff
npm run db:diff
```

**Fix:** Resolve migration conflicts or configure `migration_check: false` in config

## File Locations Reference

### Master-DB Repository

```
.github/
  workflows/
    submodule-update-notifier.yml    # Main automation workflow
  submodule-update-config.yml         # Global configuration
templates/
  submodule-updater.yml               # Template for superprojects
  submodule-config.yml                # Config template for superprojects
docs/
  SETUP_GUIDE.md                      # Detailed setup instructions
  QUICK_REFERENCE.md                  # This file
scripts/
  validate-workflows.sh               # Workflow validation script
```

### Superproject Repository

```
.github/
  workflows/
    submodule-updater.yml             # Receives updates
  submodule-config.yml                # Optional overrides
```

## Environment Variables Reference

### Workflow Context Variables

```yaml
${{ github.sha }}                      # Commit SHA
${{ github.ref }}                      # Branch/ref
${{ github.repository }}               # Owner/repo
${{ github.actor }}                    # Username who triggered
${{ github.event_name }}               # Event type
${{ github.server_url }}               # GitHub server URL
${{ github.run_id }}                   # Workflow run ID
${{ github.run_number }}               # Workflow run number
```

### Custom Variables

```yaml
${{ steps.step-id.outputs.output-name }}  # Output from step
${{ secrets.SECRET_NAME }}                # Repository secret
${{ vars.VARIABLE_NAME }}                 # Repository variable
```

## Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub REST API](https://docs.github.com/en/rest)
- [actions/github-script](https://github.com/actions/github-script)
- [peter-evans/create-pull-request](https://github.com/peter-evans/create-pull-request)
- [nektos/act](https://github.com/nektos/act) - Local GitHub Actions runner

## Getting Help

1. Check main README.md troubleshooting section
2. Review SETUP_GUIDE.md for detailed setup
3. Check workflow logs in Actions tab
4. Open issue in Master-DB repository
5. Contact: dev-team@1fi-finance.com
