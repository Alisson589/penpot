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

export class InstantiateLibraryComponentIntoSlotArgs {
    static schema = {
        libraryName: z.string().optional().describe("Optional substring of the library name."),
        componentNameContains: z.string().optional().describe("Optional substring that should appear in the component name."),
        componentPathContains: z.string().optional().describe("Optional substring that should appear in the component path."),
        targetShapeId: z.string().describe("Id of the slot or container that should receive the new component instance."),
        pageId: z.string().optional().describe("Optional Penpot page id where the component instance should be created."),
        detach: z.boolean().optional().describe("Detach the instance immediately after creation if independent editing is required."),
        childLayout: childLayoutSchema.optional().describe("Optional layout child rules to apply after docking."),
        fit: z.enum(["none", "contain", "fill-width", "fill-height", "stretch"]).optional().describe("Optional fit policy after docking."),
        inset: z.number().optional().describe("Optional inset used by fit policies."),
    };

    libraryName?: string;
    componentNameContains?: string;
    componentPathContains?: string;
    targetShapeId!: string;
    pageId?: string;
    detach?: boolean;
    childLayout?: z.infer<typeof childLayoutSchema>;
    fit?: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
    inset?: number;
}

export class InstantiateLibraryComponentIntoSlotTool extends Tool<InstantiateLibraryComponentIntoSlotArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InstantiateLibraryComponentIntoSlotArgs.schema);
    }

    public getToolName(): string {
        return "instantiate_library_component_into_slot";
    }

    public getToolDescription(): string {
        return (
            "Instantiates a matching library component and immediately docks it into a target slot/container with fit and layout rules. " +
            "Before using this, call plugin_connection_status to verify readiness and inspect_canvas to confirm the slot/container exists."
        );
    }

    protected async executeCore(args: InstantiateLibraryComponentIntoSlotArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.instantiateLibraryComponentIntoSlot(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Library component instantiated into slot successfully.");
    }
}
