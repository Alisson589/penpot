import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class InspectDesignTokenUsageArgs {
    static schema = {
        shapeId: z.string().optional().describe("Optional root shape id to inspect."),
        pageId: z.string().optional().describe("Optional page id. Defaults to the current page."),
        includeSubtree: z
            .boolean()
            .optional()
            .describe("When true, inspect descendants recursively. Defaults to false."),
        includeCatalogMatches: z
            .boolean()
            .optional()
            .describe("When true, include matching catalog token suggestions for hardcoded values. Defaults to true."),
    };

    shapeId?: string;
    pageId?: string;
    includeSubtree?: boolean;
    includeCatalogMatches?: boolean;
}

export class InspectDesignTokenUsageTool extends Tool<InspectDesignTokenUsageArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InspectDesignTokenUsageArgs.schema);
    }

    public getToolName(): string {
        return "inspect_design_token_usage";
    }

    public getToolDescription(): string {
        return "Inspects token bindings on a shape or subtree, and reports hardcoded values in common tokenizable properties with optional matching token suggestions from the catalog.";
    }

    protected async executeCore(args: InspectDesignTokenUsageArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.inspectDesignTokenUsage(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Design token usage inspection completed with no result.");
    }
}
