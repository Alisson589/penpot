import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class FindLocalComponentsArgs {
    static schema = {
        nameContains: z.string().optional().describe("Optional local component name query."),
        pathContains: z.string().optional().describe("Optional local component path query."),
        matchMode: z.enum(["exact", "prefix", "contains"]).optional().describe("How local component names/paths should be matched."),
        requireExactMatch: z.boolean().optional().describe("When true, fail inexact matches."),
        limit: z.number().int().positive().max(100).optional().describe("Maximum number of results to return."),
    };

    nameContains?: string;
    pathContains?: string;
    matchMode?: "exact" | "prefix" | "contains";
    requireExactMatch?: boolean;
    limit?: number;
}

export class FindLocalComponentsTool extends Tool<FindLocalComponentsArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, FindLocalComponentsArgs.schema);
    }

    public getToolName(): string {
        return "find_local_components";
    }

    public getToolDescription(): string {
        return "Lists or searches local components from the current Penpot file. Use this before instantiating local library components into screens.";
    }

    protected async executeCore(args: FindLocalComponentsArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.listLocalComponents(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Local component search completed with no result.");
    }
}
