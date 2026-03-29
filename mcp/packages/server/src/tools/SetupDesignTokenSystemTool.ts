import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

const methodologyEnum = z.enum(["4pt", "8pt", "60/30/10", "custom"]);
const namingConventionEnum = z.enum(["semantic", "scale", "hybrid"]);

export class SetupDesignTokenSystemArgs {
    static schema = {
        systemName: z.string().min(1).describe("Design system name used as the theme group."),
        methodology: methodologyEnum.describe("Base system methodology."),
        namingConvention: namingConventionEnum.describe("Preferred naming style."),
        themeNames: z.array(z.string().min(1)).optional().describe("Theme names to create, defaults to `light` and `dark`."),
        includeComponentSet: z.boolean().optional().describe("When true, ensure a `Component` set as well."),
        activateTheme: z.boolean().optional().describe("When true, activate the first created theme."),
        createStarterTokens: z.boolean().optional().describe("When true, create a small starter token seed."),
    };

    systemName!: string;
    methodology!: z.infer<typeof methodologyEnum>;
    namingConvention!: z.infer<typeof namingConventionEnum>;
    themeNames?: string[];
    includeComponentSet?: boolean;
    activateTheme?: boolean;
    createStarterTokens?: boolean;
}

export class SetupDesignTokenSystemTool extends Tool<SetupDesignTokenSystemArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, SetupDesignTokenSystemArgs.schema);
    }

    public getToolName(): string {
        return "setup_design_token_system";
    }

    public getToolDescription(): string {
        return "Creates a starter Penpot token system with recommended sets, themes, and optional seed tokens, without requiring raw low-level token setup steps.";
    }

    protected async executeCore(args: SetupDesignTokenSystemArgs): Promise<ToolResponse> {
        const themeNames = args.themeNames?.length ? args.themeNames : ["light", "dark"];
        const sets = ["Core", "Semantic", ...(args.includeComponentSet ? ["Component"] : [])];
        const starterTokens = args.createStarterTokens === false ? [] : this.getStarterTokens(args.namingConvention, args.methodology);

        const code = `
const result = { sets: [], themes: [], links: [], starterTokens: [] };
const primaryThemeName = ${JSON.stringify(themeNames[0])};
for (const setName of ${JSON.stringify(sets)}) {
  result.sets.push(
    penpotUtils.ensureDesignTokenStructure({
      setName,
      activateSet: ${Boolean(args.activateTheme)}
    })
  );
}
for (const themeName of ${JSON.stringify(themeNames)}) {
  result.themes.push(
    penpotUtils.ensureDesignTokenStructure({
      themeGroup: ${JSON.stringify(args.systemName)},
      themeName,
      activateTheme: ${Boolean(args.activateTheme)} && themeName === primaryThemeName
    })
  );
  for (const setName of ${JSON.stringify(sets)}) {
    result.links.push(
      penpotUtils.ensureDesignTokenStructure({
        setName,
        themeGroup: ${JSON.stringify(args.systemName)},
        themeName,
        attachSetToTheme: true,
        activateSet: ${Boolean(args.activateTheme)} && themeName === primaryThemeName,
        activateTheme: ${Boolean(args.activateTheme)} && themeName === primaryThemeName
      })
    );
  }
}
for (const token of ${JSON.stringify(starterTokens)}) {
  result.starterTokens.push(penpotUtils.upsertDesignToken(token));
}
return result;`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);

        if (result.data !== undefined) {
            return new TextResponse(
                JSON.stringify(
                    {
                        systemName: args.systemName,
                        methodology: args.methodology,
                        namingConvention: args.namingConvention,
                        createdSets: sets,
                        createdThemes: themeNames,
                        starterTokenCount: starterTokens.length,
                        result: result.data,
                    },
                    null,
                    2
                )
            );
        }

        return new TextResponse("Design token system setup completed with no result.");
    }

    private getStarterTokens(namingConvention: string, methodology: string): Array<Record<string, unknown>> {
        const spacing = methodology === "4pt" ? "16" : "24";
        if (namingConvention === "scale") {
            return [
                { setName: "Core", type: "color", name: "blue.500", value: "#2563EB" },
                { setName: "Core", type: "spacing", name: "space.4", value: spacing },
                { setName: "Core", type: "borderRadius", name: "radius.3", value: "12" },
            ];
        }
        if (namingConvention === "hybrid") {
            return [
                { setName: "Core", type: "color", name: "color.brand.primary", value: "#2563EB" },
                { setName: "Semantic", type: "color", name: "color.text.primary", value: "#111827" },
                { setName: "Core", type: "spacing", name: "space.4", value: spacing },
            ];
        }
        return [
            { setName: "Core", type: "color", name: "color.brand.primary", value: "#2563EB" },
            { setName: "Semantic", type: "color", name: "color.text.primary", value: "#111827" },
            { setName: "Semantic", type: "spacing", name: "spacing.md", value: spacing },
        ];
    }
}
