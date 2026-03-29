# MCP Flutter-First Widget Plan

## Goal

Evolve the Penpot MCP from a low-level shape executor into a Flutter-first widget composer that:

- creates grouped, semantic widget trees instead of loose shapes
- stores stable widget metadata for round-trip editing
- applies responsive rules during creation
- maps cleanly to Flutter layout concepts such as `Row`, `Column`, `Stack`, `Grid`, shells, and reusable components

This plan is aligned with the local Flutter skills in:

- `skills/flutter-ui-builder`
- `skills/flutter-building-layouts`
- `skills/flutter-adaptive-ui`
- `skills/flutter-ui-audit`
- `skills/shared-references/*`

## Core Principles Adopted From The Skills

1. Design system is the source of truth.
2. Layout must be defensive under changing constraints.
3. Responsive means structural reflow, not just smaller spacing.
4. Widgets must be semantically grouped and reusable.
5. Visual composition must stay separable from business logic.
6. Breakpoints should be based on width, not device type.

## Current MCP Gaps

### 1. Shape-first creation

Current flow is centered on `execute_code`, which allows arbitrary creation but does not enforce:

- semantic grouping
- stable widget identity
- reusable widget contracts
- responsive layout behavior

### 2. No high-level widget schema

There is no shared contract describing:

- widget type
- widget props
- layout intent
- breakpoints
- slots
- token bindings

### 3. Weak round-trip support

Even when MCP creates a useful composition, it is hard to reconstruct as a reliable widget tree later unless plugin metadata is attached everywhere.

### 4. Responsiveness is manual and inconsistent

There is no MCP-native way to express:

- compact / medium / expanded behavior
- row-to-column transitions
- navigation or panel collapse
- bounded screen composition

## Target Model

The MCP should work on top of a semantic intermediate representation.

## WidgetNode

```ts
type BreakpointKey = "compact" | "medium" | "expanded";

type WidgetNode = {
  id?: string;
  type: string;
  name?: string;
  props?: Record<string, unknown>;
  tokens?: Record<string, string>;
  layout?: {
    kind: "stack" | "row" | "column" | "grid";
    width?: number | "fill" | "hug";
    height?: number | "fill" | "hug";
    gap?: number;
    padding?: number | { top: number; right: number; bottom: number; left: number };
    align?: string;
    crossAlign?: string;
    maxWidth?: number;
    maxHeight?: number;
  };
  responsive?: Partial<Record<BreakpointKey, {
    layout?: Partial<WidgetNode["layout"]>;
    visible?: boolean;
    slotOrder?: string[];
  }>>;
  style?: {
    fills?: unknown[];
    radius?: number;
    shadows?: unknown[];
  };
  slots?: Record<string, string>;
  children?: WidgetNode[];
};
```

## How This Maps To Flutter

- `Board` root container -> screen/widget container
- `FlexLayout row` -> `Row`
- `FlexLayout column` -> `Column`
- `GridLayout` -> `GridView` or responsive grid
- bounded root container -> `SafeScreen` / constrained shell
- `responsive.compact/medium/expanded` -> width-based branching
- `pluginData` -> serialized constructor/props metadata

## Penpot Runtime Rules

Every widget created by MCP must follow these rules:

1. Every top-level widget has a root container.
2. Every child belongs to a semantic slot.
3. Every widget root stores metadata in `pluginData`.
4. Every reusable widget has a stable `widget.id` and `widget.type`.
5. Every complex widget declares responsive behavior.
6. No meaningful UI subtree is left as unowned loose shapes.

## Required Metadata

Attach this metadata on widget roots and important slots:

- `mcp.widget.id`
- `mcp.widget.type`
- `mcp.widget.version`
- `mcp.widget.parentId`
- `mcp.widget.slot`
- `mcp.widget.props`
- `mcp.widget.tokens`
- `mcp.widget.responsive`
- `mcp.codegen.flutter.class`

## MCP API Roadmap

## Phase 1. Shared Schema Foundation

Add new shared types in `penpot/penpot/mcp/packages/common/src/types.ts`:

- `WidgetNode`
- `WidgetCreateTaskParams`
- `WidgetReadTaskParams`
- `WidgetUpdateTaskParams`
- `WidgetTreeResult`

This is the minimum foundation for a semantic MCP layer.

