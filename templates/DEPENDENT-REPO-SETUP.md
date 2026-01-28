# Setup Guide: Dependent Repository Automation

This guide explains how to configure a dependent repository to automatically receive updates from the Master-DB submodule.

## Overview

When Master-DB is updated, dependent repositories will:
1. Automatically receive a notification event
2. Update the Master-DB submodule reference
3. Create a Pull Request with the changes
4. Wait for manual review and merge

## Prerequisites

- Repository must use Master-DB as a submodule
- Repository must be in the `1fi-finance` GitHub organization
- Git submodule must be initialized: `git submodule update --init`

## Setup Instructions

### Step 1: Add the Workflow

Copy the workflow template to your repository:

```bash
# Create the workflows directory if it doesn't exist
mkdir -p .github/workflows

# Copy the template
cp templates/dependent-repo-submodule-updater.yml .github/workflows/
```

Or create the file manually at:
```
.github/workflows/update-master-db-submodule.yml
```

### Step 2: Configure the Workflow (Optional)

Edit the workflow if your submodule path is different:

```yaml
env:
  SUBMODULE_PATH: Master-DB  # Change if your submodule is elsewhere
```

### Step 3: Commit and Push

```bash
git add .github/workflows/update-master-db-submodule.yml
git commit -m "chore: add automated Master-DB submodule updates"
git push origin main
```

### Step 4: Verify the Workflow

1. Go to your repository's Actions tab
2. You should see "Update Master-DB Submodule" workflow
3. Click "Run workflow" to test manually

## How It Works

### Automatic Flow

```
Master-DB Updated
     │
     ├─→ Submodule Update Notifier runs in Master-DB
     │       │
     │       └─→ Discovers your repo uses Master-DB
     │
     └─→ Sends dispatch event to your repo
             │
             └─→ Your workflow triggers:
                     │
                     ├─→ Updates submodule reference
                     ├─→ Creates feature branch
                     ├─→ Commits changes
                     ├─→ Pushes branch
                     └─→ Creates Pull Request
```

### What You Get

- **Pull Request**: Auto-created with descriptive message
- **Branch**: Named `update/master-db-{commit-sha}`
- **Labels**: `dependencies`, `automated-pr`, `submodule-update`
- **Details**: Full commit info and review checklist

### Before Merging

Review the PR and verify:

- [ ] Schema changes are compatible
- [ ] No breaking changes for your application
- [ ] Run your test suite locally
- [ ] Check migration files (if any)

## Manual Updates (Optional)

If you prefer to update manually, you can still:

```bash
# Update submodule
git submodule update --remote Master-DB

# Commit and push
git add Master-DB
git commit -m "chore: update Master-DB submodule"
git push
```

## Troubleshooting

### Workflow Not Triggering

**Check:**
1. Is your repo in the `1fi-finance` org?
2. Does your `.gitmodules` file reference Master-DB?
3. Is the workflow file in `.github/workflows/`?
4. Check Actions logs for errors

### PR Not Created

**Check:**
1. Were there actual changes in Master-DB?
2. Does the workflow have `pull-requests: write` permission?
3. Check if a PR for this commit already exists
4. Review the job logs in Actions

### Submodule Path Issues

If your submodule is not at the root:

```yaml
env:
  SUBMODULE_PATH: path/to/Master-DB  # Adjust path
```

## Configuration Options

### Auto-Merge (Not Recommended)

To automatically merge the PR (dangerous!):

```yaml
- name: Create Pull Request
  uses: peter-evans/create-pull-request@v6
  with:
    # ... other settings
    auto-merge: method-merge  # DANGEROUS!
```

### Custom Branch Names

Change the branch naming pattern:

```yaml
BRANCH_NAME="deps/update-master-db-${{ steps.event-data.outputs.sha }}"
```

### Additional Labels

Add more labels:

```yaml
labels: |
  dependencies
  automated-pr
  database
  schema
```

### Assign Reviewers

```yaml
reviewers: username1,username2
team-reviewers: team-name
```

## Example PR

Here's what an auto-created PR looks like:

```
Title: chore: update Master-DB submodule

Body:
## 🔄 Master-DB Submodule Update

This PR updates the Master-DB submodule to the latest commit.

### 📦 Update Details

- Commit: `51a8d85...`
- Updated by: John Doe
- Original Message: fix: remove all external notifications...

### ⚠️ Review Checklist

Before merging, please verify:

- [ ] Review the schema changes in Master-DB
- [ ] Check for any breaking changes
- [ ] Ensure application is compatible
- [ ] Run tests locally
```

## Security Considerations

- Workflow uses `GITHUB_TOKEN` (no PAT needed in dependent repo)
- Creates PRs, not direct pushes
- Requires manual review before merge
- Can't merge itself without explicit configuration

## Need Help?

- Check Master-DB issues: https://github.com/1fi-finance/Master-DB/issues
- Review workflow runs: https://github.com/1fi-finance/Master-DB/actions
- Contact: DevOps team

## Advanced: Custom Actions

You can extend the workflow to:

1. Run tests automatically
2. Deploy to staging environment
3. Notify team in Slack
4. Create Jira ticket
5. Update documentation

Example: Add testing step

```yaml
- name: Run tests
  run: |
    npm ci
    npm test
    npm run build
```
