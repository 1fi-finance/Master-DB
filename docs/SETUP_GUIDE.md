# Submodule Automation Setup Guide

This guide walks you through setting up the automated submodule update system for the first time.

## Prerequisites

- GitHub account with admin access to 1fi-finance organization
- Slack workspace (or other notification platform)
- Email account for SMTP notifications
- Access to all superproject repositories

## Step-by-Step Setup

### Step 1: Generate GitHub Personal Access Token (PAT)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it "Submodule Update Automation"
4. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Ability to trigger workflows in other repos)
   - ✅ `admin:org` (For discovering all repos in organization)
5. Set expiration to 1 year
6. Click "Generate token"
7. **IMPORTANT**: Copy the token immediately (you won't see it again)

### Step 2: Configure Slack Notifications

1. Go to your Slack workspace → Apps → Custom Integrations → Incoming Webhooks
2. Click "Add to Slack"
3. Select the channel where notifications should be posted (e.g., #engineering)
4. Click "Add Incoming Webhooks Integration"
5. Copy the webhook URL (starts with `https://hooks.slack.com/...`)

### Step 3: Configure Email Notifications

**Option A: Gmail**

1. Go to Google Account Settings → Security → 2-Step Verification
2. Enable 2-Step Verification
3. Go to App passwords
4. Create a new app password for "Mail"
5. Copy the 16-character password
6. Use these settings:
   - EMAIL_USERNAME: your-email@gmail.com
   - EMAIL_PASSWORD: the 16-character app password

**Option B: SendGrid (Recommended for production)**

1. Sign up at https://sendgrid.com/
2. Create an API key with "Mail Send" permissions
3. Use these settings:
   - EMAIL_USERNAME: apikey
   - EMAIL_PASSWORD: your-sendgrid-api-key
   - SMTP server: smtp.sendgrid.net
   - Port: 587

### Step 4: Add Secrets to Master-DB Repository

1. Go to https://github.com/1fi-finance/Master-DB/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret:

| Name | Value |
|------|-------|
| `SUBMODULE_UPDATE_PAT` | The GitHub PAT from Step 1 |
| `SLACK_WEBHOOK_URL` | The Slack webhook URL from Step 2 |
| `EMAIL_USERNAME` | Your email username |
| `EMAIL_PASSWORD` | Your email/app password |
| `EMAIL_RECIPIENTS` | dev-team@1fi-finance.com,leads@1fi-finance.com |

4. Optionally add Discord webhook:
   - Name: `DISCORD_WEBHOOK_URL`
   - Value: Your Discord webhook URL

### Step 5: Test Master-DB Workflow

1. Make a small change to Master-DB (e.g., update this file)
2. Commit and push to `main` branch
3. Go to https://github.com/1fi-finance/Master-DB/actions
4. Verify the "Submodule Update Notifier" workflow runs
5. Check the workflow summary for discovered repositories
6. Verify Slack/Discord notifications are received
7. Verify email notification is received

### Step 6: Set Up Superprojects

For each superproject repository:

#### 6a. Add MASTER_DB_PAT Secret

1. Go to the superproject repository → Settings → Secrets → Actions
2. Click "New repository secret"
3. Name: `MASTER_DB_PAT`
4. Value: Use the same GitHub PAT from Step 1 (or generate a new one)
5. Click "Add secret"

#### 6b. Add Updater Workflow

1. Copy `templates/submodule-updater.yml` from Master-DB
2. Create `.github/workflows/` directory in the superproject
3. Add the workflow file as `.github/workflows/submodule-updater.yml`
4. Commit and push

#### 6c. (Optional) Add Configuration

1. Copy `templates/submodule-config.yml` from Master-DB
2. Add as `.github/submodule-config.yml` in the superproject
3. Customize settings as needed
4. Commit and push

### Step 7: Test End-to-End

1. Make another small change to Master-DB
2. Push to `main` branch
3. Monitor the "Submodule Update Notifier" workflow
4. Check that each superproject runs the "Submodule Updater" workflow
5. Verify PRs are created in superprojects
6. Verify validation (tests + migrations) runs
7. Check that notifications are sent

### Step 8: Gradual Rollout (Recommended)

Instead of enabling all superprojects at once:

1. **Week 1**: Enable for 2-3 low-risk projects
2. Monitor for issues
3. Collect feedback from teams
4. Adjust configuration as needed
5. **Week 2**: Enable for 5 more projects
6. Continue monitoring
7. **Week 3+**: Roll out to remaining projects

## Verification Checklist

- [ ] GitHub PAT created with correct scopes
- [ ] Slack webhook configured and tested
- [ ] Email configured and tested
- [ ] All secrets added to Master-DB repository
- [ ] Master-DB workflow tested successfully
- [ ] MASTER_DB_PAT added to all superprojects
- [ ] Updater workflow added to all superprojects
- [ ] End-to-end test successful
- [ ] Team trained on new workflow
- [ ] Documentation shared with stakeholders

## Common Issues and Solutions

### Issue: "Resource not accessible by integration"

**Solution**: The PAT doesn't have sufficient permissions. Regenerate with all required scopes: `repo`, `workflow`, `admin:org`

### Issue: "Rate limit exceeded"

**Solution**: The automation is making too many API requests. Reduce the number of repositories updated in parallel by editing `.github/submodule-update-config.yml`:
```yaml
dispatch:
  parallel_limit: 5  # Reduce from 10
```

### Issue: "Webhook failed to send"

**Solution**: Verify the webhook URL is correct and the service (Slack/Discord) is accessible. Test the webhook manually with curl:
```bash
curl -X POST $WEBHOOK_URL -d '{"text":"Test message"}'
```

### Issue: Tests failing in superproject

**Solution**: This is expected if there are compatibility issues. The automation will create a GitHub issue with details. Fix the compatibility issues in the superproject, then either:
- Re-run the workflow manually
- Merge the fix and wait for the next Master-DB update

## Maintenance Tasks

### Monthly

- [ ] Review failed validations
- [ ] Check success rate metrics
- [ ] Verify all superprojects are receiving updates
- [ ] Review and update documentation as needed

### Quarterly

- [ ] Review PAT expiration dates
- [ ] Audit superproject list (add new projects, remove archived)
- [ ] Review notification effectiveness
- [ ] Adjust timeout settings based on metrics

### Annually

- [ ] Rotate all PATs
- [ ] Review and update this setup guide
- [ ] Conduct security audit of secrets and access

## Support

If you encounter issues not covered here:

1. Check the main README.md troubleshooting section
2. Review workflow logs in the Actions tab
3. Open an issue in the Master-DB repository
4. Contact: dev-team@1fi-finance.com

## Next Steps

After setup is complete:

1. Monitor the first few automated updates
2. Collect feedback from teams
3. Iterate on configuration
4. Document project-specific learnings
5. Share success stories with stakeholders
