#!/bin/bash
# Script to set up branch protection for main branch
# Run: bash scripts/setup-branch-protection.sh

set -e

REPO="lineup-builder/lineup-builder"
BRANCH="main"

echo "Setting up branch protection for $BRANCH branch..."

# Check if GitHub CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub CLI is not authenticated."
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is authenticated"

# Set up branch protection
echo "Configuring branch protection rules..."

gh api repos/$REPO/branches/$BRANCH/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "✅ Branch protection rules configured for $BRANCH"
echo ""
echo "Current settings:"
echo "  - Require pull request reviews: ✅"
echo "  - Required approvals: 1"
echo "  - Require branches to be up to date: ✅"
echo "  - Include administrators: ✅"
echo "  - Allow force pushes: ❌"
echo "  - Allow deletions: ❌"

