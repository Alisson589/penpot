import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";

const categoryEnum = z.enum(["color", "spacing", "radius", "typography", "sizing", "opacity", "border"]);
const namingConventionEnum = z.enum(["semantic", "scale", "hybrid"]);

export class SuggestDesignTokenNamesArgs {
    static schema = {
        category: categoryEnum.describe("Token category to suggest names for."),
        namingConvention: namingConventionEnum.describe("Preferred naming style."),
        intents: z.array(z.string().min(1)).optional().describe("Optional semantic intents such as `primary`, `muted`, `card`, `lg`."),
        count: z.number().int().min(1).max(20).optional().describe("Maximum number of suggestions to return."),
    };

    category!: z.infer<typeof categoryEnum>;
    namingConvention!: z.infer<typeof namingConventionEnum>;
    intents?: string[];
    count?: number;
}

export class SuggestDesignTokenNamesTool extends Tool<SuggestDesignTokenNamesArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, SuggestDesignTokenNamesArgs.schema);
    }

    public getToolName(): string {
        return "suggest_design_token_names";
    }

    public getToolDescription(): string {
        return "Suggests token names using semantic, scale, or hybrid conventions before token creation.";
    }

    protected async executeCore(args: SuggestDesignTokenNamesArgs): Promise<ToolResponse> {
        const suggestions = this.buildSuggestions(args.category, args.namingConvention, args.intents ?? [], args.count ?? 8);
        return new TextResponse(JSON.stringify({ category: args.category, namingConvention: args.namingConvention, suggestions }, null, 2));
    }

    private buildSuggestions(category: string, convention: string, intents: string[], count: number): string[] {
        const fallbackIntents = this.getDefaultIntents(category);
        const base = (intents.length ? intents : fallbackIntents).map((v) => v.trim()).filter(Boolean);
        const names = base.map((intent) => {
            if (convention === "scale") {
                if (category === "color") return `${intent}.500`;
                if (category === "spacing") return `space.${intent}`;
                if (category === "radius") return `radius.${intent}`;
                return `${category}.${intent}`;
            }
            if (convention === "hybrid") {
                if (category === "color") return `color.${intent}.default`;
                if (category === "typography") return `font.${intent}.md`;
                return `${category}.${intent}`;
            }
            if (category === "color") return `color.${intent}`;
            if (category === "spacing") return `spacing.${intent}`;
            if (category === "radius") return `radius.${intent}`;
            if (category === "typography") return `font.${intent}`;
            return `${category}.${intent}`;
        });
        return [...new Set(names)].slice(0, count);
    }

    private getDefaultIntents(category: string): string[] {
        switch (category) {
            case "color":
                return ["brand.primary", "text.primary", "text.muted", "surface.default", "border.subtle"];
            case "spacing":
                return ["xs", "sm", "md", "lg", "xl"];
            case "radius":
                return ["sm", "md", "lg"];
            case "typography":
                return ["size.body", "size.title", "weight.medium", "weight.bold"];
            case "sizing":
                return ["control.md", "sidebar.width", "card.max"];
            case "opacity":
                return ["disabled", "overlay"];
            default:
                return ["subtle", "default", "strong"];
        }
    }
}
