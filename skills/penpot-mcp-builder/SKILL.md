---
name: penpot-mcp-builder
description: Use when working with the local Penpot MCP to inspect, plan, build, update, tokenize, componentize, or export Penpot UI safely. This skill is for Penpot-first workflows where `_Components`, local library instances, token-first styling, and safe MCP tool order matter.
---

# Penpot MCP Builder

Use this skill whenever a task touches the Penpot MCP workflow itself or uses Penpot as the source of truth for UI creation and Flutter export.

## Use This Skill For

- creating or updating screens through the Penpot MCP
- building reusable UI in `_Components` and placing instances on screens
- setting up or applying Penpot design tokens
- diagnosing bad Penpot MCP construction patterns
- exporting Penpot structures to Flutter/Dart
- guiding another agent on the correct MCP tool order

## Do Not Use This Skill For

- generic Flutter-only UI work with no Penpot involvement
- raw `execute_code` screen building
- bypassing `_Components` to draw full screens directly
- cloning components by content instead of using instances and overrides

## Core Stance

- Penpot-first, not Flutter-first.
- `_Components` is the source of reusable UI.
- Screen pages should contain instances, not raw duplicated structures.
- Tokens are the source of visual styling.
- `execute_code` is an escape hatch, not the main builder.

## Required Start Order

Start every fresh Penpot MCP session in this order:

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `inspect_canvas`

If the task is a new screen or widget, continue with:

5. `plan_ui_build`
6. ask the user for confirmation before structural creation
7. `confirm_structural_setup` and/or `ensure_frame_scaffolding`

If the task is an update to existing UI, continue with:

5. `find_local_components`
6. `inspect_design_tokens`
7. `inspect_design_token_usage` or `inspect_unsafe_construction_patterns` if needed

## Build Rules

### Pages

- Create only what is required.
- `_Components` is required for reusable UI work.
- `_Tokens` and `_Documentation` are optional and should only be created when the user asks or they are truly needed.
- New pages may include a numeric page suffix like `[#3]`. Treat that as display metadata, not part of the logical page name.

### Components

- Build reusable UI in `_Components` first.
- Prefer `create_component_shell` to create the initial structured frame on `_Components`; ele posiciona o shell no 0,0 para evitar captura e respeita o layout fornecido. Depois você move/publica.
- Use `organize_component_in_components_page` to restage or recategorize a shell without overlap.
- Use `validate_components_page_layout` to confirm `_Components` is still clean before publishing.
- Use `publish_components_from_components_page` when multiple `_Components` shells are ready for the local library.
- Promote a prepared frame to a main component with `create_main_component_from_shape`.
- Reuse existing local components with `find_local_components` before creating a new one.
- Use `create_component_variant` when the user asks for a real state/size/mode variation.
- Use `apply_component_variant_overrides` to switch an existing instance to another local variant.
- On screens, place only instances:
  - `place_component_on_screen`
  - `instantiate_local_component_into_slot`
  - `instantiate_library_component_into_slot`
- If only text changes, use `apply_instance_text_overrides`.
- Do not create separate main components just because the content differs.

### Text

- Text inside a component must live in an inner frame with layout.
- Prefer `create_text_block` when the task is mainly “add/edit text safely”.
- Do not leave text as a free absolute child of the component root.
- Use tokenized typography and color where possible.
- If text creation fails in a session, verify connection first and prefer the high-level tools over raw `execute_code`.

### Tokens

Use the token flow in this order:

1. `inspect_design_tokens`
2. `plan_design_token_system`
3. `suggest_design_token_names`
4. `normalize_design_token_payload`
5. `setup_design_token_system`
6. `apply_design_tokens_to_shape`

Do not treat `_Tokens` as the source of truth. The Penpot token catalog is the source of truth.

## Safe Construction Pattern

For a new screen:

1. Create or reuse the target page with `create_screen_page`.
2. Create the root screen shell with `create_screen_shell`.
3. Create or reuse reusable components in `_Components`.
4. Validate `_Components` layout if several shells were created in a row.
4. Publish them into the local library.
5. Instantiate them on the screen with `place_component_on_screen`.
6. Apply instance overrides.
7. Apply design tokens.
8. Run safety checks if the result looks suspicious.

For a new widget:

1. Create the widget shell in `_Components` with `create_component_shell`.
2. Organize it on the `_Components` canvas.
3. Validate `_Components` layout when multiple shells/categories are involved.
4. Publish it into the local library.
5. If the user wants a demo screen, instantiate it on a `Screens/...` page after that.

## Unsafe Patterns To Avoid

Never do these as the primary build strategy:

- build an entire screen with `execute_code`
- create raw boards and texts directly on a screen instead of using instances
- duplicate local components by content like `MemberCard/Ana`, `MemberCard/Bruno`
- create text layers directly under a component root with no inner layout frame
- hardcode fills, typography, spacing, and radius when tokens should exist

Use `inspect_unsafe_construction_patterns` when a page behaves strangely or becomes hard to edit.

## execute_code Policy

Allowed uses:

- inspect the current page or selection
- cleanup or repair a narrow problem
- test a small Penpot API hypothesis
- collect diagnostics for a failing tool

Not allowed as default workflow:

- building complete screens
- building component libraries
- creating token systems by hand
- replacing the higher-level MCP tools

## Export Workflow

Before exporting:

1. `inspect_unsafe_construction_patterns`
2. `inspect_design_token_usage`
3. `export_to_flutter`
4. `generate_flutter_dart`
5. `diagnose_export_shape` or `export_shape` when a visual artifact is needed

Prefer fixing the Penpot structure first. Do not export a broken screen and hope the Dart will clean it up later.

## Recovery Checklist

If an agent seems lost or the session context degraded:

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `inspect_canvas`
5. `find_local_components`
6. `inspect_design_tokens`

If the file feels corrupted or unsafe:

1. `inspect_unsafe_construction_patterns`
2. `inspect_design_token_usage`
3. `lint_screen_composition`
4. `diagnose_export_shape`

## Reference

- `references/tool-flows.md`
