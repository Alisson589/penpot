import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class UpsertDesignTokenArgs {
    static schema = {
        setName: z.string().min(1).describe("Token set name where the token should exist."),
        type: z
            .enum([
                "color",
                "dimension",
                "spacing",
                "typography",
                "shadow",
                "opacity",
                "borderRadius",
                "borderWidth",
                "fontWeights",
                "fontSizes",
                "fontFamilies",
                "letterSpacing",
                "number",
                "rotation",
                "sizing",
                "textDecoration",
                "textCase",
            ])
            .describe("Penpot token type."),
        name: z.string().min(1).describe("Token name, typically using dot notation such as `color.primary`."),
        value: z
            .any()
            .describe(
                "Token value. The MCP normalizes common Penpot quirks automatically, for example numbers to text for spacing/fontSizes/borderRadius-like tokens and a single string to an array for fontFamilies."
            ),
        description: z.string().optional().describe("Optional token description."),
        activateSet: z.boolean().optional().describe("When true, activate the set after ensuring/updating the token."),
    };

    setName!: string;
    type!: string;
    name!: string;
    value!: unknown;
    description?: string;
    activateSet?: boolean;
}

export class UpsertDesignTokenTool extends Tool<UpsertDesignTokenArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, UpsertDesignTokenArgs.schema);
    }

    public getToolName(): string {
        return "upsert_design_token";
    }

    public getToolDescription(): string {
        return "Creates or updates a real Penpot design token inside a token set in the file token catalog, with MCP-side normalization for common Penpot token value formats.";
    }

    protected async executeCore(args: UpsertDesignTokenArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.upsertDesignToken(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Design token upsert completed with no result.");
    }
}
