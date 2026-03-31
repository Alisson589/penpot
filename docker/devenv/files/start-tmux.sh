#!/usr/bin/env bash

sudo chown penpot:users /home/penpot

cd ~;

source ~/.bashrc

echo "[start-tmux.sh] Installing node dependencies"
pushd ~/penpot/frontend/
./scripts/setup;
popd
pushd ~/penpot/exporter/
./scripts/setup;
popd

tmux -2 new-session -d -s penpot

tmux rename-window -t penpot:0 'frontend watch'
tmux select-window -t penpot:0
tmux send-keys -t penpot 'cd penpot/frontend' enter C-l
tmux send-keys -t penpot 'export HTTP_PORT=3448 && ./scripts/watch app' enter

tmux new-window -t penpot:1 -n 'frontend storybook'
tmux select-window -t penpot:1
tmux send-keys -t penpot 'cd penpot/frontend' enter C-l
tmux send-keys -t penpot './scripts/watch storybook' enter

tmux new-window -t penpot:2 -n 'exporter'
tmux select-window -t penpot:2
tmux send-keys -t penpot 'cd penpot/exporter' enter C-l
tmux send-keys -t penpot 'rm -f target/app.js*' enter C-l
tmux send-keys -t penpot './scripts/watch' enter

tmux split-window -v
tmux send-keys -t penpot 'cd penpot/exporter' enter C-l
tmux send-keys -t penpot './scripts/wait-and-start.sh' enter

tmux new-window -t penpot:3 -n 'backend'
tmux select-window -t penpot:3
tmux send-keys -t penpot 'cd penpot/backend' enter C-l
tmux send-keys -t penpot './scripts/start-dev' enter

tmux new-window -t penpot:4 -n 'mcp'
tmux select-window -t penpot:4
tmux send-keys -t penpot 'echo "MCP runs in separate container: penpot-mcp-dev"' enter
tmux send-keys -t penpot 'echo "Use: dev-mcp.sh logs | dev-mcp.sh shell | dev-mcp.sh restart"' enter

tmux -2 attach-session -t penpot
