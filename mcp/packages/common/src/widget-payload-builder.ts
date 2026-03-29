import type { WidgetCreateTaskParams, WidgetNode } from "./types";
import { createDashboardSmokeBlueprint, type DashboardSmokeBlueprintProps } from "./widget-blueprints";

export interface McpToolCallPayload<TArguments> {
    jsonrpc: "2.0";
    id: string;
    method: "tools/call";
    params: {
        name: string;
        arguments: TArguments;
    };
}

export function createWidgetTreeToolPayload(
    root: WidgetNode,
    id = "create-widget-tree",
    pageId?: string,
): McpToolCallPayload<WidgetCreateTaskParams> {
    return {
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: {
            name: "create_widget_tree",
            arguments: {
                root,
                pageId,
            },
        },
    };
}

export function createExportShapeToolPayload(
    shapeId: string,
    id = "export-shape",
    format: "png" | "jpg" | "jpeg" | "svg" = "png",
    scale = 1,
): McpToolCallPayload<{ shapeId: string; format: string; scale: number }> {
    return {
        jsonrpc: "2.0",
        id,
        method: "tools/call",
        params: {
            name: "export_shape",
            arguments: {
                shapeId,
                format,
                scale,
            },
        },
    };
}

export function createDashboardSmokePayload(
    props: DashboardSmokeBlueprintProps = {},
    id = "dashboard-smoke",
): McpToolCallPayload<WidgetCreateTaskParams> {
    return createWidgetTreeToolPayload(createDashboardSmokeBlueprint(props), id);
}

export function serializePayload(payload: unknown): string {
    return JSON.stringify(payload, null, 2);
}
