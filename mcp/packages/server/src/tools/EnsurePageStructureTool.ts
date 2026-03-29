import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class EnsurePageStructureArgs {
    static schema = {
        includeTokens: z.boolean().optional().describe("Ensure the `_Tokens` page exists. Defaults to true."),
        includeComponents: z.boolean().optional().describe("Ensure the `_Components` page exists. Defaults to true."),
        includeDocumentation: z.boolean().optional().describe("Ensure the `_Documentation` page exists. Defaults to true."),
        screens: z
            .array(z.string())
            .optional()
            .describe("Optional list of screen page names. Plain names are normalized to `Screens/<name>`."),
        openPageName: z
            .string()
            .optional()
            .describe("Optional page name to open after ensuring the structure. Use the final page name, e.g. `_Components` or `Screens/Home`."),
    };

    includeTokens?: boolean;
    includeComponents?: boolean;
    includeDocumentation?: boolean;
    screens?: string[];
    openPageName?: string;
}

export class EnsurePageStructureTool extends Tool<EnsurePageStructureArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, EnsurePageStructureArgs.schema);
    }

    public getToolName(): string {
        return "ensure_page_structure";
    }

    public getToolDescription(): string {
        return (
            "Ensures a Penpot file contains the standard structural pages for design-system work, " +
            "such as `_Tokens`, `_Components`, `_Documentation`, and optional `Screens/*` pages."
        );
    }

    protected async executeCore(args: EnsurePageStructureArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.ensurePageStructure(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Page structure ensured successfully.");
    }
}
