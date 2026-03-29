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
        x: z.number().optional().describe("Optional x position for the new instance."),
        y: z.number().optional().describe("Optional y position for the new instance."),
        pageId: z.string().optional().describe("Optional Penpot page id where the component instance should be created."),
        detach: z.boolean().optional().describe("Detach the instance immediately after creation if independent editing is required."),
    };

    libraryName?: string;
    componentNameContains?: string;
    componentPathContains?: string;
    x?: number;
    y?: number;
    pageId?: string;
    detach?: boolean;
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
            "Prefer this over manual widget construction whenever a suitable connected library component already exists."
        );
    }

    protected async executeCore(args: InstantiateLibraryComponentArgs): Promise<ToolResponse> {
        const code =
            `return penpotUtils.instantiateLibraryComponent(${JSON.stringify({
                libraryName: args.libraryName,
                componentNameContains: args.componentNameContains,
                componentPathContains: args.componentPathContains,
                x: args.x,
                y: args.y,
                pageId: args.pageId,
                detach: args.detach,
            })});`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Library component instantiated successfully.");
    }
}
