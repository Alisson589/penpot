import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class ApplyDesignTokensToShapeArgs {
    static schema = {
        shapeId: z.string().min(1).describe("Target shape id."),
        pageId: z.string().optional().describe("Optional page id. Defaults to the current page."),
        assignments: z
            .array(
                z.object({
                    tokenName: z.string().min(1).describe("Exact token name to apply."),
                    setName: z.string().optional().describe("Optional set name when the token name is ambiguous."),
                    properties: z
                        .array(z.string().min(1))
                        .optional()
                        .describe("Optional TokenProperty list such as `fill`, `fontSize`, `borderRadius`, `rowGap`."),
                })
            )
            .min(1)
            .describe("Token applications to perform on the shape."),
    };

    shapeId!: string;
    pageId?: string;
    assignments!: Array<{
        tokenName: string;
        setName?: string;
        properties?: string[];
    }>;
}

export class ApplyDesignTokensToShapeTool extends Tool<ApplyDesignTokensToShapeArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, ApplyDesignTokensToShapeArgs.schema);
    }

    public getToolName(): string {
        return "apply_design_tokens_to_shape";
    }

    public getToolDescription(): string {
        return "Applies one or more real Penpot design tokens to a shape using `shape.applyToken(...)`, with explicit token names and optional TokenProperty targeting.";
    }

    protected async executeCore(args: ApplyDesignTokensToShapeArgs): Promise<ToolResponse> {
        const code = `return await penpotUtils.applyDesignTokensToShape(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Design token application completed with no result.");
    }
}
