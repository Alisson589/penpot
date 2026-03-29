#!/usr/bin/env bash

set -euo pipefail

patterns=(
  "node dist/index.js"
  "vite build --watch --config vite.config.ts"
)

for pattern in "${patterns[@]}"; do
  pids="$(pgrep -f "${pattern}" || true)"
  if [[ -n "${pids}" ]]; then
    echo "Cleaning matching processes for pattern '${pattern}': ${pids}"
    for pid in ${pids}; do
      kill "${pid}" 2>/dev/null || true
    done

    for _ in $(seq 1 20); do
      if ! pgrep -f "${pattern}" >/dev/null 2>&1; then
        break
      fi
      sleep 0.2
    done
  fi
done

ports=(
  "${PENPOT_MCP_PLUGIN_SERVER_PORT:-4400}"
  "${PENPOT_MCP_SERVER_PORT:-4401}"
  "${PENPOT_MCP_WEBSOCKET_PORT:-4402}"
  "${PENPOT_MCP_REPL_PORT:-4403}"
)

for port in "${ports[@]}"; do
  pids="$(ss -ltnp 2>/dev/null | awk -v port=":${port}" '$4 ~ port"$" { print $NF }' | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u)"
  if [[ -n "${pids}" ]]; then
    echo "Cleaning listeners on port ${port}: ${pids}"
    for pid in ${pids}; do
      kill "${pid}" 2>/dev/null || true
    done

    for _ in $(seq 1 20); do
      if ! ss -ltnp 2>/dev/null | awk -v port=":${port}" '$4 ~ port"$" { found=1 } END { exit found ? 0 : 1 }'; then
        break
      fi
      sleep 0.2
    done
  fi
done

exec pnpm -r --parallel run start
