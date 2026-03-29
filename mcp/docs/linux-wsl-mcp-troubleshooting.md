# Linux/WSL MCP Troubleshooting Log

This log captures the issues found while validating the Penpot MCP stack on Linux running inside WSL, plus the fixes that restored end-to-end behavior.

## 1. MCP HTTP/plugin servers bound only to loopback

- Symptom:
  - `http://localhost:4400/manifest.json` failed from the host
  - `http://localhost:4401/mcp` failed from the host
  - inside the container, `ss -ltnp` showed `[::1]:4400` and `[::1]:4401`
- Cause:
  - the MCP bootstrap process started with the default host configuration and advertised `localhost`
- Fix:
  - start MCP with explicit env vars:
    - `PENPOT_MCP_SERVER_HOST=0.0.0.0`
    - `PENPOT_MCP_PLUGIN_SERVER_HOST=0.0.0.0`
    - `PENPOT_MCP_SERVER_ADDRESS=localhost`
    - `WS_URI=http://localhost:4402`
- Validation:
  - `ss -ltnp` showed `0.0.0.0:4400` and `0.0.0.0:4401`
  - host `manifest.json` returned `200`
  - host `/mcp` returned `406 Not Acceptable` without MCP headers, which is expected

## 2. MCP restart collision on port 4402

- Symptom:
  - MCP server crashed on startup with `EADDRINUSE ... port: 4402`
- Cause:
  - an orphan process still held the websocket port after a previous restart attempt
- Fix:
  - kill the old MCP processes before restarting the bootstrap
- Validation:
  - MCP server started cleanly and websocket bridge accepted a new plugin connection

## 3. Frontend returned `404` after container restart

- Symptom:
  - `https://localhost:3449` returned `404 Not Found`
  - `nginx` access log showed repeated `GET /` and `HEAD /` with `404`
- Cause:
  - the container layout mounted the repository at `/home/penpot/penpot/penpot`, but `nginx` was configured to serve from `/home/penpot/penpot/frontend/...`
- Fix:
  - create compatibility symlinks:
    - `/home/penpot/penpot/frontend -> /home/penpot/penpot/penpot/frontend`
    - `/home/penpot/penpot/backend -> /home/penpot/penpot/penpot/backend`
    - `/home/penpot/penpot/mcp -> /home/penpot/penpot/penpot/mcp`
    - `/home/penpot/penpot/plugins -> /home/penpot/penpot/penpot/plugins`
    - `/home/penpot/penpot/exporter -> /home/penpot/penpot/penpot/exporter`
- Validation:
  - `https://localhost:3449` returned `200`
  - `https://localhost:3449/js/libs.js` returned `200`
  - `https://localhost:3449/js/main.js` returned `200`

## 4. Export pipeline broken by Playwright/browser revision mismatch

- Symptom:
  - `export_shape` failed with an HTTP/export error
  - exporter runtime and installed browser revision did not match
- Cause:
  - `exporter/scripts/setup` used `pnpx playwright install chromium`
  - `pnpx` resolved a different Playwright version than the exporter runtime, which installed the wrong browser revision
- Fix:
  - change `exporter/scripts/setup` to use:
    - `pnpm exec playwright install chromium`
- Validation:
  - Playwright launched successfully with the exporter runtime
  - direct `render.html` checks produced the expected `#screenshot-*` node
  - `export_shape` later returned PNG data through MCP

## 5. Plugin looked connected but returned `fileId/pageId = null`

- Symptom:
  - websocket connected successfully
  - `execute_code` returned `fileId: null` and `pageId: null`
- Cause:
  - the validation code queried `penpot.activeFile` and `penpot.activePage`
  - the current Penpot plugin API exposes `penpot.currentFile` and `penpot.currentPage`
- Fix:
  - use the current API names:
    - `penpot.currentFile`
    - `penpot.currentPage`
- Validation:
  - MCP session returned the expected active file and page ids
  - `execute_code` created shapes in the open document
  - `export_shape` succeeded for a shape created through the connected plugin session

## 6. Shape creation failed with `Value not valid`

- Symptom:
  - an `execute_code` test failed with `Value not valid`
- Cause:
  - the shape fill payload used outdated keys (`color`, `opacity`)
- Fix:
  - use the current `Fill` schema:
    - `fillColor`
    - `fillOpacity`
- Validation:
  - the rectangle was created successfully and exported through `export_shape`

## Final state

The MCP stack is working end to end in this environment:

- Penpot frontend reachable on `https://localhost:3449`
- MCP plugin manifest reachable on `http://localhost:4400/manifest.json`
- MCP HTTP endpoint reachable on `http://localhost:4401/mcp`
- plugin websocket connected
- `execute_code` works against the active file
- `export_shape` returns PNG data successfully
