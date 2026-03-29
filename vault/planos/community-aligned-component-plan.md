# Community-Aligned Penpot Component Plan

## Date

- 2026-03-29

## Inputs Used

### Local guide

- [penpot-component-guide.md](/home/sebas/app/penpot/penpot/vault/planos/penpot-component-guide.md)

### Penpot references

- Penpot blog: component variants
  - https://penpot.app/blog/how-to-use-component-variants-to-scale-your-design-system/
- Penpot help/docs and API references already present in the MCP repo:
  - [initial_instructions.md](/home/sebas/app/penpot/penpot/mcp/packages/server/data/initial_instructions.md)
  - [api_types.yml](/home/sebas/app/penpot/penpot/mcp/packages/server/data/api_types.yml)

## Core Direction

The MCP must align with how Penpot expects components to be created and used:

- components should come from named frames/boards/groups
- libraries and existing components should be preferred over manual recreation
- variants should be represented as real Penpot variants when they matter
- nested structures should use slots and semantically named internal layers
- layout should be handled with Penpot flex/grid, not synthetic editor internals

The Flutter export layer should then read semantic metadata and reconstruct a Flutter-friendly tree instead of trying to make the Penpot document itself behave like Flutter.

## What The Current MCP Already Does Well

- `plugin_connection_status` and `inspect_canvas` reduce agent mistakes before mutation
- `find_library_components` and `instantiate_library_component_into_slot` support library-first composition
- `create_widget_tree` can create grouped structures instead of only loose shapes
- widget identity and runtime sequence ids are already being stored and exposed
- the current slot docking flow already validates `parentId == targetShapeId`

Relevant files:

- [PenpotUtils.ts](/home/sebas/app/penpot/penpot/mcp/packages/plugin/src/PenpotUtils.ts)
- [CreateWidgetTreeTool.ts](/home/sebas/app/penpot/penpot/mcp/packages/server/src/tools/CreateWidgetTreeTool.ts)
- [InstantiateLibraryComponentIntoSlotTool.ts](/home/sebas/app/penpot/penpot/mcp/packages/server/src/tools/InstantiateLibraryComponentIntoSlotTool.ts)

## Main Gaps Against The Guide

### 1. Main components are not first-class MCP concepts yet

The guide expects:

- creation from named frame/group
- promotion to real component
- storage in dedicated library pages

Current MCP gap:

- the MCP can instantiate library components, but it does not yet expose a safe high-level workflow for:
  - creating a main component from a prepared board/group
  - moving/organizing it in a `_Components` or `_Library` page
  - documenting usage through annotations

### 2. Variants are not yet modeled as a first-class creation flow

The guide strongly recommends:

- meaningful variant properties
- property naming like `Type`, `Size`, `State`
- using variants instead of many near-duplicate components

Current MCP gap:

- the Penpot API for variants is documented in the repo, but the MCP does not yet expose safe tools for:
  - creating a variant group
  - renaming variant properties
  - setting `variantProps`
  - instantiating a specific variant intentionally

### 3. Nested components and slots need stronger semantics

The guide expects:

- internal layers named by semantic slot
- nested components with predictable override points
- no deep anonymous layer stacks

Current MCP gap:

- slot metadata is now being added, but export and reconstruction logic still need to treat:
  - `slot`
  - `role`
  - `sourceLibrary`
  - `sourceComponent*`
  as the canonical semantic layer for code generation

### 4. Component pages and documentation pages are not automated

The guide expects page organization such as:

- `_Tokens`
- `_Components`
- `_Documentation`
- `Screens/*`

Current MCP gap:

- `inspect_canvas` lists pages, but the MCP does not yet expose a structured workflow for:
  - ensuring required pages exist
  - routing new main components to `_Components`
  - routing usage examples to `Screens/*`
  - creating annotations/documentation for component usage

### 5. Payload ergonomics still rely too much on raw nested JSON

The guide is component-oriented, while the MCP protocol still pushes large tree payloads in some flows.

