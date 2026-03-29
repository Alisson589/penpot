import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class InspectProjectSetupArgs {
    static schema = {
        pageId: z.string().optional().describe("Optional Penpot page id to inspect."),
        preferredScreenName: z.string().optional().describe("Optional screen/page name to check for reuse."),
        preferredComponentName: z.string().optional().describe("Optional component/page name to check for reuse."),
    };

    pageId?: string;
    preferredScreenName?: string;
    preferredComponentName?: string;
}

export class InspectProjectSetupTool extends Tool<InspectProjectSetupArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InspectProjectSetupArgs.schema);
    }

    public getToolName(): string {
        return "inspect_project_setup";
    }

    public getToolDescription(): string {
        return (
            "PRIORITY 1. Inspects the current Penpot file for build-readiness: pages, token catalog, libraries, local components, current page, and selection. " +
            "Use this before creating tokens, pages, frames, components, or screens."
        );
    }

    protected async executeCore(args: InspectProjectSetupArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.inspectProjectSetup(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Project setup inspection completed with no result.");
    }
}
