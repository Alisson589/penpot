import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class CreateTextBlockArgs {
    static schema = {
        name: z.string().min(1).describe("Name of the text block."),
        text: z.string().min(1).describe("Text content."),
        pageId: z.string().optional().describe("Optional target page id."),
        targetShapeId: z.string().optional().describe("Optional container/slot id where the text block should be docked."),
        width: z.number().optional().describe("Optional block/text width."),
        fontSize: z.number().optional().describe("Optional font size."),
        textColorToken: z.string().optional().describe("Optional text color token name."),
        typographyToken: z.string().optional().describe("Optional typography token name."),
    };

    name!: string;
    text!: string;
    pageId?: string;
    targetShapeId?: string;
    width?: number;
    fontSize?: number;
    textColorToken?: string;
    typographyToken?: string;
}

export class CreateTextBlockTool extends Tool<CreateTextBlockArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateTextBlockArgs.schema);
    }
    public getToolName(): string {
        return "create_text_block";
    }
    public getToolDescription(): string {
        return "Creates a safe text block with an inner layout frame and token-friendly defaults instead of a free text layer.";
    }
    protected async executeCore(args: CreateTextBlockArgs): Promise<ToolResponse> {
        const task = new ExecuteCodePluginTask({ code: `return penpotUtils.createTextBlock(${JSON.stringify(args)});` });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
