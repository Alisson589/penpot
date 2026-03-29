import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class EnsureDesignTokenStructureArgs {
    static schema = {
        setName: z.string().optional().describe("Optional token set name to ensure exists."),
        themeGroup: z.string().optional().describe("Optional token theme group to ensure exists."),
        themeName: z.string().optional().describe("Optional token theme name to ensure exists."),
        attachSetToTheme: z
            .boolean()
            .optional()
            .describe("When true, add the ensured set to the ensured theme. Defaults to true."),
        activateSet: z.boolean().optional().describe("When true, activate the ensured set if it is inactive."),
        activateTheme: z.boolean().optional().describe("When true, activate the ensured theme if it is inactive."),
    };

    setName?: string;
    themeGroup?: string;
    themeName?: string;
    attachSetToTheme?: boolean;
    activateSet?: boolean;
    activateTheme?: boolean;
}

export class EnsureDesignTokenStructureTool extends Tool<EnsureDesignTokenStructureArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, EnsureDesignTokenStructureArgs.schema);
    }

    public getToolName(): string {
        return "ensure_design_token_structure";
    }

    public getToolDescription(): string {
        return "Ensures real Penpot token sets/themes exist in the file token catalog, optionally linking and activating them.";
    }

    protected async executeCore(args: EnsureDesignTokenStructureArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.ensureDesignTokenStructure(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Design token structure ensured with no result.");
    }
}
