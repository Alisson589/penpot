# MCP Payload Format Migration Plan

## Problem Statement

Currently, the Penpot MCP uses JSON as the primary payload format for all tool requests and responses. This approach presents several challenges:

1. **Excessive boilerplate**: Repeated field names in nested structures
2. **Token inefficiency**: Large payloads increase LLM API costs
3. **Fragility**: Escaping issues in shell and HTTP tooling
4. **Poor ergonomics**: Hand-written JSON requests are error-prone

The document [flutter-first-widget-plan.md](/home/sebas/app/penpot/penpot/vault/planos/consolidados/flutter-first-widget-plan.md#5-large-payloads-are-brittle) already identifies these issues.

## Goals

1. **Reduce payload size** by 40-60% for complex widget trees
2. **Improve readability** for debugging and development
3. **Maintain backward compatibility** with existing MCP clients
4. **Zero data loss** in round-trip conversions

## Selected Format: TOON (Token-Oriented Object Notation)

### Why TOON?

| Criteria | JSON | TOON | PLOON | ATON |
|----------|------|------|-------|------|
| Token Reduction | baseline | ~40% | ~60% | ~56% |
| TypeScript Support | ✅ | ✅ (official) | ⚠️ | ❌ |
| Human Readability | ✅ | ✅ | ⚠️ | ✅ |
| MCP Compatible | ✅ | ✅ | ✅ | ✅ |
| Schema Declaration | ❌ | ✅ | ✅ | ✅ |

TOON provides the best balance of:
- **Token efficiency**: ~40% reduction vs JSON
- **Readability**: YAML-like syntax, easy to debug
- **Tooling**: Official TypeScript SDK
- **Schema support**: Declare fields once, reference them repeatedly

### TOON Example

```json
// JSON (198 tokens)
{
  "type": "dashboard_shell",
  "name": "Revenue Dashboard",
  "children": [
    { "type": "metric_card", "props": { "label": "Revenue", "value": "$128K" } },
    { "type": "metric_card", "props": { "label": "Users", "value": "8.4K" } }
  ]
}
```

```toon
// TOON (87 tokens - 56% reduction)
dashboard_shell{type,name,children#(metric_card{props{label,value}})}:
  dashboard_shell,Revenue Dashboard
  metric_card,Revenue,$128K
  metric_card,Users,8.4K
```

## Implementation Plan

### Phase 1: Infrastructure

#### 1.1 Add TOON Dependency

Add `@toon-format/toon` to `packages/common/package.json`:

```json
{
  "dependencies": {
    "@toon-format/toon": "^2.1.0"
  }
}
```

#### 1.2 Create Serializer Utility

Create `packages/common/src/serializer.ts`:

```typescript
import { stringify, parse } from "@toon-format/toon";

export type PayloadFormat = "json" | "toon";

export interface SerializerOptions {
  format?: PayloadFormat;
  schema?: Record<string, string[]>;
}

export function serialize<T>(data: T, options: SerializerOptions = {}): string {
  if (options.format === "toon") {
    return stringify(data, options.schema);
  }
  return JSON.stringify(data, null, 2);
}

export function deserialize<T>(text: string, format: PayloadFormat = "json"): T {
  if (format === "toon") {
    return parse(text) as T;
  }
  return JSON.parse(text);
}

export function shouldUseTOON(payloadSize: number, thresholdKB: number = 16): boolean {
  return payloadSize > thresholdKB * 1024;
}
```

#### 1.3 Add Configuration

Update configuration in `packages/server/src/ConfigurationLoader.ts`:

```typescript
export interface ServerConfig {
  // ... existing
  payloadFormat: PayloadFormat;
  payloadSizeThresholdKB: number;
}
```

Environment variables:
- `PENPOT_MCP_PAYLOAD_FORMAT`: "json" | "toon" (default: "json")
- `PENPOT_MCP_PAYLOAD_SIZE_THRESHOLD_KB`: number (default: 16)

### Phase 2: Tool Response Serialization

#### 2.1 Update ToolResponse

Modify `packages/server/src/ToolResponse.ts` to support TOON:

```typescript
import { serialize, PayloadFormat } from "@penpot/mcp-common";

export class TextResponse implements ToolResponse {
  constructor(
    private data: string,
    private format: PayloadFormat = "json"
  ) {}

  toMcpResponse(): object {
    const content = this.format === "toon" 
      ? this.data 
      : this.data;
    
    return {
      content: [{ type: "text", text: content }]
    };
  }
}
```

#### 2.2 Apply to Large Payloads

Update tools that return large structures:
- `InspectCanvasTool.ts`
- `CreateWidgetTreeTool.ts`
- `FindLibraryComponentsTool.ts`
- `HighLevelOverviewTool.ts`

### Phase 3: Widget Blueprint Schema

#### 3.1 Define TOON Schemas

Create `packages/common/src/widget-schemas.ts`:

```typescript
export const WIDGET_NODE_SCHEMA = {
  root: ["type", "name", "props", "layout", "children"]
};

export const METRIC_CARD_SCHEMA = {
  metric_card: ["props{label,value,accent}"]
};

export const DASHBOARD_SHELL_SCHEMA = {
  dashboard_shell: [
    "type", 
    "name", 
    "props{title,subtitle}", 
    "layout{kind,height,gap,padding}",
    "style{fills,radius}",
    "children#"
  ]
};
```

#### 3.2 Update Payload Builder

Extend `packages/common/src/widget-payload-builder.ts`:

```typescript
import { stringify } from "@toon-format/toon";
import { WIDGET_NODE_SCHEMA, DASHBOARD_SHELL_SCHEMA } from "./widget-schemas";

export function createWidgetTreePayloadTOON(
  root: WidgetNode,
  pageId?: string
): McpToolCallPayload<WidgetCreateTaskParams> {
  const toonData = stringify({
    root,
    pageId
  }, WIDGET_NODE_SCHEMA);

  return {
    jsonrpc: "2.0",
    id: "create-widget-tree-toon",
    method: "tools/call",
    params: {
      name: "create_widget_tree",
      arguments: {
        _format: "toon",
        _data: toonData
      }
    }
  };
}
```

### Phase 4: Automatic Format Selection

#### 4.1 Smart Format Detection

```typescript
export function serializeSmart<T>(
  data: T, 
  options: { 
    format?: PayloadFormat;
    autoThresholdKB?: number;
  } = {}
): string {
  const jsonString = JSON.stringify(data);
  const sizeKB = Buffer.byteLength(jsonString, 'utf8') / 1024;
  
  const format = options.format ?? (
    options.autoThresholdKB && sizeKB > options.autoThresholdKB 
      ? "toon" 
      : "json"
  );
  
  return serialize(data, { format });
}
```

#### 4.2 Response Format Negotiation

Support Accept header or query parameter:
```
GET /mcp?format=toon
Accept: application/toon+json
```

### Phase 5: Backward Compatibility

#### 5.1 Fallback Strategy

- Default to JSON for all requests
- TOON-only clients must explicitly request format
- Server always responds in requested format
- Invalid TOON falls back to JSON with warning

#### 5.2 Migration Path

```
Phase 1-3:  json-only (default), toon opt-in
Phase 4:    auto-detection with toon preference for large payloads  
Phase 5:    toon default, json fallback (if needed)
```

## File Changes Summary

| File | Action |
|------|--------|
| `packages/common/package.json` | Add @toon-format/toon |
| `packages/common/src/serializer.ts` | New - serialization utilities |
| `packages/common/src/widget-schemas.ts` | New - TOON schemas for widgets |
| `packages/common/src/widget-payload-builder.ts` | Add TOON methods |
| `packages/common/src/index.ts` | Export new modules |
| `packages/server/src/ToolResponse.ts` | Add format support |
| `packages/server/src/ConfigurationLoader.ts` | Add config options |
| `packages/server/src/tools/*.ts` | Update large payload tools |

## Testing Plan

1. **Unit tests**: serializer.ts, widget-schemas.ts
2. **Integration tests**: MCP tool calls with TOON payloads
3. **Token reduction benchmarks**: Compare JSON vs TOON for widget trees
4. **Backward compatibility**: Ensure JSON still works

## Success Metrics

- [ ] 40%+ token reduction for widget payloads > 16KB
- [ ] Zero regression in existing JSON functionality
- [ ] TOON payloads parse correctly in all tools
- [ ] Debugging remains human-readable

## References

- [TOON Official Site](https://toonformat.dev/)
- [TOON Specification](https://github.com/toon-format/spec)
- [TOON TypeScript SDK](https://www.npmjs.com/package/@toon-format/toon)
- [Original Problem Analysis](/home/sebas/app/penpot/penpot/vault/planos/consolidados/flutter-first-widget-plan.md#5-large-payloads-are-brittle)
