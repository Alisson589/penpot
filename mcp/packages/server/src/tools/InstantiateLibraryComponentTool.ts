import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class InstantiateLibraryComponentArgs {
    static schema = {
        libraryName: z.string().optional().describe("Optional substring of the library name."),
        componentNameContains: z.string().optional().describe("Optional substring that should appear in the component name."),
        componentPathContains: z.string().optional().describe("Optional substring that should appear in the component path."),
        targetShapeId: z
            .string()
            .optional()
            .describe("Optional target container shape id. When provided, the instance is appended inside that shape instead of the page root."),
        x: z.number().optional().describe("Optional x position for the new instance."),
        y: z.number().optional().describe("Optional y position for the new instance."),
        pageId: z.string().optional().describe("Optional Penpot page id where the component instance should be created."),
        detach: z.boolean().optional().describe("Detach the instance immediately after creation if independent editing is required."),
        childLayout: z
            .object({
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
            })
            .optional()
            .describe("Optional layout child rules to apply when the target container uses a Penpot layout."),
    };

    libraryName?: string;
    componentNameContains?: string;
    componentPathContains?: string;
    targetShapeId?: string;
    x?: number;
    y?: number;
    pageId?: string;
    detach?: boolean;
    childLayout?: {
        absolute?: boolean;
        horizontalSizing?: "fill" | "auto" | "fix";
        verticalSizing?: "fill" | "auto" | "fix";
        alignSelf?: "center" | "auto" | "start" | "end" | "stretch";
        horizontalMargin?: number;
        verticalMargin?: number;
        topMargin?: number;
        rightMargin?: number;
        bottomMargin?: number;
        leftMargin?: number;
        minWidth?: number | null;
        maxWidth?: number | null;
        minHeight?: number | null;
        maxHeight?: number | null;
    };
}

export class InstantiateLibraryComponentTool extends Tool<InstantiateLibraryComponentArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InstantiateLibraryComponentArgs.schema);
    }

    public getToolName(): string {
        return "instantiate_library_component";
    }

    public getToolDescription(): string {
        return (
            "Instantiates a matching Penpot library component onto the current page. " +
            "Prefer this over manual widget construction whenever a suitable connected library component already exists. " +
            "If targetShapeId is provided, the tool will fail explicitly when that container is not found or cannot accept children."
        );
    }

    protected async executeCore(args: InstantiateLibraryComponentArgs): Promise<ToolResponse> {
        const code =
            `return penpotUtils.instantiateLibraryComponent(${JSON.stringify({
                libraryName: args.libraryName,
                componentNameContains: args.componentNameContains,
                componentPathContains: args.componentPathContains,
                targetShapeId: args.targetShapeId,
                x: args.x,
                y: args.y,
                pageId: args.pageId,
                detach: args.detach,
                childLayout: args.childLayout,
            })});`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Library component instantiated successfully.");
    }
}
