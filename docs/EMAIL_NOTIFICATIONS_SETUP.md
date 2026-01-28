# Email Notifications Setup Guide

This guide explains how to configure email notifications for the Master-DB Submodule Update Notifier.

## What Gets Notified

Emails are sent when:
- ✅ Master-DB is updated (push to master branch)
- ✅ Submodule update events are dispatched to dependent repositories
- ✅ Includes summary of successful and failed dispatches

## Quick Setup (5 minutes)

### Step 1: Create a Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **Security** → **2-Step Verification** → **App passwords**
4. Click **Select app** → **Mail** → **Select device** → **Other (Custom name)**
5. Name it "GitHub Actions - Master-DB"
6. Click **Generate**
7. **Copy the 16-character password** (you'll need it in Step 3)

### Step 2: Add GitHub Secrets

Go to: **https://github.com/1fi-finance/Master-DB/settings/secrets/actions**

Click **New repository secret** and add these three secrets:

#### Secret 1: EMAIL_RECIPIENTS
```
Name: EMAIL_RECIPIENTS
Value: tech@1fi.in
```

#### Secret 2: EMAIL_USERNAME
```
Name: EMAIL_USERNAME
Value: your-email@gmail.com
```
(Use your actual Gmail address)

#### Secret 3: EMAIL_PASSWORD
```
Name: EMAIL_PASSWORD
Value: xxxx xxxx xxxx xxxx
```
(Paste the 16-character app password from Step 1)

### Step 3: Verify Setup

1. Go to: **https://github.com/1fi-finance/Master-DB/actions**
2. Click on latest "Submodule Update Notifier" workflow run
3. Scroll to "Send email notification" step
4. Should see: ✓ Sent successfully

## Testing the Setup

### Manual Test

Trigger the workflow manually:

1. Go to: **https://github.com/1fi-finance/Master-DB/actions**
2. Click "Submodule Update Notifier"
3. Click "Run workflow" → "Run workflow"
4. Check your email at tech@1fi.in

### Test via Push

Make a test commit:

```bash
git commit --allow-empty -m "test: email notifications"
git push origin master
```

## Email Template

Here's what the email looks like:

```
Subject: Master-DB Submodule Update - 2 dispatched, 0 failed

Master-DB submodule update has been triggered.

Commit: e95dc5f...
Author: Your Name
Message: test: trigger submodule notification workflow

Summary:
- Successfully dispatched to: 2 repositories
- Failed to dispatch to: 0 repositories

Workflow: https://github.com/1fi-finance/Master-DB/actions/runs/123456789
```

## Troubleshooting

### Email Not Sending

**Check:**
1. Are all three secrets configured?
2. Is the app password correct (16 characters)?
3. Is 2-Step Verification enabled on your Google account?
4. Check workflow logs for error messages

### Common Errors

**Error: "Invalid credentials"**
- Double-check EMAIL_USERNAME and EMAIL_PASSWORD
- Generate a new app password if needed

**Error: "At least one of 'to', 'cc' or 'bcc' must be specified"**
- Make sure EMAIL_RECIPIENTS is set
- Value should be: tech@1fi.in

**Error: "535 Authentication unsuccessful"**
- Enable "Less secure app access" (not recommended)
- OR use App Password (recommended)

### Workflow Logs

Check the "Send email notification" step in Actions:

✅ Success:
```
Sent with success
```

❌ Failure:
```
Error: Error sending email
```

## Security Best Practices

### ✅ Recommended

- Use **App Passwords** (not your main password)
- Use a dedicated Gmail account for CI/CD
- Rotate app passwords regularly
- Limit email notifications to essential people

### ❌ Avoid

- Don't use your personal Gmail password
- Don't share app passwords in plain text
- Don't commit credentials to git
- Don't use app passwords for other purposes

## Alternative Email Providers

### Using Google Workspace

If using a company email (@1fi.in):

1. Go to: [Google Admin Console](https://admin.google.com/)
2. Go to **Security** → **Authentication** → **App passwords**
3. Enable app passwords for your account
4. Generate password and follow steps above

### Using SendGrid

For transactional emails:

```yaml
- name: Send email notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.sendgrid.net
    server_port: 587
    username: ${{ secrets.SENDGRID_USERNAME }}
    password: ${{ secrets.SENDGRID_PASSWORD }}
    # ... rest of configuration
```

### Using AWS SES

```yaml
- name: Send email notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: email-smtp.us-east-1.amazonaws.com
    server_port: 587
    username: ${{ secrets.AWS_SES_USERNAME }}
    password: ${{ secrets.AWS_SES_PASSWORD }}
    # ... rest of configuration
```

## Configuration Options

### Multiple Recipients

```
tech@1fi.in,dev@1fi.in,manager@1fi.in
```

### Conditional Notifications

Only email on failures:

```yaml
if: failure() && secrets.EMAIL_RECIPIENTS != ''
```

### Custom Email Subject

```yaml
subject: "[${{ github.event.head_commit.author.name }}] Master-DB updated"
```

## Monitoring

### Check Email History

In Gmail, search for:
```
from:GitHub Actions subject:Master-DB
```

### Workflow Statistics

Check how often emails are sent:
1. Go to Actions tab
2. Filter by "Submodule Update Notifier"
3. View run history

## Advanced: HTML Emails

To send formatted HTML emails, create an HTML template:

```yaml
body: |
  <html>
    <body>
      <h2>Master-DB Update</h2>
      <p>Commit: ${{ github.sha }}</p>
      <p><a href="https://github.com/1fi-finance/Master-DB/actions/runs/${{ github.run_id }}">View Workflow</a></p>
    </body>
  </html>
```

## Support

If you need help:
- Check workflow logs: https://github.com/1fi-finance/Master-DB/actions
- Review email provider documentation
- Contact: tech@1fi.in

## Example Setup for tech@1fi.in

**Step 1:** Go to https://myaccount.google.com/apppasswords

**Step 2:** Select:
- App: Mail
- Device: GitHub Actions - Master-DB

**Step 3:** Click Generate and copy the password (e.g., `abcd efgh ijkl mnop`)

**Step 4:** Add to GitHub secrets:
- EMAIL_RECIPIENTS = `tech@1fi.in`
- EMAIL_USERNAME = `your-email@gmail.com`
- EMAIL_PASSWORD = `abcd efgh ijkl mnop`

**Step 5:** Test with a commit to Master-DB

**Done!** 🎉
