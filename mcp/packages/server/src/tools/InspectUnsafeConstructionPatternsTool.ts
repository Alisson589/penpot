import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class InspectUnsafeConstructionPatternsArgs {
    static schema = {
        pageId: z.string().optional().describe("Optional page id to inspect. Defaults to the current Penpot page."),
    };

    pageId?: string;
}

export class InspectUnsafeConstructionPatternsTool extends Tool<InspectUnsafeConstructionPatternsArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InspectUnsafeConstructionPatternsArgs.schema);
    }

    public getToolName(): string {
        return "inspect_unsafe_construction_patterns";
    }

    public getToolDescription(): string {
        return "Lints the current page for risky Penpot construction patterns such as screens without component instances, duplicate components, direct text under component roots, or suspicious layout settings.";
    }

    protected async executeCore(args: InspectUnsafeConstructionPatternsArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.inspectUnsafeConstructionPatterns(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Construction safety inspection completed with no result.");
    }
}
