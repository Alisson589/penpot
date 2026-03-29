import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class DiagnoseExportShapeArgs {
    static schema = {
        shapeId: z.string().optional().describe("Optional shape id to diagnose. Defaults to the current page root."),
        pageId: z.string().optional().describe("Optional Penpot page id."),
    };

    shapeId?: string;
    pageId?: string;
}

export class DiagnoseExportShapeTool extends Tool<DiagnoseExportShapeArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, DiagnoseExportShapeArgs.schema);
    }

    public getToolName(): string {
        return "diagnose_export_shape";
    }

    public getToolDescription(): string {
        return "Inspects a shape subtree for export-related risks and returns candidate fallback targets when `export_shape` fails on a complex board.";
    }

    protected async executeCore(args: DiagnoseExportShapeArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.diagnoseExportShape(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Export diagnosis completed with no result.");
    }
}