## Phase 2. Plugin-Side Widget Runtime

Extend `penpot/penpot/mcp/packages/plugin/src/PenpotUtils.ts` with:

- `createWidgetTree(node)`
- `createWidgetRoot(node)`
- `appendWidgetChild(parent, child, slot)`
- `applyWidgetLayout(container, layout)`
- `applyResponsiveMetadata(shape, responsive)`
- `readWidgetTree(shapeId)`
- `updateWidgetTree(widgetId, patch)`

This layer should translate semantic widget intent into Penpot boards, groups, flex, grid, fills, tokens, and pluginData.

## Phase 3. High-Level MCP Tools

Add new MCP tools in the server:

- `create_widget_tree`
- `read_widget_tree`
- `update_widget_tree`
- `export_widget`
- `generate_flutter_code`

`execute_code` remains available as the escape hatch, but should stop being the primary path for app-like UI creation.

## Phase 4. Flutter-Oriented Widget Library

Start with a small reusable widget set:

- `dashboard_shell`
- `section_header`
- `metric_card`
- `chart_panel`
- `insights_panel`
- `adaptive_content_row`

Each widget blueprint should define:

- required props
- default tokens
- child slots
- default layout
- responsive behavior

## Phase 5. Round-Trip Codegen

Add a deterministic path:

1. Penpot widget tree
2. MCP widget schema
3. Flutter code generation

Output should favor:

- `LayoutBuilder`
- bounded shells
- width breakpoints
- reusable widgets over giant screen-local trees

## Responsive Strategy

Use the width model from the local skills:

- `compact`: width < 600
- `medium`: 600 <= width < 840
- `expanded`: width >= 840

Expected behavior:

- compact: stack panels vertically, reduce persistent side regions
- medium: preserve content structure with simplified side content
- expanded: allow side-by-side dashboard regions

This should be stored in schema, not inferred ad hoc during every generation.

## Widget Creation Rules

When MCP creates UI, it should:

1. measure target width or use declared target surface
2. choose widget blueprint
3. instantiate root container
4. create named slots
5. apply tokens and semantic styling
6. apply responsive metadata
7. return widget tree ids and structure

## Example Dashboard Tree

```json
{
  "type": "dashboard_shell",
  "props": {
    "title": "Revenue Dashboard",
    "subtitle": "Q1 performance snapshot"
  },
  "responsive": {
    "compact": { "layout": { "kind": "column" } },
    "medium": { "layout": { "kind": "column" } },
    "expanded": { "layout": { "kind": "row" } }
  },
  "children": [
    {
      "type": "metrics_row",
      "layout": { "kind": "row", "gap": 24 },
      "responsive": {
        "compact": { "layout": { "kind": "column" } }
      },
      "children": [
        { "type": "metric_card", "props": { "label": "MRR", "value": "$128K", "accent": "primary" } },
        { "type": "metric_card", "props": { "label": "Growth", "value": "+18.4%", "accent": "success" } },
        { "type": "metric_card", "props": { "label": "Churn", "value": "1.9%", "accent": "warning" } }
      ]
    },
    {
      "type": "adaptive_content_row",
      "children": [
        { "type": "chart_panel", "props": { "title": "Monthly revenue" } },
        { "type": "insights_panel", "props": { "title": "Highlights" } }
      ]
    }
  ]
}
```

## Validation Checklist For MCP Widget Creation

Borrowed from the local Flutter skills:

- no loose shapes outside a widget root
- all spacing, colors, radii, and text styles come from tokens or semantic props
- each row/column has a compact fallback
- wide layouts are clamped
- metadata is sufficient to rebuild the widget tree
- generated code uses bounded composition
- export works for both a widget root and its variants

## Implementation Order

1. Add common widget schema types.
2. Add plugin-side widget tree helpers.
3. Add `create_widget_tree`.
4. Refactor the dashboard demo to use widget trees.
5. Add `read_widget_tree`.
6. Add `generate_flutter_code`.
7. Add widget audits and smoke tests.

## Immediate Next Step

Implement the minimum viable semantic path:

- shared widget types
- plugin helper for grouped widget roots
- first tool: `create_widget_tree`
- first blueprint: `metric_card`
- first composite blueprint: `dashboard_shell`

This is the smallest change that moves the MCP from shape creation toward a Flutter-first widget system.
