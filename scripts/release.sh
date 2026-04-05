#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# release.sh — Bump version, commit, push & trigger CI release
#
# Usage:
#   ./scripts/release.sh              # patch bump (1.1.0 → 1.1.1)
#   ./scripts/release.sh minor        # minor bump (1.1.0 → 1.2.0)
#   ./scripts/release.sh major        # major bump (1.1.0 → 2.0.0)
#   ./scripts/release.sh 2.0.0-beta.1 # explicit version
# ─────────────────────────────────────────────

cd "$(git rev-parse --show-toplevel)"

CURRENT_VERSION=$(node -p "require('./package.json').version")
BUMP="${1:-patch}"

# Determine new version
if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9] ]]; then
  NEW_VERSION="$BUMP"
else
  NEW_VERSION=$(node -p "
    const [major, minor, patch] = '${CURRENT_VERSION}'.split('.').map(Number);
    ({
      patch: [major, minor, patch + 1],
      minor: [major, minor + 1, 0],
      major: [major + 1, 0, 0]
    })['${BUMP}'].join('.')
  ")
fi

echo ""
echo "  Current version: $CURRENT_VERSION"
echo "  New version:     $NEW_VERSION"
echo ""

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ] && [ "$CURRENT_VERSION" = "$NEW_VERSION" ]; then
  echo "✗ Nothing to release — no changes and same version."
  exit 1
fi

# Check the tag doesn't already exist
if git ls-remote --tags origin "refs/tags/v${NEW_VERSION}" 2>/dev/null | grep -q .; then
  echo "✗ Tag v${NEW_VERSION} already exists on remote. Pick a different version."
  exit 1
fi

# Bump version in package.json (without npm's extra git behavior)
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = '${NEW_VERSION}';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update package-lock.json to match
npm install --package-lock-only --silent 2>/dev/null || true

# Stage & commit
git add -A
git commit -m "release v${NEW_VERSION}"

# Push to main → triggers CI
echo ""
echo "  Pushing to origin/main..."
git push origin main

echo ""
echo "  ✓ v${NEW_VERSION} pushed — CI will build & create the GitHub release."
echo "  → https://github.com/alexVivier/promptlib/actions"
echo ""
