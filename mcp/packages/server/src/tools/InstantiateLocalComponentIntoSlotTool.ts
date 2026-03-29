import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

const childLayoutSchema = z.object({
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

export class InstantiateLocalComponentIntoSlotArgs {
    static schema = {
        componentId: z.string().optional().describe("Preferred local component id to instantiate."),
        componentName: z.string().optional().describe("Optional local component name query."),
        componentPath: z.string().optional().describe("Optional local component path query."),
        matchMode: z.enum(["exact", "prefix", "contains"]).optional().describe("Local component name/path matching mode."),
        requireExactMatch: z.boolean().optional().describe("When true, fail instead of using an inexact local component match."),
        targetShapeId: z.string().describe("Id of the slot/container that should receive the component instance."),
        pageId: z.string().optional().describe("Optional target page id where the slot lives."),
        childLayout: childLayoutSchema.optional().describe("Optional layout child rules to apply after docking."),
        fit: z.enum(["none", "contain", "fill-width", "fill-height", "stretch"]).optional().describe("Optional fit policy after docking."),
        inset: z.number().optional().describe("Optional inset used by the fit policy."),
    };

    componentId?: string;
    componentName?: string;
    componentPath?: string;
    matchMode?: "exact" | "prefix" | "contains";
    requireExactMatch?: boolean;
    targetShapeId!: string;
    pageId?: string;
    childLayout?: z.infer<typeof childLayoutSchema>;
    fit?: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
    inset?: number;
}

export class InstantiateLocalComponentIntoSlotTool extends Tool<InstantiateLocalComponentIntoSlotArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InstantiateLocalComponentIntoSlotArgs.schema);
    }

    public getToolName(): string {
        return "instantiate_local_component_into_slot";
    }

    public getToolDescription(): string {
        return (
            "Instantiates a local Penpot component from the current file and docks it into a target slot/container. " +
            "Use this after create_main_component_from_shape when building componentized screens from local reusable pieces."
        );
    }

    protected async executeCore(args: InstantiateLocalComponentIntoSlotArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.instantiateLocalComponentIntoSlot(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Local component instantiated into slot successfully.");
    }
}
