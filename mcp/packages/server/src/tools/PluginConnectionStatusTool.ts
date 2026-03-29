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
            "Reports whether a Penpot MCP plugin instance is currently connected and ready to serve tool calls. " +
            "Call this before any mutation if there is a chance the plugin was rebuilt, reloaded, or disconnected."
        );
    }

    protected async executeCore(_: EmptyToolArgs): Promise<ToolResponse> {
        const status = this.mcpServer.pluginBridge.getConnectionStatus();
        const response = {
            ...status,
            nextStep: status.ready
                ? "Plugin connection is ready for MCP actions."
                : "Reconnect the Penpot MCP plugin in the open Penpot file, then call this tool again.",
        };
        return new TextResponse(JSON.stringify(response, null, 2));
    }
}
