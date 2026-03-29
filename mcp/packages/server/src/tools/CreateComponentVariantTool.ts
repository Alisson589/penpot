import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class CreateComponentVariantArgs {
    static schema = {
        componentIds: z.array(z.string().min(1)).min(2).describe("Local component ids to combine as variants."),
        propertyName: z.string().optional().describe("Variant property name, for example `State`."),
        variantValues: z.array(z.string()).optional().describe("Variant values aligned with `componentIds`."),
        containerName: z.string().optional().describe("Optional visible name for the variant container."),
        pageId: z.string().optional().describe("Optional page id for the variant container."),
    };

    componentIds!: string[];
    propertyName?: string;
    variantValues?: string[];
    containerName?: string;
    pageId?: string;
}

export class CreateComponentVariantTool extends Tool<CreateComponentVariantArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateComponentVariantArgs.schema);
    }
    public getToolName(): string {
        return "create_component_variant";
    }
    public getToolDescription(): string {
        return "Creates a variant group from existing local components. Use this when the user asks for a real component variation such as state, size, or mode.";
    }
    protected async executeCore(args: CreateComponentVariantArgs): Promise<ToolResponse> {
        const task = new ExecuteCodePluginTask({ code: `return penpotUtils.createComponentVariant(${JSON.stringify(args)});` });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