Current MCP gap:

- external agents still need help composing trees safely
- the MCP needs smaller, intent-first tools so agents are not forced to author large JSON by hand

### 6. Flutter export is modeled, but not yet implemented as a full pipeline

We now have intermediate types:

- [types.ts](/home/sebas/app/penpot/penpot/mcp/packages/common/src/types.ts)

Current MCP gap:

- the MCP does not yet read canvas/widget metadata and emit a `FlutterExportTree`
- there is no `export_to_flutter` tool yet

## Community/Penpot Rules To Preserve

Based on the guide and Penpot references, these rules should be enforced in the MCP:

1. Prefer library instances before drawing manual substitutes.
2. Use named boards/groups for component roots.
3. Use flex/grid for internal layout when the component contains multiple elements.
4. Use semantic names for internal layers and slots.
5. Prefer variants for meaningful state/size/type differences.
6. Keep component pages separate from screen pages.
7. Use tokens/styles over hardcoded design values whenever possible.
8. Use padding and gap before child margins.
9. Keep nesting shallow and explicit enough for overrides and export.

## Recommended MCP Adjustments

### Phase 1. Penpot-first component creation

Add safe tools or helpers for:

- `ensure_component_pages`
- `create_main_component_from_shape`
- `create_component_annotation`

Goal:

- align the MCP with the guide's requirement that reusable components live as actual Penpot assets, not just canvas boards

### Phase 2. Variant-aware MCP

Add safe variant workflows on top of documented Penpot APIs:

- `create_variant_group`
- `rename_variant_property`
- `set_variant_props`
- `instantiate_variant`

Goal:

- allow the MCP to build real Penpot variant systems for states, sizes, and types

### Phase 3. Slot and nested-component discipline

Strengthen the current slot model:

- make `slot` and `role` required for library-shell children where relevant
- preserve slot names in plugin data and visible layers
- formalize component roots, content blocks, actions, and nested library instances

Goal:

- make nested components predictable both in Penpot and during export

### Phase 4. File/page structure management

Add helpers for page organization:

- ensure `_Tokens`, `_Components`, `_Documentation`, `Screens/*`
- move reusable assets to `_Components`
- keep screen-specific compositions on `Screens/*`

Goal:

- align automated MCP output with how designers expect Penpot files to be organized

### Phase 5. Payload compaction and intent-first tools

Replace large raw tree calls with smaller high-level MCP tools such as:

- `create_component_shell`
- `create_layout_component`
- `add_component_slot`
- `add_library_component_to_slot`

Goal:

- external agents should be able to work with Penpot semantically without hand-authoring huge JSON payloads

### Phase 6. Flutter export pipeline

Build `export_to_flutter` on top of metadata and IR, not raw canvas structure:

1. inspect the tree
2. resolve widget roots and slots
3. resolve library-origin metadata
4. map Penpot component concepts into `FlutterExportTree`
5. emit Dart/widget code from that tree

Goal:

- keep Penpot creation native while generating a Flutter-oriented structure only at export time

## Immediate Next Implementations

1. Add `slot` and `role` reading into the future export pipeline.
2. Add a safe page-organization helper for `_Components` and `Screens/*`.
3. Add a main-component creation flow from a prepared board/group.
4. Add the first variant-safe MCP tool set.
5. Implement the read path from current widget metadata to `FlutterExportTree`.
6. Then implement `export_to_flutter`.

## Validation Gate

Every step should continue to pass this gate:

1. item is created
2. item is selectable
3. item is draggable
4. sidebar stays healthy
5. parent/slot relationships are correct
6. export still works
7. metadata is sufficient to reconstruct the component for Flutter

## Summary

The correct direction is not to make Penpot behave like Flutter.

The correct direction is:

- Penpot-first component creation
- library-first composition
- variant-aware asset creation
- semantic slot metadata
- page/library organization
- Flutter export from metadata and IR

That keeps the editor healthy while making the MCP progressively better for structured app generation.
