# MCP Decomposition Log and CLI Roadmap

## Purpose

This log consolidates the work done to harden the Penpot MCP into a safer, component-first workflow and records the next roadmap for a CLI layered on top of the MCP.

## Current Direction

- Penpot-first, not raw API-first.
- `_Components` is the source of reusable UI.
- `Screens/*` should contain instances, not duplicated raw structures.
- Penpot token catalog is the source of truth for styling.
- `execute_code` is an escape hatch for inspection, cleanup, and focused experiments.
- The first tool in a fresh session should be `first_tool_recommended_flow`.

## What Was Added

### Session and Flow Guidance

- `first_tool_recommended_flow`
- `recommended_tool_flow`
- stricter tool ordering in MCP startup
- updated `README`, `initial_instructions`, and `penpot-mcp-builder` skill

### Project and Structure Preflight

- `plugin_connection_status`
- `inspect_project_setup`
- `plan_ui_build`
- `confirm_structural_setup`
- `ensure_frame_scaffolding`
- safer page creation rules
- visible numeric ids on new pages, e.g. `Screens/Home [#3]`

### Token-First Workflow

- `inspect_design_tokens`
- `plan_design_token_system`
- `suggest_design_token_names`
- `normalize_design_token_payload`
- `setup_design_token_system`
- `apply_design_tokens_to_shape`
- `inspect_design_token_usage`

### Component-First Workflow

- `find_local_components`
- `create_component_shell`
- `organize_component_in_components_page`
- `validate_components_page_layout`
- `publish_components_from_components_page`
- `create_main_component_from_shape`
- `create_component_variant`
- `apply_component_variant_overrides`

### Screen Workflow

- `create_screen_page`
- `list_screen_pages`
- `create_screen_shell`
- `place_component_on_screen`
- `create_text_block`
- `apply_instance_text_overrides`
- `lint_screen_composition`

### Safety and Diagnostics

- `inspect_unsafe_construction_patterns`
- `diagnose_export_shape`
- stricter guidance around `execute_code`

### Export and Codegen

- `export_to_flutter`
- `generate_flutter_dart`
- token-aware Flutter export
- Lucide icon recognition in Dart output

## Problems Addressed

- screens built directly with `execute_code`
- components created on screen pages instead of `_Components`
- duplicated components by content instead of instance overrides
- unsafe text layers placed directly under component roots
- pages created too eagerly even when not requested
- agents losing the correct order of tool usage
- hardcoded styling instead of token bindings

## Remaining Gaps

- Penpot/exporter can still timeout on large complex exports
- theme/set activation is still less predictable than desired in the Penpot token API
- some Flutter codegen heuristics still need refinement for semantic widgets
- `execute_code` cannot be fully disabled because it is still useful for diagnostics and narrow gaps

## Recommended MCP Build Flow

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `inspect_canvas`
5. `plan_ui_build`
6. confirm structural changes with the user
7. `confirm_structural_setup`
8. `create_screen_page`
9. `create_screen_shell`
10. `create_component_shell`
11. `organize_component_in_components_page`
12. `validate_components_page_layout`
13. `publish_components_from_components_page`
14. `place_component_on_screen`
15. `apply_instance_text_overrides`
16. `apply_design_tokens_to_shape`
17. `lint_screen_composition`
18. `export_to_flutter`
19. `generate_flutter_dart`

## CLI Over MCP Roadmap

### Goal

Create a thin CLI that orchestrates the existing MCP tools in the correct order so external agents do not need to remember the protocol manually.

### Principles

- CLI should not replace the MCP.
- CLI should call MCP HTTP.
- CLI should encode the safe order of operations.
- CLI should make common workflows deterministic and short.

### MVP Commands

- `penpot-cli preflight`
  - runs `first_tool_recommended_flow`, `plugin_connection_status`, `inspect_project_setup`
- `penpot-cli create-screen`
  - wraps `plan_ui_build`, `confirm_structural_setup`, `create_screen_page`, `create_screen_shell`
- `penpot-cli create-component`
  - wraps `create_component_shell`, `organize_component_in_components_page`, `validate_components_page_layout`
- `penpot-cli publish-components`
  - wraps `publish_components_from_components_page`
- `penpot-cli place-component`
  - wraps `place_component_on_screen`
- `penpot-cli tokens plan`
  - wraps `plan_design_token_system`, `suggest_design_token_names`
- `penpot-cli tokens setup`
  - wraps `normalize_design_token_payload`, `setup_design_token_system`
- `penpot-cli lint`
  - wraps `validate_components_page_layout`, `lint_screen_composition`, `inspect_unsafe_construction_patterns`
- `penpot-cli export flutter`
  - wraps `export_to_flutter`, `generate_flutter_dart`

### Phase 1

- Node/TypeScript CLI
- MCP HTTP client
- explicit JSON output mode
- human-readable summary mode
- config file for server URL and optional `userToken`

### Phase 2

- command composition from spec files
- dry-run / plan mode
- retry and reconnect handling
- artifact saving and export folder management

### Phase 3

- interactive prompts
- batch workflows
- scripted project bootstrap
- reusable presets for screen, component, token, and export flows

## Success Criteria for the CLI

- agents stop calling raw low-level tools in the wrong order
- fewer broken screens caused by direct `execute_code`
- faster preflight and recovery after context loss
- clearer logs for build, component publication, and export
- less prompt engineering needed to use the MCP safely
