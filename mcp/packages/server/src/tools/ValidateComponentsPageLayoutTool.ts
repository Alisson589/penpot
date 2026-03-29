import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class ValidateComponentsPageLayoutArgs {
    static schema = {
        pageId: z.string().optional().describe("Optional `_Components` page id."),
        componentPageName: z.string().optional().describe("Optional component page name. Defaults to `_Components`."),
    };

    pageId?: string;
    componentPageName?: string;
}

export class ValidateComponentsPageLayoutTool extends Tool<ValidateComponentsPageLayoutArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, ValidateComponentsPageLayoutArgs.schema);
    }
    public getToolName(): string {
        return "validate_components_page_layout";
    }
    public getToolDescription(): string {
        return "Validates `_Components` canvas organization: overlap, missing categories, and layout hygiene for component staging.";
    }
    protected async executeCore(args: ValidateComponentsPageLayoutArgs): Promise<ToolResponse> {
        const task = new ExecuteCodePluginTask({ code: `return penpotUtils.validateComponentsPageLayout(${JSON.stringify(args)});` });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
