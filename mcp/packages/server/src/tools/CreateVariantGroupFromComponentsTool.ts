import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class CreateVariantGroupFromComponentsArgs {
    static schema = {
        componentIds: z.array(z.string().min(1)).min(2).describe("Local component ids to combine as variants."),
        propertyName: z.string().optional().describe("Optional first variant property name, e.g. `State` or `Size`."),
        variantValues: z
            .array(z.string())
            .optional()
            .describe("Optional values for the first variant property, aligned with `componentIds`."),
        containerName: z.string().optional().describe("Optional visible name for the created variant container."),
        pageId: z.string().optional().describe("Optional page id where the variant container should be created."),
        x: z.number().optional().describe("Optional x position for the variant container."),
        y: z.number().optional().describe("Optional y position for the variant container."),
    };

    componentIds!: string[];
    propertyName?: string;
    variantValues?: string[];
    containerName?: string;
    pageId?: string;
    x?: number;
    y?: number;
}

export class CreateVariantGroupFromComponentsTool extends Tool<CreateVariantGroupFromComponentsArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateVariantGroupFromComponentsArgs.schema);
    }

    public getToolName(): string {
        return "create_variant_group_from_components";
    }

    public getToolDescription(): string {
        return "Creates a Penpot variant group from existing local components and optionally assigns the first variant property/values.";
    }

    protected async executeCore(args: CreateVariantGroupFromComponentsArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.createVariantGroupFromComponents(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Variant group created with no result.");
    }
}
