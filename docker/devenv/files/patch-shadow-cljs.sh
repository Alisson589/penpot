#!/bin/bash
# Patch shadow-cljs client to use Caddy proxy (HTTPS) instead of direct HTTP

JS_DIR="/home/penpot/penpot/frontend/resources/public/js"

for f in "$JS_DIR/cljs-runtime/cljs_env.js" "$JS_DIR/worker/main.js"; do
  if [ -f "$f" ]; then
    sed -i 's/"server_port":3448/"server_port":3449/g' "$f"
    sed -i 's/"ssl":false/"ssl":true/g' "$f"
    echo "Patched $f"
  fi
done
