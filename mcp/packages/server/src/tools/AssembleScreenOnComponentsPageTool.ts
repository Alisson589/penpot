import { z } from "zod";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

export class AssembleScreenOnComponentsPageArgs {
    static schema = {
        screenName: z.string().min(1).describe("Screen name, e.g. `Dashboard` or `LandingPage`."),
        device: z.enum(["mobile", "tablet", "desktop"]).describe("Target device for the screen board dimensions."),
        offsetY: z.number().optional().describe("Y offset to place the screen board far from components. Default: 5000."),
        components: z.array(z.string()).optional().describe("List of local component names to instantiate inside the screen board."),
        root: z.any().optional().describe("Optional widget-tree definition to build inside the screen board instead of (or before) placing components."),
    };

    screenName!: string;
    device!: "mobile" | "tablet" | "desktop";
    offsetY?: number;
    components?: string[];
    root?: unknown;
}

export class AssembleScreenOnComponentsPageTool extends Tool<AssembleScreenOnComponentsPageArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, AssembleScreenOnComponentsPageArgs.schema);
    }

    public getToolName(): string {
        return "assemble_screen_on_components_page";
    }

    public getToolDescription(): string {
        return (
            "Creates a screen board directly on the `_Components` page with a large Y offset (default 5000) " +
            "to avoid mixing with main components. This bypasses cross-page instability by keeping everything " +
            "on the same page during assembly. Components can be instantiated into the board. " +
            "After assembly, the user should manually copy the board to a `Screens/*` page and then delete it from `_Components`."
        );
    }

    protected async executeCore(args: AssembleScreenOnComponentsPageArgs): Promise<ToolResponse> {
        const providedOffsetY = args.offsetY ?? null;
        const deviceSpec = args.device === "mobile"
            ? { width: 360, height: 800, suffix: "Mobile" }
            : args.device === "tablet"
                ? { width: 768, height: 1024, suffix: "Tablet" }
                : { width: 1440, height: 900, suffix: "Desktop" };

        const code = `
const params = ${JSON.stringify(args)};
const providedOffsetY = ${providedOffsetY};
const deviceSpec = ${JSON.stringify(deviceSpec)};

// 1. Navigate to _Components page
const componentsPage = penpotUtils.getPageByName("_Components");
if (!componentsPage) {
    throw new Error("Page '_Components' not found. Run ensure_page_structure first.");
}
penpot.openPage(componentsPage);

// Calculate dynamic offset if not provided
let offsetY = providedOffsetY;
if (offsetY === null) {
    const children = Array.from(componentsPage.root.children || []);
    let maxY = 0;
    for (const child of children) {
        if (child.y !== undefined && (child.height !== undefined || child.bounds?.height !== undefined)) {
             const bottom = child.y + (child.height || child.bounds.height);
             if (bottom > maxY) maxY = bottom;
        }
    }
    offsetY = maxY + 2000; // Place well below all existing components
}

// 2. Create the screen board at the offset
const screenBoard = penpot.createBoard();
screenBoard.name = params.screenName + "/" + deviceSpec.suffix;
screenBoard.x = 120;
screenBoard.y = offsetY;
screenBoard.resize(deviceSpec.width, deviceSpec.height);
screenBoard.fills = [{ fillColor: "#FFFFFF", fillOpacity: 1 }];
componentsPage.root.appendChild(screenBoard);

// 3. Add flex layout to the screen board
const layout = screenBoard.addFlexLayout();
layout.dir = "column";
layout.rowGap = 0;
layout.columnGap = 0;
layout.alignItems = "start";
layout.justifyContent = "start";

// 4. Optionally build a widget tree inside
if (params.root) {
    penpotUtils.createWidgetTree(params.root, componentsPage.id);
}

// 5. Optionally instantiate components
const placedComponents = [];
if (params.components && params.components.length > 0) {
    for (const componentName of params.components) {
        try {
            const result = penpotUtils.instantiateLocalComponentIntoSlot({
                componentName: componentName,
                matchMode: "contains",
                targetShapeId: screenBoard.id,
                pageId: componentsPage.id,
            });
            placedComponents.push({ name: componentName, success: true, data: result });
        } catch (e) {
            placedComponents.push({ name: componentName, success: false, error: String(e) });
        }
    }
}

return {
    screenBoardId: screenBoard.id,
    screenBoardName: screenBoard.name,
    pageId: componentsPage.id,
    pageName: componentsPage.name,
    device: params.device,
    offsetY: offsetY,
    dimensions: { width: deviceSpec.width, height: deviceSpec.height },
    placedComponents: placedComponents,
    nextStep: "Review the screen board in _Components. When satisfied, manually copy the board to a Screens/* page and delete it from _Components.",
};`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        return new TextResponse(JSON.stringify(result.data ?? null, null, 2));
    }
}
