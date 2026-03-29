import { RecommendedToolFlowArgs, RecommendedToolFlowTool } from "./RecommendedToolFlowTool";
import { PenpotMcpServer } from "../PenpotMcpServer";

export class FirstToolRecommendedFlowTool extends RecommendedToolFlowTool {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer);
    }

    public getToolName(): string {
        return "first_tool_recommended_flow";
    }

    public getToolDescription(): string {
        return (
            "FIRST TOOL TO CALL. Returns the recommended Penpot MCP tool order by intent. " +
            "Use this before plugin_connection_status, inspect_project_setup, or any mutation."
        );
    }
}
