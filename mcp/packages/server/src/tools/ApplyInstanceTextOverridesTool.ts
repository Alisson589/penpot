import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class ApplyInstanceTextOverridesArgs {
    static schema = {
        instanceShapeId: z.string().describe("Id of the component instance on the screen."),
        pageId: z.string().optional().describe("Optional page id where the instance lives."),
        overrides: z
            .array(
                z.object({
                    layerName: z.string().describe("Text layer name inside the instance subtree."),
                    text: z.string().describe("New text content for that layer."),
                })
            )
            .min(1)
            .describe("Text overrides to apply to the instance."),
    };

    instanceShapeId!: string;
    pageId?: string;
    overrides!: Array<{ layerName: string; text: string }>;
}

export class ApplyInstanceTextOverridesTool extends Tool<ApplyInstanceTextOverridesArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, ApplyInstanceTextOverridesArgs.schema);
    }

    public getToolName(): string {
        return "apply_instance_text_overrides";
    }

    public getToolDescription(): string {
        return "Applies text overrides to named text layers inside a component instance on a screen, instead of duplicating the main component by content.";
    }

    protected async executeCore(args: ApplyInstanceTextOverridesArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.applyInstanceTextOverrides(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Instance text overrides applied successfully.");
    }
}
