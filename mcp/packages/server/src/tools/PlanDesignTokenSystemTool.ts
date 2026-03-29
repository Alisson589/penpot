import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";

const methodologyEnum = z.enum(["4pt", "8pt", "60/30/10", "custom"]);
const namingConventionEnum = z.enum(["semantic", "scale", "hybrid"]);

type NamingConvention = z.infer<typeof namingConventionEnum>;
type Methodology = z.infer<typeof methodologyEnum>;

export class PlanDesignTokenSystemArgs {
    static schema = {
        systemName: z.string().min(1).describe("Human-readable design system name."),
        methodology: methodologyEnum.describe("Base system methodology, for example `8pt` or `60/30/10`."),
        namingConvention: namingConventionEnum.describe("Preferred naming style for tokens."),
        themeNames: z.array(z.string().min(1)).optional().describe("Theme names to support, for example `light`, `dark`."),
        includeComponentSet: z.boolean().optional().describe("When true, include a component-level token set in the plan."),
    };

    systemName!: string;
    methodology!: Methodology;
    namingConvention!: NamingConvention;
    themeNames?: string[];
    includeComponentSet?: boolean;
}

export class PlanDesignTokenSystemTool extends Tool<PlanDesignTokenSystemArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, PlanDesignTokenSystemArgs.schema);
    }

    public getToolName(): string {
        return "plan_design_token_system";
    }

    public getToolDescription(): string {
        return "Plans a token-first design system for Penpot before UI creation, returning recommended sets, themes, naming patterns, and starter tokens.";
    }

    protected async executeCore(args: PlanDesignTokenSystemArgs): Promise<ToolResponse> {
        const themeNames = args.themeNames?.length ? args.themeNames : ["light", "dark"];
        const scale = this.getScale(args.methodology);
        const plan = {
            systemName: args.systemName,
            methodology: args.methodology,
            namingConvention: args.namingConvention,
            recommendedSets: this.getRecommendedSets(Boolean(args.includeComponentSet)),
            themes: {
                group: args.systemName,
                names: themeNames,
            },
            spacingScale: scale,
            namingExamples: this.getNamingExamples(args.namingConvention),
            starterTokens: this.getStarterTokens(args.namingConvention, args.methodology),
            nextSteps: [
                "Run setup_design_token_system to create the initial set/theme structure in Penpot.",
                "Use suggest_design_token_names before bulk token creation when names are still undecided.",
                "Use normalize_design_token_payload before upsert_design_token when values come from a loose prompt or external source.",
            ],
        };

        return new TextResponse(JSON.stringify(plan, null, 2));
    }

    private getRecommendedSets(includeComponentSet: boolean): string[] {
        return ["Core", "Semantic", ...(includeComponentSet ? ["Component"] : [])];
    }

    private getScale(methodology: Methodology): number[] | null {
        if (methodology === "4pt") return [4, 8, 12, 16, 20, 24, 32, 40];
        if (methodology === "8pt") return [4, 8, 12, 16, 24, 32, 40, 48];
        return null;
    }

    private getNamingExamples(namingConvention: NamingConvention): Record<string, string[]> {
        if (namingConvention === "scale") {
            return {
                color: ["blue.500", "slate.900"],
                spacing: ["space.4", "space.8"],
                radius: ["radius.8", "radius.12"],
            };
        }
        if (namingConvention === "hybrid") {
            return {
                color: ["color.brand.primary", "color.surface.default"],
                spacing: ["space.4", "space.8"],
                typography: ["font.size.body.md", "font.weight.title"],
            };
        }
        return {
            color: ["color.text.primary", "color.surface.default", "color.border.subtle"],
            spacing: ["spacing.sm", "spacing.md", "spacing.lg"],
            typography: ["font.size.title", "font.size.body", "font.weight.bold"],
        };
    }

    private getStarterTokens(namingConvention: NamingConvention, methodology: Methodology): Array<{ setName: string; type: string; name: string; value: unknown }> {
        const spacing = methodology === "4pt" ? 16 : 24;
        if (namingConvention === "scale") {
            return [
                { setName: "Core", type: "color", name: "blue.500", value: "#2563EB" },
                { setName: "Core", type: "spacing", name: "space.4", value: "16" },
                { setName: "Core", type: "borderRadius", name: "radius.3", value: "12" },
            ];
        }
        if (namingConvention === "hybrid") {
            return [
                { setName: "Core", type: "color", name: "color.brand.primary", value: "#2563EB" },
                { setName: "Semantic", type: "color", name: "color.text.primary", value: "#111827" },
                { setName: "Core", type: "spacing", name: "space.4", value: String(spacing) },
            ];
        }
        return [
            { setName: "Core", type: "color", name: "color.brand.primary", value: "#2563EB" },
            { setName: "Semantic", type: "color", name: "color.text.primary", value: "#111827" },
            { setName: "Semantic", type: "spacing", name: "spacing.md", value: String(spacing) },
        ];
    }
}
