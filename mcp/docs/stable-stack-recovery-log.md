# Stable Stack Recovery Log

## Date

- 2026-03-29

## Purpose

This log captures the recovery path back to the last healthy local Penpot + MCP stack after experimental MCP changes caused regressions.

The main goal is to prevent future agents from confusing:

- a healthy proxy with an unhealthy application stack
- MCP transport issues with Penpot runtime issues
- frontend `200 OK` responses with a genuinely ready workspace

## Known Good Base

- commit: `f22b72fa6`
- message: `Add widget spacing defaults and rollback safeguards`

This is the last confirmed base where:

- the MCP stack was reachable
- the Penpot workspace could be opened
- user-created shapes could be selected and dragged
- a simple `execute_code` smoke did not reintroduce `internal error`

## What Broke After The Stable Base

Later experiments added higher-level MCP behavior on top of the stable base, including:

- Flutter-first widget tree helpers
- payload blueprints
- larger semantic dashboard builders
- numeric ids in layer naming
- more aggressive layout/runtime abstractions

Those changes increased the risk of the MCP writing document state that the Penpot `develop` UI did not tolerate well.

The visible regressions included:

- `internal error` when selecting or dragging MCP-created items
- `shadow-cljs reconnecting`
- workspace opening into a `Bad Gateway` page
- confusion between stack boot failures and MCP bugs

## Root Cause Of The `Bad Gateway` Phase

The `Bad Gateway` page was not a Windows `localhost` routing issue.

The actual problem was partial startup:

- the container and proxy were up
- but backend, exporter, and frontend watch processes were not all running

That meant:

- `https://localhost:3449` could still return a response
- but the actual application behind the proxy was not ready

## What Must Be Running For A Healthy Local Stack

The local stack is only healthy when all of these are up:

1. Docker compose base services
2. frontend watch process
3. backend dev server
4. exporter watch/build
5. exporter runtime server
6. MCP bootstrap

If only compose is up, the proxy can still show a gateway page while the actual app remains unavailable.

## Recovery Procedure That Worked

### 1. Restore the known good code base

- reset the repo to `f22b72fa6`
- keep the worktree clean before retesting

### 2. Bring up the compose environment

- start `docker/devenv/docker-compose.linux-mcp.yaml`

### 3. Start the missing Penpot processes manually inside `penpot-devenv-main`

- frontend:
  - `cd /home/penpot/penpot/penpot/frontend && ./scripts/watch app`
- backend:
  - `cd /home/penpot/penpot/penpot/backend && ./scripts/start-dev`
- exporter watch:
  - `cd /home/penpot/penpot/penpot/exporter && ./scripts/watch`
- exporter runtime:
  - `cd /home/penpot/penpot/penpot/exporter && bash ./scripts/wait-and-start.sh`
- MCP:
  - `cd /home/penpot/penpot/penpot/mcp && bash ./scripts/start-clean.sh`

## Health Checks

Before calling the stack healthy, validate all of the following:

- frontend:
  - `https://localhost:3449`
  - `http://localhost:3450`
- exporter route:
  - `https://localhost:3449/export`
- MCP:
  - `http://localhost:4400/manifest.json`
  - `http://localhost:4401/mcp`
- backend is listening on `6060`
- exporter is listening on `6061`
- frontend watch is no longer stuck in `shadow-cljs reconnecting`

## How To Diagnose `Bad Gateway`

When the user reports `Bad Gateway`, do not assume networking first.

Check in this order:

1. Is the backend process actually running on `6060`?
2. Is the exporter process actually running on `6061`?
3. Is frontend watch/build actually ready?
4. Did MCP restart cleanly after the current container boot?
5. Is the browser showing a cached gateway page from an earlier partial boot?

## How To Diagnose `shadow-cljs reconnecting`

Treat `shadow-cljs reconnecting` as a stack-readiness symptom unless proven otherwise.

Typical causes:

- frontend watch process was never started
- frontend watch started but is still compiling
- exporter/frontend watch was restarted while the proxy remained up
- the browser is still pointed at a partially booted app

## Safe Operational Rules For Future Agents

- Do not conclude the stack is healthy from `200 OK` on the root URL alone.
- Do not treat `Bad Gateway` as a Windows `localhost` issue by default.
- Do not evolve MCP behavior while the underlying Penpot dev services are partially booted.
- Do not debug document-level MCP mutations until backend, exporter, and frontend watch are all confirmed healthy.
- After container restart, always assume MCP also needs its bootstrap restarted.

## Scope Boundary For The MCP

The MCP must sit on top of Penpot behavior, not redefine it.

That means:

- orchestrate supported plugin/API actions
- prefer library-first composition
- prefer document inspection before mutation
- keep metadata and codegen support inside `pluginData`

It does not mean:

- recreating Penpot internal layout semantics
- persisting synthetic layout state that the editor UI itself does not generate

## Safe Identity And Naming Rule

If widgets need both numeric and descriptive identity, that should be implemented by the MCP at runtime, not by changing Penpot core.

Safe rule:

- primary machine identity lives in `pluginData`
- semantic id should be stable and descriptive
- numeric sequence id can be assigned by the MCP when the shape is created
- layer naming may expose both, but only as a convenience and only after validating that selection, drag, and sidebar editing still behave normally

This keeps the feature reversible and avoids coupling the project itself to MCP-specific naming conventions.

## Next Direction

All new MCP improvements should be introduced on top of `f22b72fa6` and must pass this gate:

1. stack boots cleanly
2. file opens normally
3. shape can be selected
4. shape can be dragged
5. sidebar opens without `internal error`

If any new helper breaks that flow, it must be rolled back or redesigned.
