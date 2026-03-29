import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class CreateScreenPageArgs {
    static schema = {
        name: z.string().min(1).describe("Base screen name, for example `Dashboard` or `LandingPage`."),
        devices: z.array(z.enum(["mobile", "tablet", "desktop"])).min(1).describe("Devices to scaffold on the screen page."),
    };

    name!: string;
    devices!: Array<"mobile" | "tablet" | "desktop">;
}

export class CreateScreenPageTool extends Tool<CreateScreenPageArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateScreenPageArgs.schema);
    }

    public getToolName(): string {
        return "create_screen_page";
    }

    public getToolDescription(): string {
        return "Creates or reuses a `Screens/*` page and scaffolds the requested device frames on it.";
    }

    protected async executeCore(args: CreateScreenPageArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.createScreenPage(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
