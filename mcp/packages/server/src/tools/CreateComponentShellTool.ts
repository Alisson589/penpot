import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class CreateComponentShellArgs {
    static schema = {
        name: z.string().min(1).describe("Component shell name to create on `_Components`."),
        root: z.any().describe("Root widget tree definition used to build the component shell."),
        componentPageName: z.string().optional().describe("Optional component page name. Defaults to `_Components`."),
        category: z.string().optional().describe("Optional category label in `_Components`, e.g. `CARDS` or `MEMBERS`."),
    };

    name!: string;
    root!: unknown;
    componentPageName?: string;
    category?: string;
}

export class CreateComponentShellTool extends Tool<CreateComponentShellArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateComponentShellArgs.schema);
    }

    public getToolName(): string {
        return "create_component_shell";
    }

    public getToolDescription(): string {
        return "Creates a structured component shell on `_Components` using the safe widget-tree runtime, then stages it into the requested category without publishing it yet.";
    }

    protected async executeCore(args: CreateComponentShellArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.createComponentShell(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
