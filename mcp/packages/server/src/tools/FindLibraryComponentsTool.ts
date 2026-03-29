import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class FindLibraryComponentsArgs {
    static schema = {
        libraryName: z.string().optional().describe("Optional substring of the library name."),
        componentNameContains: z.string().optional().describe("Optional substring that should appear in the component name."),
        componentPathContains: z.string().optional().describe("Optional substring that should appear in the component path."),
        matchMode: z
            .enum(["exact", "prefix", "contains", "fuzzy"])
            .optional()
            .describe("How to match the name/path query. Defaults to `contains`; use `exact` for icon lookup."),
        requireExactMatch: z
            .boolean()
            .optional()
            .describe("When true, return only exact matches. Useful for icon libraries to avoid wrong variants."),
        limit: z.number().int().positive().max(100).optional().describe("Maximum number of matches to return."),
    };

    libraryName?: string;
    componentNameContains?: string;
    componentPathContains?: string;
    matchMode?: "exact" | "prefix" | "contains" | "fuzzy";
    requireExactMatch?: boolean;
    limit?: number;
}

export class FindLibraryComponentsTool extends Tool<FindLibraryComponentsArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, FindLibraryComponentsArgs.schema);
    }

    public getToolName(): string {
        return "find_library_components";
    }

    public getToolDescription(): string {
        return (
            "Finds reusable components in the current file's local or connected Penpot libraries. " +
            "Use this before creating manual widget structures, because library components should be preferred whenever possible."
        );
    }

    protected async executeCore(args: FindLibraryComponentsArgs): Promise<ToolResponse> {
        const code =
            `return penpotUtils.findLibraryComponents(${JSON.stringify({
                libraryName: args.libraryName,
                componentNameContains: args.componentNameContains,
                componentPathContains: args.componentPathContains,
                matchMode: args.matchMode,
                requireExactMatch: args.requireExactMatch,
                limit: args.limit,
            })});`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("No components found.");
    }
}
