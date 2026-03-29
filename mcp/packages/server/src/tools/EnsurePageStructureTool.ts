import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class EnsurePageStructureArgs {
    static schema = {
        includeTokens: z.boolean().optional().describe("Ensure the `_Tokens` page exists. Defaults to false."),
        includeComponents: z.boolean().optional().describe("Ensure the `_Components` page exists. Defaults to false; pass true when needed."),
        includeDocumentation: z.boolean().optional().describe("Ensure the `_Documentation` page exists. Defaults to false."),
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
            "Ensures only the explicitly requested structural pages exist in the Penpot file. " +
            "Use this conservatively; do not create `_Tokens` or `_Documentation` unless the user asked for them or they are truly required."
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
