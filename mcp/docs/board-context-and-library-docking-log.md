# Board Context And Library Docking Log

## Date

- 2026-03-29

## Problem Summary

During MCP-driven dashboard work, two issues looked similar but were actually different:

- the board was still present in the page tree, but earlier checks made it look missing
- library components instantiated for toolbar slots were falling back to the page root instead of docking into the intended container

These are dangerous failure modes for AI agents because they can lead to incorrect reasoning:

- agent assumes a board was deleted when it was not
- agent thinks docking succeeded because instantiation returned success
- agent continues mutating the wrong container and degrades the document structure

## What Actually Happened

Recursive listing of the current page showed:

- the board `Pencil Demo Dashboard` was still present at the page root
- nested slot boards such as `Button Slot` were still present inside the dashboard
- prior failures came from using the wrong lookup flow for the current session, not from the board being absent

The docking issue was compounded by a silent fallback path:

- when `targetShapeId` did not resolve correctly, instantiation still succeeded
- the component was appended to the page root
- the response looked superficially successful, but `parentId` and `targetShapeId` did not match the intended target

## Root Causes

1. Board existence was inferred too early.

- shallow checks and stale assumptions were used before recursively inspecting the current page tree

2. Session/context changes were not treated as invalidation points.

- after rebuilds and plugin reloads, a new MCP session was needed
- ids from earlier checks were reused without first re-validating `currentFile` and `currentPage`

3. Targeted library instantiation was too permissive.

- the runtime could silently fall back to the page root when a target container was not resolved

4. MCP startup could succeed only partially.

- the plugin preview on `4400` and the MCP websocket/server on `4401/4402` could end up out of sync
- a stale listener on `4402` caused the new server process to crash with `EADDRINUSE`
- in that state, the repo contained new tool code, but `tools/list` still came from an older live process

## Fixes Applied

### 1. Explicit board-discovery guidance

Added MCP guidance so agents must:

- inspect the current page tree recursively before assuming a board is missing
- separate stale ids from true absence
- re-check context after plugin rebuild/reload

Relevant file:

- [initial_instructions.md](/home/sebas/app/penpot/penpot/mcp/packages/server/data/initial_instructions.md)

### 2. Explicit target-container failure semantics

`instantiate_library_component` now documents the correct contract:

- when `targetShapeId` is given, missing or invalid targets are hard errors
- agents should validate `parentId` and `targetShapeId` after targeted instantiation

Relevant file:

- [InstantiateLibraryComponentTool.ts](/home/sebas/app/penpot/penpot/mcp/packages/server/src/tools/InstantiateLibraryComponentTool.ts)

### 3. Runtime hardening in plugin utils

The plugin runtime now:

- resolves target shapes through page-tree traversal
- throws if `targetShapeId` is provided but the shape is not found on the current page
- throws if the resolved target cannot accept children

Relevant file:

- [PenpotUtils.ts](/home/sebas/app/penpot/penpot/mcp/packages/plugin/src/PenpotUtils.ts)

### 4. Clean MCP startup wrapper

The MCP root package now starts through a cleanup script that kills existing listeners on the MCP ports before launching the server stack.

This reduces the chance of:

- stale `4402` websocket listeners
- plugin preview restarting while the server remains stale
- new code being built but not actually served to agents

Relevant files:

- [start-clean.sh](/home/sebas/app/penpot/penpot/mcp/scripts/start-clean.sh)
- [package.json](/home/sebas/app/penpot/penpot/mcp/package.json)

### 5. MCP-level readiness and inventory tools

Two new MCP tools were added so other agents do not have to discover basic preconditions through failed mutations:

- `plugin_connection_status`
- `inspect_canvas`

These tools make two checks explicit:

- whether a plugin instance is actually connected and ready
- what the current file/page/tree really contains before any agent claims that a board or slot is missing

Relevant files:

- [PluginConnectionStatusTool.ts](/home/sebas/app/penpot/penpot/mcp/packages/server/src/tools/PluginConnectionStatusTool.ts)
- [InspectCanvasTool.ts](/home/sebas/app/penpot/penpot/mcp/packages/server/src/tools/InspectCanvasTool.ts)

## Operational Rules For Future Agents

- Never conclude that a board is missing before recursively listing the page tree.
- Never conclude that the canvas is clean or unchanged without checking both:
  - `currentPage.root.children` for top-level objects
  - recursive descendants for nested boards, slots, and instances
- After plugin reload or MCP rebuild, assume previous MCP session state may be stale.
- Call `plugin_connection_status` before any mutation after reconnects, rebuilds, or reloads.
- Call `inspect_canvas` before assuming a board, slot, or instance is missing.
- If a mutation is intended for a specific container, require a positive target resolution.
- Treat any fallback to page root during targeted operations as a bug, not a convenience.
- Verify postconditions, not just tool success:
  - correct `parentId`
  - correct `targetShapeId`
  - expected shape placement in the page tree

## Recommended Next Step

Keep pushing the MCP toward stricter semantics for agent safety:

- prefer explicit failure over silent fallback
- add more postcondition checks in tool responses
- add page-tree inspection helpers when an operation depends on nested containers
