import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class InspectDesignTokensArgs {
    static schema = {
        includeTokens: z
            .boolean()
            .optional()
            .describe("When true, include full token lists per set. Defaults to true."),
    };

    includeTokens?: boolean;
}

export class InspectDesignTokensTool extends Tool<InspectDesignTokensArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InspectDesignTokensArgs.schema);
    }

    public getToolName(): string {
        return "inspect_design_tokens";
    }

    public getToolDescription(): string {
        return (
            "Inspects the file's real Penpot token catalog (`penpot.library.local.tokens`) and returns themes, sets, " +
            "active state, and token definitions. Use this instead of relying on a `_Tokens` page."
        );
    }

    protected async executeCore(args: InspectDesignTokensArgs): Promise<ToolResponse> {
        const code =
            `const summary = penpotUtils.inspectDesignTokens();\n` +
            `if (${args.includeTokens === false}) {\n` +
            `  summary.sets = summary.sets.map((set) => ({ ...set, tokens: undefined }));\n` +
            `}\n` +
            `return summary;`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Design token inspection completed with no result.");
    }
}
