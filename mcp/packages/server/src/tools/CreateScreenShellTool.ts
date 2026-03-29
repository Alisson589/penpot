import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class CreateScreenShellArgs {
    static schema = {
        name: z.string().min(1).describe("Root screen shell name."),
        root: z.any().optional().describe("Optional root widget tree definition for the screen shell. If omitted, a default column shell is created."),
        pageId: z.string().optional().describe("Optional target screen page id."),
        screenPageName: z.string().optional().describe("Optional target screen page name, for example `Screens/Home`."),
    };

    name!: string;
    root?: unknown;
    pageId?: string;
    screenPageName?: string;
}

export class CreateScreenShellTool extends Tool<CreateScreenShellArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateScreenShellArgs.schema);
    }

    public getToolName(): string {
        return "create_screen_shell";
    }

    public getToolDescription(): string {
        return "Creates a structured screen shell on an existing `Screens/*` page using the safe widget-tree runtime.";
    }

    protected async executeCore(args: CreateScreenShellArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.createScreenShell(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
