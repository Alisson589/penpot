#!/usr/bin/env bash
#
# dev-watch.sh — MCP development entrypoint with hot-reload
#
# This script runs inside the MCP container. It:
#   1. Enables corepack and installs pnpm
#   2. Installs dependencies (pnpm install)
#   3. Installs nodemon globally for server watch
#   4. Builds all packages
#   5. Starts all packages in parallel with watch mode:
#      - plugin: vite build --watch (native hot-reload)
#      - server: nodemon watching src/ → rebuild + restart
#

set -euo pipefail

export CI=true

cd /workspace/mcp

echo "[dev-watch] Enabling corepack and pnpm..."
corepack enable
corepack prepare --activate

echo "[dev-watch] Installing dependencies..."
pnpm install

echo "[dev-watch] Installing nodemon for server hot-reload..."
pnpm add -g nodemon

echo "[dev-watch] Building all packages..."
pnpm run build

echo "[dev-watch] Starting watch processes..."

# Start the plugin (vite --watch handles hot-reload natively)
pnpm --filter mcp-plugin run start &
PLUGIN_PID=$!

# Start the server with nodemon for auto-rebuild + restart
nodemon \
  --watch packages/server/src \
  --watch packages/common/src \
  --ext ts \
  --exec "pnpm --filter mcp-server run build:server && pnpm --filter mcp-server run start" \
  &
SERVER_PID=$!

# Wait for any child to exit, then propagate
wait -n
echo "[dev-watch] A process exited, shutting down..."
kill $PLUGIN_PID $SERVER_PID 2>/dev/null || true
exit 1
