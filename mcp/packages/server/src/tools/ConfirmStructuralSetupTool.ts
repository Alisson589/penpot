import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

const methodologyEnum = z.enum(["4pt", "8pt", "60/30/10", "custom"]);
const namingConventionEnum = z.enum(["semantic", "scale", "hybrid"]);

export class ConfirmStructuralSetupArgs {
    static schema = {
        confirmed: z.boolean().describe("Must be true; this tool mutates pages, frames, and optionally starter tokens."),
        name: z.string().min(1).describe("Base screen/widget name."),
        buildTarget: z.enum(["screen", "widget", "both"]).describe("Whether to scaffold screen frames, reusable widgets, or both."),
        devices: z.array(z.enum(["mobile", "tablet", "desktop"])).min(1).describe("Target devices for screen frames."),
        createPages: z.boolean().optional().describe("Ensure only the required structural pages. `_Components` is treated as required; `_Tokens` and `_Documentation` are optional. Defaults to true."),
        createTokens: z.boolean().optional().describe("Create starter token system if missing. Defaults to false."),
        includeTokensPage: z.boolean().optional().describe("When true, also ensure `_Tokens` page as documentation."),
        systemName: z.string().optional().describe("Design system name for starter token setup."),
        methodology: methodologyEnum.optional().describe("Starter token methodology."),
        namingConvention: namingConventionEnum.optional().describe("Starter token naming convention."),
    };
}

export class ConfirmStructuralSetupTool extends Tool<ConfirmStructuralSetupArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, ConfirmStructuralSetupArgs.schema);
    }

    public getToolName(): string {
        return "confirm_structural_setup";
    }

    public getToolDescription(): string {
        return (
            "PRIORITY 2. Runs the confirmed structural setup for a new UI build: creates only the required pages, parent frames, and optionally a starter token system. " +
            "This should only be called after explicit user confirmation."
        );
    }

    protected async executeCore(args: ConfirmStructuralSetupArgs): Promise<ToolResponse> {
        const createPages = args.createPages !== false;
        const createTokens = args.createTokens === true;
        const themeNames = ["light", "dark"];
        const systemName = args.systemName ?? `${args.name} DS`;
        const methodology = args.methodology ?? "8pt";
        const namingConvention = args.namingConvention ?? "semantic";
        const screenPageName = `Screens/${args.name}`;

        const code = `
if (!${Boolean(args.confirmed)}) {
  throw new Error("Structural setup requires explicit confirmation.");
}
const result = {};
if (${createPages}) {
  result.pages = penpotUtils.ensurePageStructure({
    includeTokens: ${Boolean(args.includeTokensPage)},
    includeComponents: true,
    includeDocumentation: false,
    screens: ${args.buildTarget === "screen" || args.buildTarget === "both" ? JSON.stringify([screenPageName]) : "[]"},
  });
  result.frames = penpotUtils.ensureFrameScaffolding({
    name: ${JSON.stringify(args.name)},
    buildTarget: ${JSON.stringify(args.buildTarget)},
    devices: ${JSON.stringify(args.devices)},
    screenPageName: ${JSON.stringify(screenPageName)},
    componentsPageName: "_Components",
    confirmed: true,
  });
}
if (${createTokens}) {
  const setup = { sets: [], themes: [], links: [], starterTokens: [] };
  const setNames = ["Core", "Semantic", "Component"];
  for (const setName of setNames) {
    setup.sets.push(penpotUtils.ensureDesignTokenStructure({ setName, activateSet: false }));
  }
  for (const themeName of ${JSON.stringify(themeNames)}) {
    setup.themes.push(penpotUtils.ensureDesignTokenStructure({
      themeGroup: ${JSON.stringify(systemName)},
      themeName,
      activateTheme: themeName === "light"
    }));
    for (const setName of setNames) {
      setup.links.push(penpotUtils.ensureDesignTokenStructure({
        setName,
        themeGroup: ${JSON.stringify(systemName)},
        themeName,
        attachSetToTheme: true,
        activateTheme: themeName === "light",
      }));
    }
  }
  const starterTokens = ${JSON.stringify(this.getStarterTokens(namingConvention, methodology))};
  for (const token of starterTokens) {
    setup.starterTokens.push(penpotUtils.upsertDesignToken(token));
  }
  setup.designSystem = penpotUtils.setDesignSystemMetadata({
    name: ${JSON.stringify(systemName)},
    namingConvention: ${JSON.stringify(namingConvention)},
    scaleType: ${JSON.stringify(methodology)},
    theme: "light",
    set: "Semantic",
    setNames: setNames,
    themeNames: ${JSON.stringify(themeNames)}
  });
  result.tokens = setup;
}
return result;`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        if (result.data !== undefined) {
            return new TextResponse(JSON.stringify(result.data, null, 2));
        }
        return new TextResponse("Structural setup completed with no result.");
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
