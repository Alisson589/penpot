import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

const childLayoutSchema = z.object({
    absolute: z.boolean().optional(),
    horizontalSizing: z.enum(["fill", "auto", "fix"]).optional(),
    verticalSizing: z.enum(["fill", "auto", "fix"]).optional(),
    alignSelf: z.enum(["center", "auto", "start", "end", "stretch"]).optional(),
    horizontalMargin: z.number().optional(),
    verticalMargin: z.number().optional(),
    topMargin: z.number().optional(),
    rightMargin: z.number().optional(),
    bottomMargin: z.number().optional(),
    leftMargin: z.number().optional(),
    minWidth: z.number().nullable().optional(),
    maxWidth: z.number().nullable().optional(),
    minHeight: z.number().nullable().optional(),
    maxHeight: z.number().nullable().optional(),
});

export class PlaceComponentOnScreenArgs {
    static schema = {
        source: z.enum(["local", "library"]).describe("Whether the component comes from the local Penpot library or a connected library."),
        screenPageId: z.string().optional().describe("Optional target screen page id."),
        screenPageName: z.string().optional().describe("Optional target screen page name, for example `Screens/Home`."),
        targetShapeId: z.string().optional().describe("Id do slot/container na screen. Se ausente, usa o primeiro board da página."),
        componentId: z.string().optional().describe("Local component id for `source=local`."),
        componentName: z.string().optional().describe("Component name query. Used for both local and connected library placement."),
        componentPath: z.string().optional().describe("Component path query for local placement."),
        query: z.string().optional().describe("Library component query for `source=library`."),
        libraryId: z.string().optional().describe("Optional connected library id for `source=library`."),
        libraryName: z.string().optional().describe("Optional connected library name for `source=library`."),
        matchMode: z.enum(["exact", "prefix", "contains"]).optional().describe("Matching mode for local or library lookups."),
        requireExactMatch: z.boolean().optional().describe("Fail if the match is not exact."),
        childLayout: childLayoutSchema.optional().describe("Optional child layout to apply after docking."),
        fit: z.enum(["none", "contain", "fill-width", "fill-height", "stretch"]).optional().describe("Optional fit policy after docking."),
        inset: z.number().optional().describe("Optional inset used by the fit policy."),
    };

    source!: "local" | "library";
    screenPageId?: string;
    screenPageName?: string;
    targetShapeId?: string;
    componentId?: string;
    componentName?: string;
    componentPath?: string;
    query?: string;
    libraryId?: string;
    libraryName?: string;
    matchMode?: "exact" | "prefix" | "contains";
    requireExactMatch?: boolean;
    childLayout?: z.infer<typeof childLayoutSchema>;
    fit?: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
    inset?: number;
}

export class PlaceComponentOnScreenTool extends Tool<PlaceComponentOnScreenArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, PlaceComponentOnScreenArgs.schema);
    }

    public getToolName(): string {
        return "place_component_on_screen";
    }

    public getToolDescription(): string {
        return "Places a component instance into a slot on a chosen `Screens/*` page, using either the local Penpot library or a connected library.";
    }

    protected async executeCore(args: PlaceComponentOnScreenArgs): Promise<ToolResponse> {
        const code = `
const params = ${JSON.stringify(args)};
const page = params.screenPageId
  ? penpotUtils.getPageById(params.screenPageId)
  : (params.screenPageName ? penpotUtils.getPageByName(params.screenPageName) : penpot.currentPage);
if (!page) {
  throw new Error("Target screen page could not be resolved.");
}
penpot.openPage(page);
let targetId = params.targetShapeId;
if (!targetId) {
  const boards = penpotUtils.getPageRootChildren(page).filter(s => s.type === "board");
  if (!boards.length) {
    throw new Error("No board found on the target screen page to place the component.");
  }
  targetId = boards[0].id;
}
if (params.source === "local") {
  return penpotUtils.instantiateLocalComponentIntoSlot({
    componentId: params.componentId,
    componentName: params.componentName,
    componentPath: params.componentPath,
    matchMode: params.matchMode,
    requireExactMatch: params.requireExactMatch,
    targetShapeId: targetId,
    pageId: page.id,
    childLayout: params.childLayout,
    fit: params.fit,
    inset: params.inset,
  });
}
return penpotUtils.instantiateLibraryComponentIntoSlot({
  query: params.query ?? params.componentName,
  libraryId: params.libraryId,
  libraryName: params.libraryName,
  matchMode: params.matchMode,
  requireExactMatch: params.requireExactMatch,
  targetShapeId: targetId,
  pageId: page.id,
  childLayout: params.childLayout,
  fit: params.fit,
  inset: params.inset,
});`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
