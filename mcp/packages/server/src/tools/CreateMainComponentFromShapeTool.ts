import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class CreateMainComponentFromShapeArgs {
    static schema = {
        shapeId: z.string().describe("Id of the board/group/shape to promote into a local library component."),
        componentName: z
            .string()
            .optional()
            .describe("Optional library component name. Prefer hierarchical naming with `/`, e.g. `Buttons/Primary/Default`."),
        componentPageName: z
            .string()
            .optional()
            .describe("Optional page name where the main component should live. Defaults to `_Components`."),
        leaveInstanceOnSourcePage: z
            .boolean()
            .optional()
            .describe("When true, recreate an instance on the original page after moving the main component to `_Components`. Defaults to true."),
    };

    shapeId!: string;
    componentName?: string;
    componentPageName?: string;
    leaveInstanceOnSourcePage?: boolean;
}

export class CreateMainComponentFromShapeTool extends Tool<CreateMainComponentFromShapeArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, CreateMainComponentFromShapeArgs.schema);
    }

    public getToolName(): string {
        return "create_main_component_from_shape";
    }

    public getToolDescription(): string {
        return (
            "Promotes a board/group/shape into a local Penpot library component. " +
            "Create the source frame on `_Components` first, then promote it and consume it from the local Assets/library in screens. " +
            "Do not use this to create main components directly from screen pages."
        );
    }

    protected async executeCore(args: CreateMainComponentFromShapeArgs): Promise<ToolResponse> {
        const code = `return penpotUtils.createMainComponentFromShape(${JSON.stringify(args)});`;
        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }

        return new TextResponse("Main component created successfully.");
    }
}
