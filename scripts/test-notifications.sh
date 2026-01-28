#!/bin/bash

# Notification Test Script
# Tests notification channels (Slack, Discord, Email) before deploying workflows

set -e

echo "🧪 Testing Notification Channels"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if required tools are available
echo "Checking dependencies..."

if ! command -v curl &> /dev/null; then
    print_error "curl is not installed"
    exit 1
fi
print_success "curl is installed"

if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed. Install with: apt install jq or brew install jq"
    echo "  Continuing without JSON formatting..."
    JQ_AVAILABLE=false
else
    print_success "jq is installed"
    JQ_AVAILABLE=true
fi

echo ""

# Test Slack webhook
test_slack() {
    local webhook_url=$1
    echo "Testing Slack webhook..."

    local payload=$(cat <<EOF
{
  "text": "🧪 Test Notification from Master-DB Submodule Automation",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🧪 Test Notification"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Status:*\nTest"
        },
        {
          "type": "mrkdwn",
          "text": "*Time:*\n$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)"
        }
      ]
    }
  ]
}
EOF
)

    local response=$(curl -s -X POST "$webhook_url" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        print_success "Slack webhook is working"
        return 0
    else
        print_error "Slack webhook failed (HTTP $http_code)"
        if [ "$JQ_AVAILABLE" = true ]; then
            echo "$body" | jq . 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
        return 1
    fi
}

# Test Discord webhook
test_discord() {
    local webhook_url=$1
    echo "Testing Discord webhook..."

    local payload=$(cat <<EOF
{
  "content": "",
  "embeds": [{
    "title": "🧪 Test Notification",
    "description": "This is a test notification from Master-DB Submodule Automation",
    "color": 3066993,
    "fields": [
      {"name": "Status", "value": "Test", "inline": true},
      {"name": "Time", "value": "$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)", "inline": true}
    ],
    "footer": {"text": "Master-DB Submodule Automation"}
  }]
}
EOF
)

    local response=$(curl -s -X POST "$webhook_url" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        -w "\n%{http_code}")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ] || [ "$http_code" = "204 No Content" ]; then
        print_success "Discord webhook is working"
        return 0
    else
        print_error "Discord webhook failed (HTTP $http_code)"
        if [ "$JQ_AVAILABLE" = true ]; then
            echo "$body" | jq . 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
        return 1
    fi
}

# Test email configuration
test_email() {
    local username=$1
    local password=$2
    local recipients=$3
    echo "Testing email configuration..."

    print_warning "Email testing requires manual verification"
    print_info "Configuration:"
    echo "  Username: $username"
    echo "  Recipients: $recipients"
    echo ""

    # Try to connect to SMTP server
    local smtp_server="smtp.gmail.com"
    local port=587

    print_info "Attempting to connect to $smtp_server:$port..."

    if timeout 5 bash -c "echo >/dev/tcp/$smtp_server/$port" 2>/dev/null; then
        print_success "Can connect to $smtp_server:$port"
    else
        print_error "Cannot connect to $smtp_server:$port"
        print_info "Check your network connection and SMTP server settings"
        return 1
    fi

    print_info "Email configuration looks valid"
    print_info "Send a test email to verify authentication works:"
    echo ""
    echo "  echo 'Test email body' | mail -s 'Test Subject' $recipients"
    echo ""
    echo "Or use swaks (if installed):"
    echo "  swaks --to $recipients --server $smtp_server --port $port --auth-login --tls \\
    --auth-user $username --auth-password '<password>'"
    echo ""

    return 0
}

# Main execution
main() {
    # Check if secrets are provided as arguments or environment variables
    SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL:-$1}
    DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL:-$2}
    EMAIL_USERNAME=${EMAIL_USERNAME:-$3}
    EMAIL_PASSWORD=${EMAIL_PASSWORD:-$4}
    EMAIL_RECIPIENTS=${EMAIL_RECIPIENTS:-$5}

    # Test Slack if configured
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        echo "================================"
        test_slack "$SLACK_WEBHOOK_URL"
        echo ""
    else
        print_warning "SLACK_WEBHOOK_URL not set, skipping Slack test"
        echo ""
    fi

    # Test Discord if configured
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        echo "================================"
        test_discord "$DISCORD_WEBHOOK_URL"
        echo ""
    else
        print_warning "DISCORD_WEBHOOK_URL not set, skipping Discord test"
        echo ""
    fi

    # Test Email if configured
    if [ -n "$EMAIL_USERNAME" ]; then
        echo "================================"
        test_email "$EMAIL_USERNAME" "$EMAIL_PASSWORD" "$EMAIL_RECIPIENTS"
        echo ""
    else
        print_warning "Email credentials not set, skipping email test"
        echo ""
    fi

    echo "================================"
    echo "✅ Notification testing complete!"
    echo ""
    echo "Next steps:"
    echo "1. If webhooks are working, add them to GitHub secrets"
    echo "2. For email, send a manual test to verify"
    echo "3. Run ./scripts/validate-workflows.sh to validate workflows"
    echo "4. Follow docs/SETUP_GUIDE.md for complete setup"
}

# Show usage if requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 [slack_webhook_url] [discord_webhook_url] [email_username] [email_password] [email_recipients]"
    echo ""
    echo "Or set environment variables:"
    echo "  SLACK_WEBHOOK_URL='https://hooks.slack.com/...'"
    echo "  DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'"
    echo "  EMAIL_USERNAME='your-email@gmail.com'"
    echo "  EMAIL_PASSWORD='your-app-password'"
    echo "  EMAIL_RECIPIENTS='team@example.com'"
    echo ""
    echo "Examples:"
    echo "  # Test Slack only"
    echo "  SLACK_WEBHOOK_URL='https://hooks.slack.com/...' $0"
    echo ""
    echo "  # Test all channels"
    echo "  $0 'https://hooks.slack.com/...' 'https://discord.com/api/webhooks/...' 'user@gmail.com' 'password' 'team@example.com'"
    exit 0
fi

# Run main function
main "$@"
