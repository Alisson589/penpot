import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class ApplyComponentVariantOverridesArgs {
    static schema = {
        instanceShapeId: z.string().describe("Component instance id on the screen."),
        pageId: z.string().optional().describe("Optional page id."),
        variantOverrides: z.record(z.string(), z.string()).describe("Variant property/value pairs to apply."),
    };

    instanceShapeId!: string;
    pageId?: string;
    variantOverrides!: Record<string, string>;
}

export class ApplyComponentVariantOverridesTool extends Tool<ApplyComponentVariantOverridesArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, ApplyComponentVariantOverridesArgs.schema);
    }
    public getToolName(): string {
        return "apply_component_variant_overrides";
    }
    public getToolDescription(): string {
        return "Switches a placed component instance to another local variant by matching the requested variant properties and replacing the instance in place.";
    }
    protected async executeCore(args: ApplyComponentVariantOverridesArgs): Promise<ToolResponse> {
        const task = new ExecuteCodePluginTask({ code: `return penpotUtils.applyComponentVariantOverrides(${JSON.stringify(args)});` });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
