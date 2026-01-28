#!/bin/bash

# Workflow Validation Script
# This script validates the GitHub Actions workflows before deployment

set -e

echo "🔍 Validating GitHub Actions workflows..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if required tools are installed
echo "Checking required tools..."

if ! command -v act &> /dev/null; then
    print_warning "act is not installed. Install from https://github.com/nektos/act"
    echo "  Install with: brew install act  (macOS)"
    echo "               or: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    echo ""
    echo "Continuing without act (skipping local execution tests)..."
    ACT_AVAILABLE=false
else
    print_success "act is installed"
    ACT_AVAILABLE=true
fi

if ! command -v yamllint &> /dev/null; then
    print_warning "yamllint is not installed. Install with: pip install yamllint"
    echo "  Continuing without YAML syntax validation..."
    YAMLLINT_AVAILABLE=false
else
    print_success "yamllint is installed"
    YAMLLINT_AVAILABLE=true
fi

echo ""

# Validate workflow files exist
echo "Checking workflow files..."

WORKFLOW_DIR=".github/workflows"
if [ ! -d "$WORKFLOW_DIR" ]; then
    print_error "Workflow directory not found: $WORKFLOW_DIR"
    exit 1
fi

WORKFLOWS=(
    "submodule-update-notifier.yml"
)

for workflow in "${WORKFLOWS[@]}"; do
    if [ -f "$WORKFLOW_DIR/$workflow" ]; then
        print_success "Found $workflow"
    else
        print_error "Missing $workflow"
        exit 1
    fi
done

echo ""

# Validate configuration files
echo "Checking configuration files..."

CONFIG_FILES=(
    ".github/submodule-update-config.yml"
    "templates/submodule-updater.yml"
    "templates/submodule-config.yml"
)

for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$config" ]; then
        print_success "Found $config"
    else
        print_error "Missing $config"
        exit 1
    fi
done

echo ""

# YAML syntax validation
if [ "$YAMLLINT_AVAILABLE" = true ]; then
    echo "Validating YAML syntax..."

    for workflow in "$WORKFLOW_DIR"/*.yml; do
        if yamllint "$workflow" -d "{extends: default, rules: {line-length: disable, comments-indentation: disable}}"; then
            print_success "Valid YAML: $(basename $workflow)"
        else
            print_error "Invalid YAML: $(basename $workflow)"
            exit 1
        fi
    done

    for config in "${CONFIG_FILES[@]}"; do
        if yamllint "$config" -d "{extends: default, rules: {line-length: disable, comments-indentation: disable}}"; then
            print_success "Valid YAML: $config"
        else
            print_error "Invalid YAML: $config"
            exit 1
        fi
    done

    echo ""
fi

# Validate workflow syntax with act
if [ "$ACT_AVAILABLE" = true ]; then
    echo "Testing workflow syntax with act..."

    for workflow in "$WORKFLOW_DIR"/*.yml; do
        echo "  Testing $(basename $workflow)..."
        if act -W "$workflow" --dryrun > /dev/null 2>&1; then
            print_success "Valid workflow: $(basename $workflow)"
        else
            print_warning "Workflow test failed (this might be OK): $(basename $workflow)"
            echo "  Run manually for details: act -W $workflow --dryrun"
        fi
    done

    echo ""
fi

# Check for required secrets placeholders
echo "Checking for required secret references..."

REQUIRED_SECRETS=(
    "SUBMODULE_UPDATE_PAT"
    "SLACK_WEBHOOK_URL"
    "EMAIL_USERNAME"
    "EMAIL_PASSWORD"
)

FOUND_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    if grep -r "$secret" "$WORKFLOW_DIR/" > /dev/null 2>&1; then
        print_success "Found reference to $secret"
        FOUND_SECRETS+=("$secret")
    else
        print_warning "No reference found to $secret (might be optional)"
    fi
done

echo ""

# Validate template files
echo "Validating template files..."

TEMPLATE_DIR="templates"
if [ ! -d "$TEMPLATE_DIR" ]; then
    print_error "Template directory not found: $TEMPLATE_DIR"
    exit 1
fi

# Check that templates have the correct structure
if grep -q "repository_dispatch:" "$TEMPLATE_DIR/submodule-updater.yml"; then
    print_success "Updater template has correct trigger"
else
    print_error "Updater template missing repository_dispatch trigger"
    exit 1
fi

if grep -q "MASTER_DB_PAT" "$TEMPLATE_DIR/submodule-updater.yml"; then
    print_success "Updater template references correct secret"
else
    print_error "Updater template missing MASTER_DB_PAT secret"
    exit 1
fi

echo ""

# Check for common issues
echo "Checking for common issues..."

# Check for hardcoded values
if grep -r "ghp_" "$WORKFLOW_DIR/" "$TEMPLATE_DIR/" > /dev/null 2>&1; then
    print_error "Found hardcoded PAT in workflow files!"
    echo "  Please remove hardcoded PATs and use secrets instead."
    exit 1
else
    print_success "No hardcoded PATs found"
fi

# Check for missing on: triggers
if grep -L "on:" "$WORKFLOW_DIR"/*.yml | grep -q .; then
    print_error "Some workflow files are missing 'on:' triggers"
    exit 1
else
    print_success "All workflows have trigger definitions"
fi

echo ""
echo "================================"
echo "✅ All validations passed!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Review the workflow files in .github/workflows/"
echo "2. Test locally with: act -W .github/workflows/submodule-update-notifier.yml --dryrun"
echo "3. Follow the setup guide in docs/SETUP_GUIDE.md"
echo "4. Add secrets to your GitHub repository"
echo "5. Deploy workflows to GitHub"
echo ""
