import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";
import { WidgetCreateTaskParams } from "@penpot/mcp-common";

const widgetPaddingSchema = z.object({
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
    left: z.number(),
});

const widgetLayoutSchema: z.ZodType<any> = z.object({
    kind: z.enum(["stack", "row", "column", "grid"]),
    width: z.union([z.number(), z.enum(["fill", "hug"])]).optional(),
    height: z.union([z.number(), z.enum(["fill", "hug"])]).optional(),
    gap: z.number().optional(),
    padding: z.union([z.number(), widgetPaddingSchema]).optional(),
    align: z.enum(["start", "end", "center", "stretch"]).optional(),
    crossAlign: z.enum(["start", "end", "center", "stretch"]).optional(),
    justifyContent: z.enum(["start", "center", "end", "space-between", "space-around", "space-evenly", "stretch"]).optional(),
    wrap: z.enum(["wrap", "nowrap"]).optional(),
    maxWidth: z.number().optional(),
    maxHeight: z.number().optional(),
    columns: z.number().optional(),
});

const widgetResponsiveOverrideSchema = z.object({
    layout: widgetLayoutSchema.partial().optional(),
    visible: z.boolean().optional(),
    slotOrder: z.array(z.string()).optional(),
});

const widgetChildLayoutSchema = z.object({
    absolute: z.boolean().optional(),
    horizontalSizing: z.enum(["fill", "auto", "fix"]).optional(),
    verticalSizing: z.enum(["fill", "auto", "fix"]).optional(),
    alignSelf: z.enum(["center", "auto", "start", "end", "stretch"]).optional(),
    horizontalMargin: z.number().optional(),
    verticalMargin: z.number().optional(),
    topMargin: z.number().optional(),
    rightMargin: z.number().optional(),
    bottomMargin: z.number().optional(),
    leftMargin: z.number().optional(),
    minWidth: z.number().nullable().optional(),
    maxWidth: z.number().nullable().optional(),
    minHeight: z.number().nullable().optional(),
    maxHeight: z.number().nullable().optional(),
});

const widgetNodeSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.string().optional(),
        type: z.string().min(1),
        name: z.string().optional(),
        props: z.record(z.string(), z.unknown()).optional(),
        tokens: z.record(z.string(), z.string()).optional(),
        layout: widgetLayoutSchema.optional(),
        childLayout: widgetChildLayoutSchema.optional(),
        responsive: z
            .object({
                compact: widgetResponsiveOverrideSchema.optional(),
                medium: widgetResponsiveOverrideSchema.optional(),
                expanded: widgetResponsiveOverrideSchema.optional(),
            })
            .optional(),
        style: z
            .object({
                fills: z.array(z.record(z.string(), z.unknown())).optional(),
                radius: z.number().optional(),
                shadows: z.array(z.record(z.string(), z.unknown())).optional(),
            })
            .optional(),
        slots: z.record(z.string(), z.string()).optional(),
        children: z.array(widgetNodeSchema).optional(),
    })
);

export class CreateWidgetTreeArgs {
    static schema = {
        root: widgetNodeSchema.describe("Root widget node. Use semantic widget/container types instead of loose shapes when possible."),
        pageId: z.string().optional().describe("Optional Penpot page id where the widget tree should be created."),
    };

    root!: WidgetCreateTaskParams["root"];

    pageId?: string;
}

export class CreateWidgetTreeTool extends Tool<CreateWidgetTreeArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateWidgetTreeArgs.schema);
    }

    public getToolName(): string {
        return "create_widget_tree";
    }

    public getToolDescription(): string {
        return (
            "Creates a semantic widget tree in Penpot using grouped containers, plugin metadata, and layout intent. " +
            "Use this after checking connected libraries; prefer library components first, then compose manual widget trees only for shells, glue, or missing primitives."
        );
    }

    protected async executeCore(args: CreateWidgetTreeArgs): Promise<ToolResponse> {
        const code =
            `const root = ${JSON.stringify(args.root)};\n` +
            `const pageId = ${args.pageId ? JSON.stringify(args.pageId) : "undefined"};\n` +
            `return penpotUtils.createWidgetTree(root, pageId);`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Widget tree created successfully.");
    }
}
