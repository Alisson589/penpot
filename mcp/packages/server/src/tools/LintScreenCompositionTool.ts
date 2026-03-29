import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class LintScreenCompositionArgs {
    static schema = {
        pageId: z.string().optional().describe("Optional `Screens/*` page id to lint."),
    };

    pageId?: string;
}

export class LintScreenCompositionTool extends Tool<LintScreenCompositionArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, LintScreenCompositionArgs.schema);
    }
    public getToolName(): string {
        return "lint_screen_composition";
    }
    public getToolDescription(): string {
        return "Lints a `Screens/*` page for risky composition patterns such as too many raw shapes, missing instances, and untokenized structure.";
    }
    protected async executeCore(args: LintScreenCompositionArgs): Promise<ToolResponse> {
        const task = new ExecuteCodePluginTask({ code: `return penpotUtils.lintScreenComposition(${JSON.stringify(args)});` });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
