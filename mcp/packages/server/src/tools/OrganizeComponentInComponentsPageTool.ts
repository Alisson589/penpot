import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class OrganizeComponentInComponentsPageArgs {
    static schema = {
        shapeId: z.string().describe("Shape id on `_Components` to organize."),
        componentName: z.string().optional().describe("Optional component name used for staging and naming."),
        category: z.string().optional().describe("Optional category override for `_Components` canvas layout."),
        pageId: z.string().optional().describe("Optional page id; when omitted the tool resolves the shape's page."),
    };

    shapeId!: string;
    componentName?: string;
    category?: string;
    pageId?: string;
}

export class OrganizeComponentInComponentsPageTool extends Tool<OrganizeComponentInComponentsPageArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, OrganizeComponentInComponentsPageArgs.schema);
    }

    public getToolName(): string {
        return "organize_component_in_components_page";
    }

    public getToolDescription(): string {
        return "Moves or restages a component shell inside `_Components` so category labels, spacing, and side-by-side placement remain organized and non-overlapping.";
    }

    protected async executeCore(args: OrganizeComponentInComponentsPageArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.organizeShapeInComponentsPage(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
