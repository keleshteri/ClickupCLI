#!/usr/bin/env bash
# Install ClickUp CLI as a global `clickup` command (Linux & macOS)

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "  ClickUp CLI — Install"
echo "  ─────────────────────────────────────────"
echo ""

# 1. Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "  [1/3] Installing dependencies..."
  npm install --silent
else
  echo "  [1/3] Dependencies already installed."
fi

# 2. Build
echo "  [2/3] Building..."
npm run build --silent
chmod +x dist/index.js

# 3. Link globally
echo "  [3/3] Linking as global command..."
npm link --silent

echo ""
echo "  ✓  Done!"
echo ""
echo "  You can now run from anywhere:"
echo "    clickup --help"
echo "    clickup auth add"
echo "    clickup browse"
echo ""
echo "  To uninstall later:"
echo "    npm unlink -g clickup-cli"
echo ""
