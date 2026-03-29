import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class EnsureFrameScaffoldingArgs {
    static schema = {
        name: z.string().min(1).describe("Base screen/component name."),
        buildTarget: z.enum(["screen", "widget", "both"]).describe("Whether to scaffold screen frames, component frames, or both."),
        devices: z.array(z.enum(["mobile", "tablet", "desktop"])).min(1).describe("Device frames to scaffold for screens."),
        screenPageName: z.string().optional().describe("Optional page name for screen frames. Defaults to `Screens/<Name>`."),
        componentsPageName: z.string().optional().describe("Optional page name for component frames. Defaults to `_Components`."),
        confirmed: z.boolean().describe("Must be true; structural scaffolding should only run after explicit user confirmation."),
    };

    name!: string;
    buildTarget!: "screen" | "widget" | "both";
    devices!: Array<"mobile" | "tablet" | "desktop">;
    screenPageName?: string;
    componentsPageName?: string;
    confirmed!: boolean;
}

export class EnsureFrameScaffoldingTool extends Tool<EnsureFrameScaffoldingArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, EnsureFrameScaffoldingArgs.schema);
    }

    public getToolName(): string {
        return "ensure_frame_scaffolding";
    }

    public getToolDescription(): string {
        return (
            "Creates only the parent frames/boards needed to start UI construction in Penpot. " +
            "This is a structural mutation and requires `confirmed: true`."
        );
    }

    protected async executeCore(args: EnsureFrameScaffoldingArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.ensureFrameScaffolding(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Frame scaffolding completed with no result.");
    }
}
