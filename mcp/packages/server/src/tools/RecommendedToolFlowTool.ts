import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";

export class RecommendedToolFlowArgs {
    static schema = {
        intent: z
            .enum(["inspect", "update", "build", "tokens", "components", "export", "diagnose"])
            .optional()
            .describe("Optional high-level intent used to return a more specific recommended tool sequence."),
    };

    intent?: "inspect" | "update" | "build" | "tokens" | "components" | "export" | "diagnose";
}

export class RecommendedToolFlowTool extends Tool<RecommendedToolFlowArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, RecommendedToolFlowArgs.schema);
    }

    public getToolName(): string {
        return "recommended_tool_flow";
    }

    public getToolDescription(): string {
        return (
            "FIRST TOOL TO CALL. Priority guide for Penpot MCP usage. Call this when you need to recover context or choose the right tool order. " +
            "It returns the recommended sequence by intent and highlights advanced tools that should be used sparingly."
        );
    }

    protected async executeCore(args: RecommendedToolFlowArgs): Promise<ToolResponse> {
        const basePreflight = [
            "plugin_connection_status",
            "inspect_project_setup",
            "inspect_canvas",
        ];

        const flows: Record<string, string[]> = {
            inspect: [...basePreflight, "find_local_components", "inspect_design_tokens"],
            update: [...basePreflight, "find_local_components", "inspect_design_token_usage", "apply_instance_text_overrides"],
            build: [...basePreflight, "plan_ui_build", "confirm_structural_setup", "ensure_frame_scaffolding", "create_widget_tree"],
            tokens: [...basePreflight, "plan_design_token_system", "suggest_design_token_names", "normalize_design_token_payload", "setup_design_token_system"],
            components: [...basePreflight, "find_local_components", "create_main_component_from_shape", "instantiate_local_component_into_slot", "apply_instance_text_overrides"],
            export: [...basePreflight, "inspect_unsafe_construction_patterns", "export_to_flutter", "generate_flutter_dart", "diagnose_export_shape", "export_shape"],
            diagnose: [...basePreflight, "inspect_unsafe_construction_patterns", "inspect_design_token_usage", "diagnose_export_shape"],
        };

        const intent = args.intent ?? "build";
        const response = {
            priorityLadder: [
                {
                    priority: 1,
                    tools: ["first_tool_recommended_flow", "recommended_tool_flow", "plugin_connection_status", "inspect_project_setup", "inspect_canvas"],
                    purpose: "Recover context and confirm the plugin/page/file state before mutating anything.",
                },
                {
                    priority: 2,
                    tools: ["plan_ui_build", "confirm_structural_setup", "ensure_frame_scaffolding"],
                    purpose: "Scaffold pages, parent frames, and token setup only after an explicit plan.",
                },
                {
                    priority: 3,
                    tools: ["find_local_components", "create_main_component_from_shape", "instantiate_local_component_into_slot", "instantiate_library_component_into_slot"],
                    purpose: "Build in _Components first, then place instances on screens.",
                },
                {
                    priority: 4,
                    tools: ["apply_design_tokens_to_shape", "apply_instance_text_overrides", "inspect_design_token_usage"],
                    purpose: "Apply tokens and per-instance content safely.",
                },
                {
                    priority: 5,
                    tools: ["export_to_flutter", "generate_flutter_dart", "diagnose_export_shape", "export_shape"],
                    purpose: "Export only after the project structure is healthy.",
                },
                {
                    priority: 6,
                    tools: ["execute_code"],
                    purpose: "Advanced escape hatch for inspection, cleanup, and targeted experiments. Not a primary UI builder.",
                },
            ],
            intent,
            recommendedSequence: flows[intent],
            doNotSkip: [
                "Do not create screens before inspecting the project setup.",
                "Do not create reusable UI directly on a screen page; create it in _Components first.",
                "Do not duplicate main components just because text or data changes; use instance overrides.",
                "Do not use execute_code as the default way to build full screens.",
            ],
        };

        return new TextResponse(JSON.stringify(response, null, 2));
    }
}
