import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class PlanUiBuildArgs {
    static schema = {
        buildTarget: z.enum(["screen", "widget", "both"]).describe("Whether the user wants a screen, a reusable widget, or both."),
        name: z.string().min(1).describe("Screen/widget base name, for example `DashboardScreen` or `ProductCard`."),
        devices: z.array(z.enum(["mobile", "tablet", "desktop"])).min(1).describe("Target devices for frame scaffolding."),
        createTokensIfMissing: z.boolean().optional().describe("Whether missing tokens should be proposed in the plan. Defaults to true."),
        createPagesIfMissing: z.boolean().optional().describe("Whether missing pages should be proposed in the plan. Defaults to true."),
        hasReference: z.boolean().optional().describe("Whether a visual reference already exists."),
    };

    buildTarget!: "screen" | "widget" | "both";
    name!: string;
    devices!: Array<"mobile" | "tablet" | "desktop">;
    createTokensIfMissing?: boolean;
    createPagesIfMissing?: boolean;
    hasReference?: boolean;
}

export class PlanUiBuildTool extends Tool<PlanUiBuildArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, PlanUiBuildArgs.schema);
    }

    public getToolName(): string {
        return "plan_ui_build";
    }

    public getToolDescription(): string {
        return (
            "Builds a non-mutating UI construction plan for Penpot, including missing tokens/pages, suggested frames, and the actions that require explicit user confirmation."
        );
    }

    protected async executeCore(args: PlanUiBuildArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.planUiBuild(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("UI build plan completed with no result.");
    }
}
