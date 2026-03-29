import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class InspectCanvasArgs {
    static schema = {
        pageId: z.string().optional().describe("Optional Penpot page id to inspect. Defaults to the current page."),
        maxDepth: z
            .number()
            .int()
            .min(1)
            .max(10)
            .optional()
            .describe("Maximum recursion depth for the returned shape structure. Defaults to 4."),
        includeFullStructure: z
            .boolean()
            .optional()
            .describe("When true, include the recursive root shape structure in the response."),
    };

    pageId?: string;
    maxDepth?: number;
    includeFullStructure?: boolean;
}

export class InspectCanvasTool extends Tool<InspectCanvasArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, InspectCanvasArgs.schema);
    }

    public getToolName(): string {
        return "inspect_canvas";
    }

    public getToolDescription(): string {
        return (
            "Inspects the current Penpot canvas recursively and returns file/page context, top-level items, boards, " +
            "slots, and component instances. Use this before concluding that a board or slot is missing."
        );
    }

    protected async executeCore(args: InspectCanvasArgs): Promise<ToolResponse> {
        const code =
            `const page = ${args.pageId ? `penpotUtils.getPageById(${JSON.stringify(args.pageId)})` : "penpot.currentPage"};\n` +
            `if (!penpot.currentFile) throw new Error("No current file is active in the plugin context.");\n` +
            `if (!page) throw new Error("No current page is active in the plugin context.");\n` +
            `const root = page.root;\n` +
            `const topLevel = (root.children ?? []).map((shape) => ({\n` +
            `  id: shape.id,\n` +
            `  name: shape.name,\n` +
            `  type: shape.type,\n` +
            `  childCount: ("children" in shape && shape.children) ? shape.children.length : 0\n` +
            `}));\n` +
            `const boards = penpotUtils.findShapes((shape) => shape.type === "board", root).map((shape) => ({\n` +
            `  id: shape.id,\n` +
            `  name: shape.name,\n` +
            `  parentId: shape.parent ? shape.parent.id : null,\n` +
            `  childCount: ("children" in shape && shape.children) ? shape.children.length : 0\n` +
            `}));\n` +
            `const componentInstances = penpotUtils.findShapes((shape) => shape.isComponentInstance(), root).map((shape) => {\n` +
            `  const component = shape.component();\n` +
            `  return {\n` +
            `    id: shape.id,\n` +
            `    name: shape.name,\n` +
            `    parentId: shape.parent ? shape.parent.id : null,\n` +
            `    componentId: component ? component.id : null,\n` +
            `    componentName: component ? component.name : null\n` +
            `  };\n` +
            `});\n` +
            `const slots = boards.filter((board) => /slot/i.test(board.name));\n` +
            `const response = {\n` +
            `  pages: penpotUtils.getPages(),\n` +
            `  file: { id: penpot.currentFile.id, name: penpot.currentFile.name },\n` +
            `  page: { id: page.id, name: page.name },\n` +
            `  topLevel,\n` +
            `  boardCount: boards.length,\n` +
            `  componentInstanceCount: componentInstances.length,\n` +
            `  boards,\n` +
            `  slots,\n` +
            `  componentInstances,\n` +
            `};\n` +
            `if (${args.includeFullStructure === true}) {\n` +
            `  response.structure = penpotUtils.shapeStructure(root, ${args.maxDepth ?? 4});\n` +
            `}\n` +
            `return response;`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Canvas inspection completed with no result.");
    }
}
