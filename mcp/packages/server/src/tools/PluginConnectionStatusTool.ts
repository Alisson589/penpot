import { Tool, EmptyToolArgs } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";

export class PluginConnectionStatusTool extends Tool<EmptyToolArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, EmptyToolArgs.schema);
    }

    public getToolName(): string {
        return "plugin_connection_status";
    }

    public getToolDescription(): string {
        return (
            "PRIORITY 1 AFTER THE RECOMMENDED FLOW TOOL. Reports whether a Penpot MCP plugin instance is currently connected and ready to serve tool calls. " +
            "Call first_tool_recommended_flow or recommended_tool_flow before this when starting a fresh session."
        );
    }

    protected async executeCore(_: EmptyToolArgs): Promise<ToolResponse> {
        const status = this.mcpServer.pluginBridge.getConnectionStatus();
        const response = {
            ...status,
            nextStep: status.ready
                ? "Plugin connection is ready. If this is a fresh session, call first_tool_recommended_flow next."
                : "Reconnect the Penpot MCP plugin in the open Penpot file, then call this tool again. After that, call first_tool_recommended_flow.",
        };
        return new TextResponse(JSON.stringify(response, null, 2));
    }
}
