import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class PublishComponentsFromComponentsPageArgs {
    static schema = {
        pageId: z.string().optional().describe("Optional `_Components` page id."),
        shapeIds: z.array(z.string()).optional().describe("Optional list of top-level component shell ids to publish. Defaults to eligible top-level shapes on `_Components`."),
        componentPageName: z.string().optional().describe("Optional component page name. Defaults to `_Components`."),
    };

    pageId?: string;
    shapeIds?: string[];
    componentPageName?: string;
}

export class PublishComponentsFromComponentsPageTool extends Tool<PublishComponentsFromComponentsPageArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, PublishComponentsFromComponentsPageArgs.schema);
    }

    public getToolName(): string {
        return "publish_components_from_components_page";
    }

    public getToolDescription(): string {
        return "Publishes eligible component shells from `_Components` into the local Penpot library by promoting them into main components in batch.";
    }

    protected async executeCore(args: PublishComponentsFromComponentsPageArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.publishComponentsFromComponentsPage(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        if (result.data && typeof result.data === 'object' && 'skipped' in result.data && Array.isArray((result.data as any).skipped) && (result.data as any).skipped.length > 0) {
            return new TextResponse(`Published ${((result.data as any).published || []).length} components, but SKIPPED ${((result.data as any).skipped).length} components (review errors):\n${JSON.stringify(result.data, null, 2)}`);
        }
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
