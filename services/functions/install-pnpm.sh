#!/bin/bash
# Install pnpm if not available (for Cloud Build)
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm@latest
fi
pnpm --version

