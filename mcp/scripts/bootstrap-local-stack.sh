#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${MCP_DIR}/.." && pwd)"
DEVENV_DIR="${REPO_ROOT}/docker/devenv"
COMPOSE_FILE="${DEVENV_DIR}/docker-compose.linux-mcp.yaml"
CONTAINER_NAME="penpot-devenv-main"
SOURCE_ROOT_IN_CONTAINER="/home/penpot/penpot"

log() {
  printf '[bootstrap-local-stack] %s\n' "$*"
}

ensure_container_running() {
  local current_user_id
  current_user_id="${CURRENT_USER_ID:-$(id -u)}"

  log "Starting docker compose base services"
  (
    cd "${DEVENV_DIR}"
    PROJECT_ROOT="${REPO_ROOT}" CURRENT_USER_ID="${current_user_id}" docker compose -f "${COMPOSE_FILE##*/}" up -d --force-recreate
  )

  log "Waiting for container ${CONTAINER_NAME}"
  for _ in $(seq 1 60); do
    if docker ps --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
      return 0
    fi
    sleep 1
  done

  log "Container ${CONTAINER_NAME} did not become ready"
  exit 1
}

exec_in_main() {
  docker exec "${CONTAINER_NAME}" bash -lc "$1"
}

ensure_source_mount() {
  if ! exec_in_main "[ -d '${SOURCE_ROOT_IN_CONTAINER}/frontend' ] && [ -d '${SOURCE_ROOT_IN_CONTAINER}/backend' ] && [ -d '${SOURCE_ROOT_IN_CONTAINER}/exporter' ] && [ -d '${SOURCE_ROOT_IN_CONTAINER}/mcp' ]"; then
    cat <<EOF
[bootstrap-local-stack] Source checkout is not mounted at ${SOURCE_ROOT_IN_CONTAINER}.
[bootstrap-local-stack] The current container only has the devenv files mounted, so it cannot start frontend/backend/exporter/mcp from source.
[bootstrap-local-stack] Fix the bind mount first, then rerun this script.
EOF
    exit 1
  fi
}

kill_pattern() {
  local pattern="$1"
  exec_in_main "
    current_pid=\$$
    pids=\$(pgrep -f '${pattern}' || true)
    if [[ -n \"\${pids}\" ]]; then
      echo \"Killing pattern ${pattern}: \${pids}\"
      for pid in \${pids}; do
        if [[ \"\${pid}\" != \"\${current_pid}\" ]]; then
          kill \"\${pid}\" 2>/dev/null || true
        fi
      done
    fi
  "
}

start_detached() {
  local label="$1"
  local workdir="$2"
  local command="$3"
  local logfile="/tmp/${label}.log"

  log "Starting ${label}"
  exec_in_main "
    session='penpot-mcp-local'
    if ! tmux has-session -t \"\${session}\" 2>/dev/null; then
      tmux -2 new-session -d -s \"\${session}\" -n '${label}'
    else
      tmux new-window -t \"\${session}\" -n '${label}'
    fi
    tmux send-keys -t \"\${session}:${label}\" 'cd ${workdir}' C-m
    tmux send-keys -t \"\${session}:${label}\" '${command} | tee ${logfile}' C-m
  "
}

wait_for_http() {
  local url="$1"
  local label="$2"
  for _ in $(seq 1 90); do
    if curl -kfsS "${url}" >/dev/null 2>&1; then
      log "${label} is responding at ${url}"
      return 0
    fi
    sleep 2
  done
  log "Timed out waiting for ${label} at ${url}"
  return 1
}

wait_for_mcp_http() {
  local url="$1"
  for _ in $(seq 1 90); do
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' "${url}" || true)"
    if [[ "${code}" == "200" || "${code}" == "400" || "${code}" == "405" || "${code}" == "406" ]]; then
      log "mcp http is responding at ${url} with status ${code}"
      return 0
    fi
    sleep 2
  done
  log "Timed out waiting for mcp http at ${url}"
  return 1
}

ensure_container_running
ensure_source_mount

log "Cleaning existing Penpot/MCP dev processes inside ${CONTAINER_NAME}"
exec_in_main "tmux kill-session -t penpot-mcp-local 2>/dev/null || true"
kill_pattern "/home/penpot/penpot/penpot/frontend/.*/watch app"
kill_pattern "shadow-cljs.*app"
kill_pattern "/home/penpot/penpot/penpot/backend/.*/start-dev"
kill_pattern "/home/penpot/penpot/penpot/exporter/.*/scripts/watch"
kill_pattern "/home/penpot/penpot/penpot/exporter/.*/wait-and-start.sh"
kill_pattern "/home/penpot/penpot/penpot/mcp/packages/server/.*/node dist/index.js"
kill_pattern "/home/penpot/penpot/penpot/mcp/.*/start-clean.sh"

start_detached "penpot-frontend-watch" "${SOURCE_ROOT_IN_CONTAINER}/frontend" "./scripts/watch app"
start_detached "penpot-backend-dev" "${SOURCE_ROOT_IN_CONTAINER}/backend" "./scripts/start-dev"
start_detached "penpot-exporter-watch" "${SOURCE_ROOT_IN_CONTAINER}/exporter" "./scripts/watch"
start_detached "penpot-exporter-runtime" "${SOURCE_ROOT_IN_CONTAINER}/exporter" "bash ./scripts/wait-and-start.sh"
start_detached "penpot-mcp" "${SOURCE_ROOT_IN_CONTAINER}/mcp" "bash ./scripts/start-clean.sh"

log "Running health checks"
wait_for_http "https://localhost:3449" "frontend https" || true
wait_for_http "http://localhost:3450" "frontend http" || true
wait_for_http "https://localhost:3449/export" "export route" || true
wait_for_http "http://localhost:4400/manifest.json" "plugin manifest" || true
wait_for_mcp_http "http://localhost:4401/mcp" || true

cat <<'EOF'

Stack bootstrap finished.

Useful URLs:
- Penpot: https://localhost:3449
- Fallback: http://localhost:3450
- Plugin manifest: http://localhost:4400/manifest.json
- MCP HTTP: http://localhost:4401/mcp

Useful logs inside the container:
- /tmp/penpot-frontend-watch.log
- /tmp/penpot-backend-dev.log
- /tmp/penpot-exporter-watch.log
- /tmp/penpot-exporter-runtime.log
- /tmp/penpot-mcp.log

Example:
  docker exec -it penpot-devenv-main bash -lc 'tail -f /tmp/penpot-mcp.log'
EOF
