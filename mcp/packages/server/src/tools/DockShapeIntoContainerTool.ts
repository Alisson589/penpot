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

export class DockShapeIntoContainerArgs {
    static schema = {
        shapeId: z.string().describe("Id of the existing shape to move into a target container."),
        targetShapeId: z.string().describe("Id of the target container shape."),
        childLayout: childLayoutSchema.optional().describe("Optional layout child rules to apply after docking."),
        fit: z.enum(["none", "contain", "fill-width", "fill-height", "stretch"]).optional().describe("Optional fit policy after docking."),
        inset: z.number().optional().describe("Optional inset used by fit policies."),
    };

    shapeId!: string;
    targetShapeId!: string;
    childLayout?: z.infer<typeof childLayoutSchema>;
    fit?: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
    inset?: number;
}

export class DockShapeIntoContainerTool extends Tool<DockShapeIntoContainerArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, DockShapeIntoContainerArgs.schema);
    }

    public getToolName(): string {
        return "dock_shape_into_container";
    }

    public getToolDescription(): string {
        return (
            "Moves an existing shape into a container, applies layout child rules, and optionally fits it to the target bounds. " +
            "Before using this, call plugin_connection_status to verify readiness and inspect_canvas to confirm the target container exists."
        );
    }

    protected async executeCore(args: DockShapeIntoContainerArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.dockShapeIntoContainer(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Shape docked successfully.");
    }
}
