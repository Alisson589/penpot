import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class ExportToFlutterArgs {
    static schema = {
        shapeId: z
            .string()
            .optional()
            .describe("Optional root shape id to export. If omitted, export the current page as a synthetic page root."),
        pageId: z.string().optional().describe("Optional Penpot page id to export. Defaults to the current page."),
    };

    shapeId?: string;
    pageId?: string;
}

export class ExportToFlutterTool extends Tool<ExportToFlutterArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, ExportToFlutterArgs.schema);
    }

    public getToolName(): string {
        return "export_to_flutter";
    }

    public getToolDescription(): string {
        return (
            "Reads the current Penpot page or a specific shape subtree and returns a Flutter-oriented intermediate " +
            "representation based on widget metadata, slots, library origins, and safe layout/spacing intent."
        );
    }

    protected async executeCore(args: ExportToFlutterArgs): Promise<ToolResponse> {
        const code =
            `return penpotUtils.exportToFlutterTree({` +
            ` shapeId: ${args.shapeId ? JSON.stringify(args.shapeId) : "undefined"},` +
            ` pageId: ${args.pageId ? JSON.stringify(args.pageId) : "undefined"}` +
            ` });`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Flutter export completed with no result.");
    }
}
