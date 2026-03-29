import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class ListScreenPagesTool extends Tool<Record<string, never>> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, {});
    }

    public getToolName(): string {
        return "list_screen_pages";
    }

    public getToolDescription(): string {
        return "Lists the available `Screens/*` pages in the current Penpot file, including their visible numeric page ids when present.";
    }

    protected async executeCore(): Promise<ToolResponse> {
        const task = new ExecuteCodePluginTask({ code: "return penpotUtils.listScreenPages();" });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? [], null, 2));
    }
}
