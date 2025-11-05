#!/bin/bash
# Predeploy script for Firebase Functions
# This script builds the api-trpc package and copies it to node_modules

set -e

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Get project root (two levels up from services/functions)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Building api-trpc package..."
cd "$PROJECT_ROOT/packages/api-trpc"
pnpm run build

echo "Copying built api-trpc to vendor directory (for Cloud Build compatibility)..."
cd "$SCRIPT_DIR"
# Create vendor directory (not in node_modules, so it persists through npm install)
mkdir -p vendor/@chumacomply
rm -rf vendor/@chumacomply/api-trpc
# Copy the entire dist directory
cp -r "$PROJECT_ROOT/packages/api-trpc/dist" vendor/@chumacomply/api-trpc/

# Copy creates: vendor/@chumacomply/api-trpc/src/ (not dist/src/)
# So we need to update package.json to reflect the actual structure
cat > vendor/@chumacomply/api-trpc/package.json <<EOF
{
  "name": "@chumacomply/api-trpc",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.js",
  "types": "src/index.d.ts",
  "exports": {
    ".": {
      "import": "./src/index.js",
      "types": "./src/index.d.ts"
    }
  }
}
EOF

# Verify the copied package exists (checking actual structure)
if [ ! -f "vendor/@chumacomply/api-trpc/src/index.js" ]; then
  echo "ERROR: api-trpc package not found after copy!"
  echo "Checking what was actually copied..."
  ls -la vendor/@chumacomply/api-trpc/ 2>&1 || echo "vendor directory not found"
  find vendor/@chumacomply/api-trpc -name "*.js" 2>&1 | head -5 || echo "No JS files found"
  exit 1
fi
echo "✓ api-trpc package verified: vendor/@chumacomply/api-trpc/src/index.js exists"

# Install dependencies using pnpm
echo "Installing function dependencies with pnpm..."
cd "$SCRIPT_DIR"
pnpm install --no-frozen-lockfile

echo "Building functions..."
pnpm run build

echo "Predeploy complete!"

