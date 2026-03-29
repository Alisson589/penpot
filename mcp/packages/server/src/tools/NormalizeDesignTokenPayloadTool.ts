import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";

const tokenTypeEnum = z.enum([
    "color",
    "dimension",
    "spacing",
    "typography",
    "shadow",
    "opacity",
    "borderRadius",
    "borderWidth",
    "fontWeights",
    "fontSizes",
    "fontFamilies",
    "letterSpacing",
    "number",
    "rotation",
    "sizing",
    "textDecoration",
    "textCase",
]);

export class NormalizeDesignTokenPayloadArgs {
    static schema = {
        setName: z.string().min(1).optional().describe("Optional token set name."),
        type: tokenTypeEnum.describe("Penpot token type."),
        name: z.string().min(1).describe("Token name."),
        value: z.any().describe("Loose token value to normalize before upsert."),
        description: z.string().optional().describe("Optional token description."),
        activateSet: z.boolean().optional().describe("Whether the caller intends to activate the set."),
    };

    setName?: string;
    type!: z.infer<typeof tokenTypeEnum>;
    name!: string;
    value!: unknown;
    description?: string;
    activateSet?: boolean;
}

export class NormalizeDesignTokenPayloadTool extends Tool<NormalizeDesignTokenPayloadArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, NormalizeDesignTokenPayloadArgs.schema);
    }

    public getToolName(): string {
        return "normalize_design_token_payload";
    }

    public getToolDescription(): string {
        return "Normalizes a loose token payload into the shape expected by upsert_design_token and Penpot token storage.";
    }

    protected async executeCore(args: NormalizeDesignTokenPayloadArgs): Promise<ToolResponse> {
        const normalizedValue = this.normalizeValue(args.type, args.value);
        const warnings: string[] = [];

        if (args.type === "shadow") {
            warnings.push("Shadow tokens are still not supported via MCP. Do not pass this payload to upsert_design_token yet.");
        }

        return new TextResponse(
            JSON.stringify(
                {
                    normalizedPayload: {
                        setName: args.setName,
                        type: args.type,
                        name: args.name,
                        value: normalizedValue,
                        description: args.description,
                        activateSet: args.activateSet,
                    },
                    warnings,
                },
                null,
                2
            )
        );
    }

    private normalizeValue(type: string, value: unknown): unknown {
        if (["spacing", "borderRadius", "fontSizes", "dimension", "borderWidth", "letterSpacing", "opacity", "rotation", "sizing"].includes(type)) {
            if (typeof value === "number") return String(value);
        }
        if (type === "fontFamilies" && typeof value === "string") {
            return [value];
        }
        if (type === "fontWeights" && typeof value === "string") {
            const mapped: Record<string, string> = {
                regular: "400",
                medium: "500",
                semibold: "600",
                bold: "700",
                black: "900",
                heavy: "900",
            };
            return mapped[value.toLowerCase()] ?? value;
        }
        return value;
    }
}
