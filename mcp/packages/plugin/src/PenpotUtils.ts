import { Board, Bounds, Fill, FlexLayout, GridLayout, Page, Rectangle, Shape, Text } from "@penpot/plugin-types";

type WidgetBreakpointKey = "compact" | "medium" | "expanded";
type WidgetLayoutKind = "stack" | "row" | "column" | "grid";

type WidgetPadding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

type WidgetLayoutSpec = {
    kind: WidgetLayoutKind;
    width?: number | "fill" | "hug";
    height?: number | "fill" | "hug";
    gap?: number;
    padding?: number | WidgetPadding;
    align?: "start" | "end" | "center" | "stretch";
    crossAlign?: "start" | "end" | "center" | "stretch";
    justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" | "stretch";
    wrap?: "wrap" | "nowrap";
    maxWidth?: number;
    maxHeight?: number;
    columns?: number;
};

type WidgetResponsiveOverride = {
    layout?: Partial<WidgetLayoutSpec>;
    visible?: boolean;
    slotOrder?: string[];
};

type WidgetResponsiveSpec = Partial<Record<WidgetBreakpointKey, WidgetResponsiveOverride>>;

type WidgetChildLayoutSpec = {
    absolute?: boolean;
    horizontalSizing?: "fill" | "auto" | "fix";
    verticalSizing?: "fill" | "auto" | "fix";
    alignSelf?: "center" | "auto" | "start" | "end" | "stretch";
    horizontalMargin?: number;
    verticalMargin?: number;
    topMargin?: number;
    rightMargin?: number;
    bottomMargin?: number;
    leftMargin?: number;
    minWidth?: number | null;
    maxWidth?: number | null;
    minHeight?: number | null;
    maxHeight?: number | null;
};

type WidgetSpacingSystem = {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
};

type WidgetNode = {
    id?: string;
    type: string;
    name?: string;
    role?: string;
    slot?: string;
    props?: Record<string, any>;
    tokens?: Record<string, string>;
    layout?: WidgetLayoutSpec;
    childLayout?: WidgetChildLayoutSpec;
    responsive?: WidgetResponsiveSpec;
    style?: {
        fills?: Fill[];
        radius?: number;
        shadows?: Array<Record<string, any>>;
    };
    slots?: Record<string, string>;
    children?: WidgetNode[];
};

type WidgetTreeNodeResult = {
    id: string;
    type: string;
    name: string;
    childIds: string[];
};

type WidgetTreeResult = {
    root: WidgetTreeNodeResult;
    nodes: WidgetTreeNodeResult[];
};

type FlutterExportSpacingIntent = {
    gap?: number;
    padding?: number | WidgetPadding;
    margin?: number | WidgetPadding;
};

type FlutterExportLayoutIntent = {
    kind: "stack" | "row" | "column" | "grid" | "component";
    width?: number | "fill" | "hug";
    height?: number | "fill" | "hug";
    align?: "start" | "end" | "center" | "stretch";
    crossAlign?: "start" | "end" | "center" | "stretch";
    justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" | "stretch";
    wrap?: "wrap" | "nowrap";
    columns?: number;
};

type FlutterExportNode = {
    widgetId: string;
    semanticId?: string;
    sequenceId?: number;
    widgetType: string;
    role?: string;
    displayName: string;
    sourceShapeId: string;
    parentWidgetId?: string;
    slot?: string;
    sourceLibrary?: string;
    sourceComponentId?: string;
    sourceComponentName?: string;
    sourceComponentPath?: string | null;
    layoutIntent?: FlutterExportLayoutIntent;
    spacingIntent?: FlutterExportSpacingIntent;
    props?: Record<string, unknown>;
    tokens?: Record<string, string>;
    children: FlutterExportNode[];
};

type BuildTargetKind = "screen" | "widget" | "both";
type DeviceKind = "mobile" | "tablet" | "desktop";

type DesignSystemMetadata = {
    name: string;
    namingConvention: "semantic" | "scale" | "hybrid";
    scaleType: "4pt" | "8pt" | "60/30/10" | "custom";
    theme?: string;
    set?: string;
    setNames?: string[];
    themeNames?: string[];
};

type FlutterExportTree = {
    designSystem?: DesignSystemMetadata;
    root: FlutterExportNode;
    nodes: FlutterExportNode[];
};

type LibraryComponentSummary = {
    libraryId: string;
    libraryName: string;
    componentId: string;
    componentName: string;
    componentPath: string | null;
    isVariant: boolean;
    variantProps: Record<string, string> | null;
    matchConfidence?: number;
    exactMatch?: boolean;
};

type InstantiateLibraryComponentParams = {
    libraryName?: string;
    componentNameContains?: string;
    componentPathContains?: string;
    matchMode?: "exact" | "prefix" | "contains" | "fuzzy";
    requireExactMatch?: boolean;
    targetShapeId?: string;
    x?: number;
    y?: number;
    pageId?: string;
    detach?: boolean;
    childLayout?: WidgetChildLayoutSpec;
};

type CreateMainComponentParams = {
    shapeId: string;
    componentName?: string;
    componentPageName?: string;
    leaveInstanceOnSourcePage?: boolean;
};

type DockShapeIntoContainerParams = {
    shapeId: string;
    targetShapeId: string;
    childLayout?: WidgetChildLayoutSpec;
    fit?: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
    inset?: number;
};

type InstantiateLocalComponentIntoSlotParams = {
    componentId?: string;
    componentName?: string;
    componentPath?: string;
    matchMode?: "exact" | "prefix" | "contains";
    requireExactMatch?: boolean;
    targetShapeId: string;
    pageId?: string;
    childLayout?: WidgetChildLayoutSpec;
    fit?: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
    inset?: number;
};

type ApplyInstanceTextOverridesParams = {
    instanceShapeId: string;
    pageId?: string;
    overrides: Array<{
        layerName: string;
        text: string;
    }>;
};

const DEFAULT_WIDGET_SPACING_SYSTEM: WidgetSpacingSystem = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export class PenpotUtils {
    private static readonly WIDGET_PLUGIN_PREFIX = "mcp.widget";
    private static readonly WIDGET_SEQUENCE_KEY = `${PenpotUtils.WIDGET_PLUGIN_PREFIX}.sequence`;
    private static readonly DESIGN_SYSTEM_PLUGIN_PREFIX = "mcp.designSystem";
    private static readonly COMPONENT_CATEGORY_ORDER = [
        "TOKENS/STYLES",
        "BUTTONS",
        "FORMS",
        "HEADER",
        "NAVIGATION",
        "SEARCH",
        "MEMBERS",
        "USERS",
        "CARDS",
        "FEEDBACK",
        "OVERLAYS",
        "MISC",
    ] as const;

    private static normalizeTokenProperties(properties: string[] | undefined): string[] | undefined {
        if (!properties || properties.length === 0) {
            return undefined;
        }

        const expanded = properties.flatMap((property) => {
            switch (property) {
                case "borderRadius":
                case "radius":
                    return [
                        "borderRadiusTopLeft",
                        "borderRadiusTopRight",
                        "borderRadiusBottomRight",
                        "borderRadiusBottomLeft",
                    ];
                case "fontFamilies":
                case "fontFamily":
                    return ["fontFamilies"];
                case "fontSizes":
                    return ["fontSize"];
                case "fontWeights":
                    return ["fontWeight"];
                case "spacing":
                case "gap":
                    return ["rowGap", "columnGap"];
                default:
                    return [property];
            }
        });

        return Array.from(new Set(expanded));
    }

    /**
     * Generates an overview structure of the given shape,
     * providing its id, name and type, and recursively its children's attributes.
     * The `type` field indicates the type in the Penpot API.
     * If the shape has a layout system (flex or grid), includes layout information.
     *
     * @param shape - The root shape to generate the structure from
     * @param maxDepth - Optional maximum depth to traverse (leave undefined for unlimited)
     * @returns An object representing the shape structure
     */
    public static shapeStructure(shape: Shape, maxDepth: number | undefined = undefined): object {
        let children = undefined;
        if (maxDepth === undefined || maxDepth > 0) {
            if ("children" in shape && shape.children) {
                children = shape.children.map((child) =>
                    this.shapeStructure(child, maxDepth === undefined ? undefined : maxDepth - 1)
                );
            }
        }

        const result: any = {
            id: shape.id,
            name: shape.name,
            type: shape.type,
        };

        // add layout information if present
        if ("flex" in shape && shape.flex) {
            const flex: FlexLayout = shape.flex;
            result.layout = {
                type: "flex",
                dir: flex.dir,
                rowGap: flex.rowGap,
                columnGap: flex.columnGap,
            };
        } else if ("grid" in shape && shape.grid) {
            const grid: GridLayout = shape.grid;
            result.layout = {
                type: "grid",
                rows: grid.rows,
                columns: grid.columns,
                rowGap: grid.rowGap,
                columnGap: grid.columnGap,
            };
        }

        // add component instance information if present
        if (shape.isComponentInstance()) {
            result.componentInstance = {};
            const component = shape.component();
            if (component) {
                result.componentInstance.componentId = component.id;
                result.componentInstance.componentName = component.name;
                const mainInstance = component.mainInstance();
                if (mainInstance) {
                    result.componentInstance.mainInstanceId = mainInstance.id;
                }
            }
        }

        // finally, add children (last for more readable nesting order)
        result.children = children;

        return result;
    }

    /**
     * Finds all shapes that matches the given predicate in the given shape tree.
     *
     * @param predicate - A function that takes a shape and returns true if it matches the criteria
     * @param root - The root shape to start the search from (if null, searches all pages)
     */
    public static findShapes(predicate: (shape: Shape) => boolean, root: Shape | null = null): Shape[] {
        let result = new Array<Shape>();

        let find = function (shape: Shape | null) {
            if (!shape) {
                return;
            }
            if (predicate(shape)) {
                result.push(shape);
            }
            if ("children" in shape && shape.children) {
                for (let child of shape.children) {
                    find(child);
                }
            }
        };

        if (root === null) {
            const pages = penpot.currentFile?.pages;
            if (pages) {
                for (let page of pages) {
                    find(page.root);
                }
            }
        } else {
            find(root);
        }
        return result;
    }

    /**
     * Finds the first shape that matches the given predicate in the given shape tree.
     *
     * @param predicate - A function that takes a shape and returns true if it matches the criteria
     * @param root - The root shape to start the search from (if null, searches all pages)
     */
    public static findShape(predicate: (shape: Shape) => boolean, root: Shape | null = null): Shape | null {
        let find = function (shape: Shape | null): Shape | null {
            if (!shape) {
                return null;
            }
            if (predicate(shape)) {
                return shape;
            }
            if ("children" in shape && shape.children) {
                for (let child of shape.children) {
                    let result = find(child);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        };

        if (root === null) {
            const pages = penpot.currentFile?.pages;
            if (pages) {
                for (let page of pages) {
                    let result = find(page.root);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        } else {
            return find(root);
        }
    }

    /**
     * Finds a shape by its unique ID.
     *
     * @param id - The unique ID of the shape to find
     * @returns The shape with the matching ID, or null if not found
     */
    public static findShapeById(id: string): Shape | null {
        return this.findShape((shape) => shape.id === id);
    }

    public static findPage(predicate: (page: Page) => boolean): Page | null {
        let page = penpot.currentFile!.pages.find(predicate);
        return page || null;
    }

    public static getPages(): { id: string; name: string; plainName: string; sequenceId: number | null }[] {
        return penpot.currentFile!.pages.map((page) => ({
            id: page.id,
            name: page.name,
            plainName: this.getPlainPageName(page.name),
            sequenceId: this.parsePageSequence(page.name),
        }));
    }

    public static getPageById(id: string): Page | null {
        return this.findPage((page) => page.id === id);
    }

    public static getPageByName(name: string): Page | null {
        const wanted = this.getPlainPageName(name).toLowerCase();
        return this.findPage((page) => this.getPlainPageName(page.name).toLowerCase() === wanted);
    }

    public static ensurePageStructure(options?: {
        includeTokens?: boolean;
        includeComponents?: boolean;
        includeDocumentation?: boolean;
        screens?: string[];
        openPageName?: string;
    }): {
        pages: { id: string; name: string; created: boolean }[];
        activePage: { id: string; name: string } | null;
    } {
        const wantedPages: string[] = [];

        if (options?.includeTokens === true) {
            wantedPages.push("_Tokens");
        }
        if (options?.includeComponents === true) {
            wantedPages.push("_Components");
        }
        if (options?.includeDocumentation === true) {
            wantedPages.push("_Documentation");
        }

        for (const screen of options?.screens ?? []) {
            const trimmed = screen.trim();
            if (!trimmed) {
                continue;
            }
            wantedPages.push(trimmed.startsWith("Screens/") ? trimmed : `Screens/${trimmed}`);
        }

        const uniquePageNames = [...new Set(wantedPages)];
        const ensuredPages = uniquePageNames.map((pageName) => {
            const existing = this.getPageByName(pageName);
            if (existing) {
                const existingSequence = this.parsePageSequence(existing.name);
                if (existingSequence === null) {
                    existing.name = this.ensurePageDisplayName(pageName, this.allocateNextPageSequence());
                }
                return { page: existing, created: false };
            }

            const page = penpot.createPage();
            page.name = this.ensurePageDisplayName(pageName, this.allocateNextPageSequence());
            return { page, created: true };
        });

        let activePage: Page | null = penpot.currentPage ?? null;
        if (options?.openPageName) {
            const pageToOpen = this.getPageByName(options.openPageName);
            if (pageToOpen) {
                penpot.openPage(pageToOpen);
                activePage = pageToOpen;
            }
        }

        return {
            pages: ensuredPages.map(({ page, created }) => ({
                id: page.id,
                name: page.name,
                created,
            })),
            activePage: activePage ? { id: activePage.id, name: activePage.name } : null,
        };
    }

    public static inspectProjectSetup(options?: {
        pageId?: string;
        preferredScreenName?: string;
        preferredComponentName?: string;
    }): {
        file: { id: string; name: string } | null;
        page: { id: string; name: string } | null;
        pages: Array<{ id: string; name: string }>;
        structures: {
            hasTokensPage: boolean;
            hasComponentsPage: boolean;
            hasDocumentationPage: boolean;
            hasScreensPages: boolean;
            matchingScreenPage?: { id: string; name: string } | null;
            matchingComponentPage?: { id: string; name: string } | null;
        };
        tokenCatalog: {
            hasTokens: boolean;
            setCount: number;
            themeCount: number;
            activeThemeNames: string[];
            setNames: string[];
        };
        libraries: Array<{
            id: string;
            name: string;
            kind: "local" | "connected";
            componentCount: number;
        }>;
        localComponents: Array<{
            componentId: string;
            componentName: string;
            componentPath: string | null;
            mainInstanceId: string | null;
            variantProps: Record<string, string> | null;
        }>;
        selection: Array<{ id: string; name: string; type: string }>;
    } {
        const currentPage = options?.pageId ? this.getPageById(options.pageId) : penpot.currentPage;
        const pages = this.getPages();
        const findByName = (predicate: (normalized: string) => boolean) =>
            penpot.currentFile?.pages.find((entry) => predicate(this.getPlainPageName(entry.name).trim().toLowerCase())) ?? null;
        const hasPageName = (value: string) => !!this.getPageByName(value);
        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;
        const preferredScreenPage = options?.preferredScreenName
            ? this.getPageByName(options.preferredScreenName) ??
              this.getPageByName(`Screens/${options.preferredScreenName}`)
            : null;
        const preferredComponentPage = options?.preferredComponentName
            ? this.getPageByName(options.preferredComponentName)
            : null;

        return {
            file: penpot.currentFile ? { id: penpot.currentFile.id, name: penpot.currentFile.name } : null,
            page: currentPage ? { id: currentPage.id, name: currentPage.name } : null,
            pages,
            structures: {
                hasTokensPage:
                    hasPageName("_Tokens") ||
                    !!findByName((name) => name === "tokens" || name === "design tokens" || name === "styles"),
                hasComponentsPage:
                    hasPageName("_Components") ||
                    !!findByName((name) => name === "components" || name === "widgets" || name === "ui kit"),
                hasDocumentationPage: hasPageName("_Documentation"),
                hasScreensPages:
                    penpot.currentFile?.pages.some((entry) => this.getPlainPageName(entry.name).startsWith("Screens/")) ?? false,
                matchingScreenPage: preferredScreenPage ? { id: preferredScreenPage.id, name: preferredScreenPage.name } : null,
                matchingComponentPage: preferredComponentPage
                    ? { id: preferredComponentPage.id, name: preferredComponentPage.name }
                    : null,
            },
            tokenCatalog: {
                hasTokens: tokenCatalog.sets.some((set: any) => set.tokens.length > 0),
                setCount: tokenCatalog.sets.length,
                themeCount: tokenCatalog.themes.length,
                activeThemeNames: tokenCatalog.themes.filter((theme: any) => theme.active).map((theme: any) => theme.name),
                setNames: tokenCatalog.sets.map((set: any) => set.name),
            },
            libraries: [penpot.library.local, ...penpot.library.connected].map((library, index) => ({
                id: library.id,
                name: library.name,
                kind: index === 0 ? ("local" as const) : ("connected" as const),
                componentCount: library.components.length,
            })),
            localComponents: this.listLocalComponents({ limit: 100 }).map((component) => ({
                componentId: component.componentId,
                componentName: component.componentName,
                componentPath: component.componentPath,
                mainInstanceId: component.mainInstanceId,
                variantProps: component.variantProps,
            })),
            selection: penpot.selection.map((shape) => ({
                id: shape.id,
                name: shape.name,
                type: shape.type,
            })),
        };
    }

    public static planUiBuild(params: {
        buildTarget: BuildTargetKind;
        name: string;
        devices: DeviceKind[];
        createTokensIfMissing?: boolean;
        createPagesIfMissing?: boolean;
        hasReference?: boolean;
    }): {
        buildTarget: BuildTargetKind;
        name: string;
        devices: DeviceKind[];
        pagesToCreate: string[];
        framesToCreate: Array<{ pageName: string; frameName: string; width: number; height: number; kind: DeviceKind | "component" }>;
        missing: {
            tokens: boolean;
            pages: boolean;
        };
        requiresConfirmation: Array<"tokens" | "pages" | "frames">;
        nextSteps: string[];
    } {
        const setup = this.inspectProjectSetup({
            preferredScreenName: `Screens/${params.name}`,
            preferredComponentName: params.name,
        });
        const pagesToCreate: string[] = [];
        const framesToCreate: Array<{ pageName: string; frameName: string; width: number; height: number; kind: DeviceKind | "component" }> = [];
        const requiresConfirmation = new Set<"tokens" | "pages" | "frames">();

        const wantsScreens = params.buildTarget === "screen" || params.buildTarget === "both";
        const wantsComponents = params.buildTarget === "widget" || params.buildTarget === "both";

        if (wantsScreens && !setup.structures.matchingScreenPage) {
            pagesToCreate.push(`Screens/${params.name}`);
            requiresConfirmation.add("pages");
        }
        if (!setup.structures.hasComponentsPage) {
            pagesToCreate.push("_Components");
            requiresConfirmation.add("pages");
        }

        if (!setup.tokenCatalog.hasTokens && params.createTokensIfMissing !== false) {
            requiresConfirmation.add("tokens");
        }

        if (wantsScreens) {
            for (const device of params.devices) {
                const spec =
                    device === "mobile"
                        ? { width: 360, height: 800, suffix: "Mobile" }
                        : device === "tablet"
                          ? { width: 768, height: 1024, suffix: "Tablet" }
                          : { width: 1440, height: 900, suffix: "Desktop" };
                framesToCreate.push({
                    pageName: `Screens/${params.name}`,
                    frameName: `${params.name}/${spec.suffix}`,
                    width: spec.width,
                    height: spec.height,
                    kind: device,
                });
            }
            requiresConfirmation.add("frames");
        }

        if (wantsComponents) {
            framesToCreate.push({
                pageName: "_Components",
                frameName: params.name,
                width: 320,
                height: 180,
                kind: "component",
            });
            requiresConfirmation.add("frames");
        }

        return {
            buildTarget: params.buildTarget,
            name: params.name,
            devices: params.devices,
            pagesToCreate,
            framesToCreate,
            missing: {
                tokens: !setup.tokenCatalog.hasTokens,
                pages: (wantsScreens && !setup.structures.matchingScreenPage) || !setup.structures.hasComponentsPage,
            },
            requiresConfirmation: [...requiresConfirmation],
            nextSteps: [
                "Inspect the current project setup before mutating.",
                "Ask for explicit confirmation before creating missing pages, tokens, or frames.",
                "Create parent frames first, then build reusable components in _Components.",
                "Promote finished _Components frames into local library components before using them in screens.",
                "Use instances with overrides on screens instead of duplicating components by content.",
                params.hasReference
                    ? "Use the provided reference to guide structure and component choice."
                    : "Propose structure conservatively, preferring library components when available.",
            ],
        };
    }

    public static ensureFrameScaffolding(params: {
        name: string;
        buildTarget: BuildTargetKind;
        devices: DeviceKind[];
        screenPageName?: string;
        componentsPageName?: string;
        confirmed: boolean;
    }): {
        pages: Array<{ id: string; name: string; created: boolean }>;
        frames: Array<{ id: string; name: string; pageId: string; pageName: string; created: boolean }>;
    } {
        if (!params.confirmed) {
            throw new Error("Frame scaffolding requires explicit confirmation.");
        }

        const screenPageName = params.screenPageName ?? `Screens/${params.name}`;
        const componentsPageName = params.componentsPageName ?? "_Components";
        const pageEnsure = this.ensurePageStructure({
            includeTokens: false,
            includeDocumentation: false,
            includeComponents: true,
            screens: params.buildTarget === "screen" || params.buildTarget === "both" ? [screenPageName] : [],
        });

        const frames: Array<{ id: string; name: string; pageId: string; pageName: string; created: boolean }> = [];
        const ensureBoard = (pageName: string, boardName: string, width: number, height: number, hug = false) => {
            const page = this.getPageByName(pageName);
            if (!page) {
                throw new Error(`Page not found while creating scaffolding: ${pageName}`);
            }
            penpot.openPage(page);
            const board =
                this.findShape(
                    (shape) => shape.type === "board" && this.getPlainWidgetName(shape.name || "") === boardName,
                    page.root
                ) ?? null;
            if (board && board.type === "board") {
                frames.push({ id: board.id, name: board.name, pageId: page.id, pageName: page.name, created: false });
                return;
            }
            const created = penpot.createBoard();
            created.name = boardName;
            created.x = 120 + frames.length * 48;
            created.y = 120;
            created.resize(width, height);
            created.fills = [{ fillColor: "#FFFFFF", fillOpacity: 1 }];
            if (hug) {
                created.horizontalSizing = "auto";
                created.verticalSizing = "auto";
            }
            (page.root as any).appendChild(created);
            frames.push({ id: created.id, name: created.name, pageId: page.id, pageName: page.name, created: true });
        };

        if (params.buildTarget === "screen" || params.buildTarget === "both") {
            for (const device of params.devices) {
                const spec =
                    device === "mobile"
                        ? { width: 360, height: 800, suffix: "Mobile" }
                        : device === "tablet"
                          ? { width: 768, height: 1024, suffix: "Tablet" }
                          : { width: 1440, height: 900, suffix: "Desktop" };
                ensureBoard(screenPageName, `${params.name}/${spec.suffix}`, spec.width, spec.height, false);
            }
        }

        if (params.buildTarget === "widget" || params.buildTarget === "both") {
            ensureBoard(componentsPageName, params.name, 320, 180, true);
        }

        return { pages: pageEnsure.pages, frames };
    }

    public static listScreenPages(): Array<{ id: string; name: string; plainName: string; sequenceId: number | null }> {
        return this.getPages().filter((page) => page.plainName.startsWith("Screens/"));
    }

    public static createScreenPage(params: {
        name: string;
        devices: DeviceKind[];
    }): {
        pages: Array<{ id: string; name: string; created: boolean }>;
        frames: Array<{ id: string; name: string; pageId: string; pageName: string; created: boolean }>;
    } {
        const screenPageName = `Screens/${params.name}`;
        this.ensurePageStructure({
            includeComponents: true,
            screens: [screenPageName],
            openPageName: screenPageName,
        });
        return this.ensureFrameScaffolding({
            name: params.name,
            buildTarget: "screen",
            devices: params.devices,
            screenPageName,
            confirmed: true,
        });
    }

    public static createScreenShell(params: {
        name: string;
        root: WidgetNode;
        pageId?: string;
        screenPageName?: string;
    }): {
        page: { id: string; name: string };
        root: WidgetTreeNodeResult;
        nodes: WidgetTreeNodeResult[];
    } {
        const page =
            (params.pageId ? this.getPageById(params.pageId) : null) ??
            (params.screenPageName ? this.getPageByName(params.screenPageName) : null);
        if (!page) {
            throw new Error("Could not resolve target screen page for screen shell creation. Provide pageId or screenPageName.");
        }
        if (!this.getPlainPageName(page.name).startsWith("Screens/")) {
            throw new Error(`Screen shells must be created on a Screens/* page. Current target is ${page.name}.`);
        }

        const rootNode: WidgetNode = {
            ...params.root,
            name: params.name,
        };
        const result = this.createWidgetTree(rootNode, page.id);
        return {
            page: { id: page.id, name: page.name },
            root: result.root,
            nodes: result.nodes,
        };
    }

    public static createComponentShell(params: {
        name: string;
        root: WidgetNode;
        componentPageName?: string;
        category?: string;
    }): {
        page: { id: string; name: string };
        root: WidgetTreeNodeResult;
        nodes: WidgetTreeNodeResult[];
        category: string;
    } {
        const componentPageName = params.componentPageName ?? "_Components";
        const pageEnsure = this.ensurePageStructure({
            includeComponents: true,
            openPageName: componentPageName,
        });
        const page = this.getPageByName(componentPageName);
        if (!page) {
            throw new Error(`Could not resolve component page: ${componentPageName}`);
        }

        const rootNode: WidgetNode = {
            type: (params.root as any)?.type ?? "board",
            ...params.root,
            name: params.name,
        };
        if (!rootNode.children || rootNode.children.length === 0) {
            throw new Error("Component shell needs at least one child node.");
        }
        const result = this.createWidgetTree(rootNode, page.id);
        const rootShape = this.findShapeOnPageById(page, result.root.id);
        if (!rootShape) {
            throw new Error(`Created component shell root not found on page: ${result.root.id}`);
        }

        // Place at origin first to avoid Penpot auto-capturing children into another board before staging.
        (rootShape as any).x = 0;
        (rootShape as any).y = 0;

        this.stageMainComponentInComponentsPage(rootShape, params.name, page, params.category);
        rootShape.name = this.ensureWidgetDisplayName(this.getPlainWidgetName(params.name), rootNode.id || this.slugify(params.name));

        return {
            page: pageEnsure.activePage ?? { id: page.id, name: page.name },
            root: {
                ...result.root,
                name: rootShape.name,
            },
            nodes: result.nodes,
            category: params.category ?? this.inferComponentCategory(params.name),
        };
    }


    public static organizeShapeInComponentsPage(params: {
        shapeId: string;
        componentName?: string;
        category?: string;
        pageId?: string;
    }): {
        page: { id: string; name: string };
        shape: { id: string; name: string };
        category: string;
    } {
        const shape = this.findShapeById(params.shapeId);
        if (!shape) {
            throw new Error(`Shape not found: ${params.shapeId}`);
        }

        const page = params.pageId ? this.getPageById(params.pageId) : this.getPageForShape(shape);
        if (!page) {
            throw new Error("Could not resolve page for shape organization.");
        }
        if (this.getPlainPageName(page.name) !== "_Components") {
            throw new Error(`Shape ${shape.id} is on ${page.name}. Organizing components is only supported on _Components.`);
        }

        const componentName = params.componentName?.trim() || this.getPlainWidgetName(shape.name || "Component");
        this.stageMainComponentInComponentsPage(shape, componentName, page, params.category);
        shape.name = this.ensureWidgetDisplayName(componentName, this.readWidgetPluginData(shape).id || this.slugify(componentName), this.readWidgetPluginData(shape).sequence ?? undefined);

        return {
            page: { id: page.id, name: page.name },
            shape: { id: shape.id, name: shape.name },
            category: params.category ?? this.inferComponentCategory(componentName),
        };
    }

    public static publishComponentsFromComponentsPage(params?: {
        pageId?: string;
        shapeIds?: string[];
        componentPageName?: string;
    }): {
        page: { id: string; name: string };
        published: Array<{
            shapeId: string;
            shapeName: string;
            componentId: string;
            componentName: string;
            componentPath: string;
        }>;
        skipped: Array<{ shapeId?: string; shapeName: string; reason: string }>;
    } {
        const page = params?.pageId
            ? this.getPageById(params.pageId)
            : this.getPageByName(params?.componentPageName ?? "_Components");
        if (!page) {
            throw new Error("Could not resolve _Components page for component publication.");
        }
        if (this.getPlainPageName(page.name) !== "_Components") {
            throw new Error(`Component publication expects _Components; got ${page.name}.`);
        }

        const candidates = (params?.shapeIds?.length
            ? params.shapeIds.map((id) => this.findShapeOnPageById(page, id)).filter((shape): shape is Shape => !!shape)
            : this.getPageRootChildren(page).filter((shape) => {
                  if (shape.type === "text" && shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategoryLabel`)) {
                      return false;
                  }
                  return ["board", "group", "rectangle"].includes(shape.type);
              })) as Shape[];

        const published: Array<{
            shapeId: string;
            shapeName: string;
            componentId: string;
            componentName: string;
            componentPath: string;
        }> = [];
        const skipped: Array<{ shapeId?: string; shapeName: string; reason: string }> = [];

        for (const shape of candidates) {
            try {
                const componentName = this.getPlainWidgetName(shape.name || "Component");
                this.stageMainComponentInComponentsPage(shape, componentName, page);
                const result = this.createMainComponentFromShape({
                    shapeId: shape.id,
                    componentName,
                    componentPageName: "_Components",
                });
                published.push({
                    shapeId: shape.id,
                    shapeName: shape.name,
                    componentId: result.component.id,
                    componentName: result.component.name,
                    componentPath: result.component.path,
                });
            } catch (error) {
                skipped.push({
                    shapeId: shape.id,
                    shapeName: shape.name,
                    reason: String(error),
                });
            }
        }

        return {
            page: { id: page.id, name: page.name },
            published,
            skipped,
        };
    }

    public static validateComponentsPageLayout(params?: {
        pageId?: string;
        componentPageName?: string;
    }): {
        page: { id: string; name: string };
        summary: { categoryLabelCount: number; componentCount: number; overlapCount: number };
        findings: Array<{ severity: "high" | "medium" | "low"; code: string; message: string; shapeId?: string; shapeName?: string }>;
    } {
        const page = params?.pageId
            ? this.getPageById(params.pageId)
            : this.getPageByName(params?.componentPageName ?? "_Components");
        if (!page) {
            throw new Error("Could not resolve _Components page for layout validation.");
        }
        if (this.getPlainPageName(page.name) !== "_Components") {
            throw new Error(`Component page validation expects _Components; got ${page.name}.`);
        }

        const shapes = this.getPageRootChildren(page);
        const labels = shapes.filter((shape) => shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategoryLabel`));
        const components = shapes.filter((shape) => !shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategoryLabel`) && shape.type !== "text");
        const findings: Array<{ severity: "high" | "medium" | "low"; code: string; message: string; shapeId?: string; shapeName?: string }> = [];
        let overlapCount = 0;

        const boundsOf = (shape: Shape) => this.getBounds(shape);
        for (let i = 0; i < components.length; i++) {
            const a = components[i];
            const aBounds = boundsOf(a);
            if (!aBounds) {
                continue;
            }
            for (let j = i + 1; j < components.length; j++) {
                const b = components[j];
                const bBounds = boundsOf(b);
                if (!bBounds) {
                    continue;
                }
                const overlaps =
                    aBounds.x < bBounds.x + bBounds.width &&
                    aBounds.x + aBounds.width > bBounds.x &&
                    aBounds.y < bBounds.y + bBounds.height &&
                    aBounds.y + aBounds.height > bBounds.y;
                if (overlaps) {
                    overlapCount += 1;
                    findings.push({
                        severity: "high",
                        code: "component-overlap",
                        message: `Components overlap on the _Components canvas: ${a.name} and ${b.name}.`,
                        shapeId: a.id,
                        shapeName: a.name,
                    });
                }
            }
        }

        const uncategorized = components.filter((shape) => !shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategory`));
        for (const shape of uncategorized) {
            findings.push({
                severity: "medium",
                code: "missing-component-category",
                message: "Component shell is missing a category assignment on _Components.",
                shapeId: shape.id,
                shapeName: shape.name,
            });
        }

        return {
            page: { id: page.id, name: page.name },
            summary: {
                categoryLabelCount: labels.length,
                componentCount: components.length,
                overlapCount,
            },
            findings,
        };
    }

    public static lintScreenComposition(params?: { pageId?: string }): {
        page: { id: string; name: string };
        summary: { topLevelCount: number; componentInstanceCount: number; rawBoardCount: number };
        findings: Array<{ severity: "high" | "medium" | "low"; code: string; message: string; shapeId?: string; shapeName?: string }>;
    } {
        const page = params?.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for screen lint.");
        }
        if (!this.getPlainPageName(page.name).startsWith("Screens/")) {
            throw new Error(`Screen lint expects a Screens/* page; got ${page.name}.`);
        }

        const base = this.inspectUnsafeConstructionPatterns({ pageId: page.id });
        return {
            page: base.page,
            summary: {
                topLevelCount: base.summary.topLevelCount,
                componentInstanceCount: base.summary.componentInstanceCount,
                rawBoardCount: base.summary.rawBoardCount,
            },
            findings: base.findings,
        };
    }

    public static createTextBlock(params: {
        name: string;
        text: string;
        pageId?: string;
        targetShapeId?: string;
        width?: number;
        fontSize?: number;
        textColorToken?: string;
        typographyToken?: string;
    }): {
        root: WidgetTreeNodeResult;
        nodes: WidgetTreeNodeResult[];
        parentId: string | null;
    } {
        const root: WidgetNode = {
            type: "board",
            name: params.name,
            role: "text-block",
            tokens: {
                ...(params.targetShapeId ? {} : { fill: "color.surface.card", borderRadius: "radius.md" }),
            },
            layout: {
                kind: "column",
                width: params.width ?? "hug",
                height: "hug",
                gap: 8,
                padding: params.targetShapeId ? 0 : 12,
            },
            children: [
                {
                    type: "text",
                    name: `${params.name} Text`,
                    role: "text",
                    props: {
                        text: params.text,
                        fontSize: params.fontSize ?? 16,
                        width: params.width ?? 240,
                    },
                    tokens: {
                        ...(params.textColorToken ? { fill: params.textColorToken } : { fill: "color.text.primary" }),
                        ...(params.typographyToken ? { typography: params.typographyToken } : {}),
                    },
                    childLayout: {
                        absolute: false,
                        horizontalSizing: "fill",
                        verticalSizing: "auto",
                        alignSelf: "stretch",
                    },
                },
            ],
        };
        const result = this.createWidgetTree(root, params.pageId);

        if (params.targetShapeId) {
            const dock = this.dockShapeIntoContainer({
                shapeId: result.root.id,
                targetShapeId: params.targetShapeId,
                childLayout: {
                    absolute: false,
                    horizontalSizing: "fill",
                    verticalSizing: "auto",
                    alignSelf: "stretch",
                },
                fit: "none",
                inset: 0,
            }) as { parentId?: string | null };
            return {
                root: result.root,
                nodes: result.nodes,
                parentId: dock.parentId ?? null,
            };
        }

        return {
            root: result.root,
            nodes: result.nodes,
            parentId: null,
        };
    }

    public static createComponentVariant(params: {
        componentIds: string[];
        propertyName?: string;
        variantValues?: string[];
        containerName?: string;
        pageId?: string;
    }): object {
        return this.createVariantGroupFromComponents(params);
    }

    public static applyComponentVariantOverrides(params: {
        instanceShapeId: string;
        pageId?: string;
        variantOverrides: Record<string, string>;
    }): {
        oldInstanceId: string;
        newInstanceId: string;
        componentId: string;
        componentName: string;
        variantProps: Record<string, string> | null;
    } {
        const page = params.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for variant overrides.");
        }
        const instanceShape = this.findShapeOnPageById(page, params.instanceShapeId);
        if (!instanceShape || !instanceShape.isComponentInstance()) {
            throw new Error(`Shape is not a component instance: ${params.instanceShapeId}`);
        }
        const libraryComponent = instanceShape.component() as any;
        if (!libraryComponent) {
            throw new Error("Could not resolve the source component for the instance.");
        }

        const currentVariantProps = libraryComponent.variantProps ?? {};
        const targetVariantProps = { ...currentVariantProps, ...params.variantOverrides };
        const localComponents = this.listLocalComponents({ limit: 500 });
        const family = localComponents.filter((entry) => {
            const samePath =
                (entry.componentPath && libraryComponent.path && entry.componentPath === libraryComponent.path) ||
                entry.componentName === libraryComponent.name;
            return samePath;
        });

        const matched = family.find((entry) => {
            const props = entry.variantProps ?? {};
            return Object.entries(targetVariantProps).every(([key, value]) => props[key] === value);
        });
        if (!matched) {
            throw new Error(`No local variant matched the requested overrides: ${JSON.stringify(targetVariantProps)}`);
        }

        const parent = instanceShape.parent as Shape | null;
        const x = (instanceShape as any).x;
        const y = (instanceShape as any).y;
        const parentIndex = parent && "children" in parent && parent.children ? parent.children.findIndex((child) => child.id === instanceShape.id) : -1;
        const layoutChildSnapshot = (instanceShape as any).layoutChild ? JSON.parse(JSON.stringify((instanceShape as any).layoutChild)) : null;

        const localComponent = (penpot.library.local.components as any[]).find((entry) => entry.id === matched.componentId);
        if (!localComponent) {
            throw new Error(`Matched local variant component not found: ${matched.componentId}`);
        }
        const newInstance = localComponent.instance();
        newInstance.x = x;
        newInstance.y = y;
        if (parent && "appendChild" in parent) {
            (parent as any).appendChild(newInstance);
            if (parentIndex >= 0 && "setParentIndex" in newInstance) {
                (newInstance as any).setParentIndex(parentIndex);
            }
        }
        if (layoutChildSnapshot && (newInstance as any).layoutChild) {
            Object.assign((newInstance as any).layoutChild, layoutChildSnapshot);
        }

        instanceShape.remove();

        return {
            oldInstanceId: params.instanceShapeId,
            newInstanceId: newInstance.id,
            componentId: localComponent.id,
            componentName: localComponent.name,
            variantProps: localComponent.variantProps ?? null,
        };
    }

    public static createMainComponentFromShape(params: CreateMainComponentParams): {
        component: {
            id: string;
            name: string;
            path: string;
            libraryId: string;
        };
        mainInstance: {
            id: string;
            name: string;
            pageId: string | null;
            pageName: string | null;
        };
        note?: string | null;
        sourceInstance?: {
            id: string;
            name: string;
            pageId: string | null;
            pageName: string | null;
        } | null;
    } {
        const shape = this.findShapeById(params.shapeId);
        if (!shape) {
            throw new Error(`Shape not found: ${params.shapeId}`);
        }

        const existingComponent = shape.component();
        if (existingComponent) {
            const main = existingComponent.mainInstance();
            const mainPage = this.getPageForShape(main);
            return {
                component: {
                    id: existingComponent.id,
                    name: existingComponent.name,
                    path: existingComponent.path,
                    libraryId: existingComponent.libraryId,
                },
                mainInstance: {
                    id: main.id,
                    name: main.name,
                    pageId: mainPage?.id ?? null,
                    pageName: mainPage?.name ?? null,
                },
                sourceInstance: shape.id === main.id ? null : {
                    id: shape.id,
                    name: shape.name,
                    pageId: this.getPageForShape(shape)?.id ?? null,
                    pageName: this.getPageForShape(shape)?.name ?? null,
                },
            };
        }

        const sourcePage = this.getPageForShape(shape);
        if (!sourcePage) {
            throw new Error("Source shape is not attached to a page");
        }

        const targetPageName = params.componentPageName ?? "_Components";
        if (sourcePage.name !== targetPageName) {
            throw new Error(
                `Main components must be created from shapes on ${targetPageName}. Current shape is on ${sourcePage.name}.`
            );
        }

        const requestedComponentName = params.componentName?.trim() || this.getPlainWidgetName(shape.name || "Component");
        const duplicateComponent = (penpot.library.local.components as any[]).find(
            (entry) => entry.name.trim().toLowerCase() === requestedComponentName.toLowerCase()
        );
        if (duplicateComponent) {
            const duplicateMain = duplicateComponent.mainInstance?.();
            if (shape.id !== duplicateMain?.id) {
                try {
                    shape.remove();
                } catch (_error) {
                    shape.hidden = true;
                    shape.name = `[dedup-hidden] ${shape.name || shape.type}`;
                }
            }
            if (duplicateMain) {
                this.stageMainComponentInComponentsPage(duplicateMain, duplicateComponent.name, sourcePage);
            }
            return {
                component: {
                    id: duplicateComponent.id,
                    name: duplicateComponent.name,
                    path: duplicateComponent.path,
                    libraryId: duplicateComponent.libraryId,
                },
                mainInstance: {
                    id: duplicateMain?.id ?? null,
                    name: duplicateMain?.name ?? duplicateComponent.name,
                    pageId: this.getPageForShape(duplicateMain)?.id ?? sourcePage.id,
                    pageName: this.getPageForShape(duplicateMain)?.name ?? sourcePage.name,
                },
                note: `Reused existing local component ${duplicateComponent.name} instead of creating a duplicate.`,
                sourceInstance: null,
            };
        }

        const component = penpot.library.local.createComponent([shape]);
        component.name = requestedComponentName;

        const mainInstance = component.mainInstance();
        mainInstance.name = requestedComponentName;
        const targetPage = this.getPageByName(targetPageName) ?? (() => {
            const page = penpot.createPage();
            page.name = this.ensurePageDisplayName(targetPageName, this.allocateNextPageSequence());
            return page;
        })();
        const mainPage = this.getPageForShape(mainInstance);

        this.stageMainComponentInComponentsPage(mainInstance, component.name, targetPage);
        mainInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentRole`, "main");
        mainInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentId`, component.id);
        mainInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentName`, component.name);

        return {
            component: {
                id: component.id,
                name: component.name,
                path: component.path,
                libraryId: component.libraryId,
            },
            mainInstance: {
                id: mainInstance.id,
                name: mainInstance.name,
                pageId: mainPage?.id ?? null,
                pageName: mainPage?.name ?? null,
            },
            note:
                mainPage?.id !== targetPage.id
                    ? `Penpot plugin context did not move the main component across pages; the component was created in the local library and remains referenced from ${mainPage?.name ?? "the source page"}.`
                    : null,
            sourceInstance: null,
        };
    }

    private static stageMainComponentInComponentsPage(
        mainInstance: Shape,
        componentName: string,
        page: Page,
        categoryOverride?: string
    ): void {
        const category = categoryOverride ?? this.inferComponentCategory(componentName);
        const label = this.ensureComponentCategoryLabel(page, category);
        const siblings = this.getComponentCategorySiblings(page, category).filter((shape) => shape.id !== mainInstance.id);
        const labelBounds = this.getBounds(label);
        const siblingBounds = siblings
            .map((shape) => ({ shape, bounds: this.getBounds(shape) }))
            .filter((entry) => !!entry.bounds);

        const startX = 120;
        const componentY = labelBounds.y + labelBounds.height + 24;
        const nextX =
            siblingBounds.length > 0
                ? Math.max(...siblingBounds.map((entry) => entry.bounds.x + entry.bounds.width)) + 40
                : startX;

        mainInstance.x = nextX;
        mainInstance.y = componentY;
        mainInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategory`, category);
    }

    private static inferComponentCategory(componentName: string): string {
        const normalized = componentName.trim().toLowerCase();
        if (normalized.includes("/button")) {
            return "BUTTONS";
        }
        if (normalized.includes("/form") || normalized.includes("/input") || normalized.includes("/select")) {
            return "FORMS";
        }
        if (normalized.includes("/header") || normalized.includes("/appbar") || normalized.includes("/topbar")) {
            return "HEADER";
        }
        if (normalized.includes("/nav") || normalized.includes("/sidebar") || normalized.includes("/tab")) {
            return "NAVIGATION";
        }
        if (normalized.includes("/search")) {
            return "SEARCH";
        }
        if (normalized.includes("/member") || normalized.includes("/avatar") || normalized.includes("/rolebadge")) {
            return "MEMBERS";
        }
        if (normalized.includes("/user")) {
            return "USERS";
        }
        if (normalized.includes("/card") || normalized.includes("/metric") || normalized.includes("/stat")) {
            return "CARDS";
        }
        if (normalized.includes("/alert") || normalized.includes("/toast") || normalized.includes("/empty")) {
            return "FEEDBACK";
        }
        if (normalized.includes("/modal") || normalized.includes("/drawer") || normalized.includes("/tooltip")) {
            return "OVERLAYS";
        }
        return "MISC";
    }

    private static ensureComponentCategoryLabel(page: Page, category: string): Text {
        const rootChildren = this.getPageRootChildren(page);
        const existing = rootChildren.find(
            (shape) =>
                shape.type === "text" &&
                shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategoryLabel`) === category
        ) as Text | undefined;
        if (existing) {
            return existing;
        }

        const categoryIndex = this.COMPONENT_CATEGORY_ORDER.indexOf(category as (typeof PenpotUtils.COMPONENT_CATEGORY_ORDER)[number]);
        const previousCategories = this.COMPONENT_CATEGORY_ORDER.slice(
            0,
            categoryIndex >= 0 ? categoryIndex : this.COMPONENT_CATEGORY_ORDER.length
        );
        const rootBounds = rootChildren
            .map((shape) => this.getBounds(shape))
            .filter((bounds) => !!bounds);
        const previousBottom = rootChildren
            .filter((shape) => {
                const labelCategory = shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategoryLabel`);
                const shapeCategory = shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategory`);
                return previousCategories.includes((labelCategory || shapeCategory) as any);
            })
            .map((shape) => this.getBounds(shape).y + this.getBounds(shape).height);

        const y =
            previousBottom.length > 0
                ? Math.max(...previousBottom) + 120
                : rootBounds.length > 0
                  ? Math.max(...rootBounds.map((bounds) => bounds.y + bounds.height)) + 120
                  : 120;

        const label = penpot.createText(category);
        if (!label) {
            throw new Error(`Could not create category label for ${category}`);
        }
        label.name = `${category} Label`;
        label.x = 120;
        label.y = y;
        label.fontSize = "12";
        label.fontWeight = "700";
        label.textTransform = "uppercase";
        label.fills = [{ fillColor: "#64748B", fillOpacity: 1 }];
        label.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategoryLabel`, category);
        (page.root as any).appendChild(label);
        return label;
    }

    private static getComponentCategorySiblings(page: Page, category: string): Shape[] {
        return this.getPageRootChildren(page).filter(
            (shape) => shape.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentCategory`) === category
        );
    }

    public static listLocalComponents(options?: {
        nameContains?: string;
        pathContains?: string;
        matchMode?: "exact" | "prefix" | "contains";
        requireExactMatch?: boolean;
        limit?: number;
    }): Array<{
        componentId: string;
        componentName: string;
        componentPath: string | null;
        mainInstanceId: string | null;
        variantProps: Record<string, string> | null;
        matchConfidence?: number;
        exactMatch?: boolean;
    }> {
        const queryName = options?.nameContains?.trim().toLowerCase();
        const queryPath = options?.pathContains?.trim().toLowerCase();
        const matchMode = options?.matchMode ?? "contains";

        const scoreMatch = (candidate: string | undefined | null, query: string): { score: number; exact: boolean } => {
            const normalized = (candidate ?? "").toLowerCase().trim();
            if (!normalized) {
                return { score: 0, exact: false };
            }
            if (normalized === query) {
                return { score: 1, exact: true };
            }
            if (matchMode === "exact") {
                return { score: 0, exact: false };
            }
            if (normalized.startsWith(query)) {
                return { score: 0.9, exact: false };
            }
            if (matchMode === "prefix") {
                return { score: 0, exact: false };
            }
            if (normalized.includes(query)) {
                return { score: 0.72, exact: false };
            }
            return { score: 0, exact: false };
        };

        return (penpot.library.local.components as any[])
            .map((component) => {
                const nameScore = queryName ? scoreMatch(component.name, queryName) : { score: 1, exact: false };
                const pathScore = queryPath ? scoreMatch(component.path ?? component.name, queryPath) : { score: 1, exact: false };
                const score = Math.min(nameScore.score, pathScore.score);
                const exact = (!!queryName ? nameScore.exact : true) && (!!queryPath ? pathScore.exact : true);
                if (score <= 0) {
                    return null;
                }
                if (options?.requireExactMatch && !exact) {
                    return null;
                }
                const main = component.mainInstance?.();
                return {
                    componentId: component.id,
                    componentName: component.name,
                    componentPath: component.path ?? null,
                    mainInstanceId: main?.id ?? null,
                    variantProps: component.variantProps ?? null,
                    matchConfidence: score,
                    exactMatch: exact,
                };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
            .sort((a, b) => (b.matchConfidence ?? 0) - (a.matchConfidence ?? 0))
            .slice(0, options?.limit ?? 50);
    }

    private static findShapeInSubtreeById(shape: Shape, id: string): Shape | null {
        if (shape.id === id) {
            return shape;
        }

        if (!("children" in shape) || !shape.children) {
            return null;
        }

        for (const child of shape.children) {
            const match = this.findShapeInSubtreeById(child, id);
            if (match) {
                return match;
            }
        }

        return null;
    }

    private static findShapeOnPageById(page: Page, id: string): Shape | null {
        const directMatch =
            ((page as any).findShapeById?.(id) as Shape | null | undefined) ??
            ((page as any).getShapeById?.(id) as Shape | null | undefined);

        if (directMatch) {
            return directMatch;
        }

        const root = page.root as Shape | undefined;
        if (!root) {
            return null;
        }

        return this.findShapeInSubtreeById(root, id);
    }

    public static listLibraryComponents(): LibraryComponentSummary[] {
        const libraries = [penpot.library.local, ...penpot.library.connected];
        return libraries.flatMap((library) =>
            library.components.map((component: any) => ({
                libraryId: library.id,
                libraryName: library.name,
                componentId: component.id,
                componentName: component.name,
                componentPath: component.path ?? null,
                isVariant: typeof component.isVariant === "function" ? component.isVariant() : false,
                variantProps: component.variantProps ?? null,
            }))
        );
    }

    public static findLibraryComponents(options: {
        libraryName?: string;
        componentNameContains?: string;
        componentPathContains?: string;
        matchMode?: "exact" | "prefix" | "contains" | "fuzzy";
        requireExactMatch?: boolean;
        limit?: number;
    }): LibraryComponentSummary[] {
        const libraryName = options.libraryName?.toLowerCase();
        const componentNameQuery = options.componentNameContains?.toLowerCase().trim();
        const componentPathQuery = options.componentPathContains?.toLowerCase().trim();
        const matchMode = options.matchMode ?? "contains";

        const scoreMatch = (candidate: string, query: string): { score: number; exact: boolean } => {
            const normalized = candidate.toLowerCase();
            if (normalized === query) {
                return { score: 1, exact: true };
            }
            if (matchMode === "exact") {
                return { score: 0, exact: false };
            }
            const segments = normalized.split(/[\/\s_-]+/).filter(Boolean);
            if (segments.includes(query)) {
                return { score: 0.98, exact: false };
            }
            if (normalized.startsWith(query)) {
                return { score: 0.92, exact: false };
            }
            if (segments.some((segment) => segment.startsWith(query))) {
                return { score: 0.88, exact: false };
            }
            if (matchMode === "prefix") {
                return { score: 0, exact: false };
            }
            if (normalized.includes(query)) {
                return { score: 0.75, exact: false };
            }
            if (matchMode === "contains") {
                return { score: 0, exact: false };
            }
            const collapsed = normalized.replace(/[^a-z0-9]+/g, "");
            const collapsedQuery = query.replace(/[^a-z0-9]+/g, "");
            if (collapsed.includes(collapsedQuery) || collapsedQuery.includes(collapsed)) {
                return { score: 0.55, exact: false };
            }
            return { score: 0, exact: false };
        };

        const rankedEntries = this.listLibraryComponents()
            .map((entry): LibraryComponentSummary | null => {
                if (libraryName && !entry.libraryName.toLowerCase().includes(libraryName)) {
                    return null;
                }

                const nameScore = componentNameQuery
                    ? scoreMatch(entry.componentName, componentNameQuery)
                    : { score: 1, exact: false };
                const pathScore = componentPathQuery
                    ? scoreMatch(entry.componentPath ?? "", componentPathQuery)
                    : { score: 1, exact: false };
                const score = Math.min(nameScore.score, pathScore.score);
                const exact = !!componentNameQuery && nameScore.exact && (!componentPathQuery || pathScore.exact);

                if (score <= 0) {
                    return null;
                }
                if (options.requireExactMatch && !exact) {
                    return null;
                }

                return {
                    ...entry,
                    matchConfidence: score,
                    exactMatch: exact,
                };
            });

        return rankedEntries
            .filter((entry): entry is LibraryComponentSummary => entry !== null)
            .sort((a, b) => (b.matchConfidence ?? 0) - (a.matchConfidence ?? 0))
            .slice(0, options.limit ?? 50);
    }

    public static instantiateLibraryComponent(params: InstantiateLibraryComponentParams): object {
        const matches = this.findLibraryComponents({
            libraryName: params.libraryName,
            componentNameContains: params.componentNameContains,
            componentPathContains: params.componentPathContains,
            // @ts-ignore keep compatibility with direct JSON calls
            matchMode: (params as any).matchMode,
            // @ts-ignore keep compatibility with direct JSON calls
            requireExactMatch: (params as any).requireExactMatch,
            limit: 1,
        });

        if (matches.length === 0) {
            throw new Error("No matching library component found");
        }

        const match = matches[0];
        const library = [penpot.library.local, ...penpot.library.connected].find((entry) => entry.id === match.libraryId);
        if (!library) {
            throw new Error(`Library not found: ${match.libraryName}`);
        }

        const component: any = library.components.find((entry: any) => entry.id === match.componentId);
        if (!component) {
            throw new Error(`Component not found: ${match.componentName}`);
        }

        const instance = component.instance();
        const page = params.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No target page available for component instantiation");
        }

        penpot.openPage(page);
        const targetShape = params.targetShapeId ? this.findShapeOnPageById(page, params.targetShapeId) : null;
        if (params.targetShapeId && !targetShape) {
            throw new Error(`Target shape not found on current page: ${params.targetShapeId}`);
        }

        const targetParent = targetShape ?? page.root;
        if (typeof (targetParent as any).appendChild !== "function") {
            throw new Error(
                params.targetShapeId
                    ? `Target shape cannot contain children: ${params.targetShapeId}`
                    : "Resolved target parent cannot contain children"
            );
        }

        instance.x = params.x ?? (targetParent === page.root ? 120 : 0);
        instance.y = params.y ?? (targetParent === page.root ? 120 : 0);
        (targetParent as any).appendChild(instance);

        this.applyRuntimeIdentityMetadata(
            instance,
            {
                type: "library_component",
                name: instance.name || match.componentName,
                semanticId: this.buildLibraryComponentSemanticId(match),
                sourceLibrary: match.libraryName,
                sourceComponentId: match.componentId,
                sourceComponentName: match.componentName,
                sourceComponentPath: match.componentPath,
            },
            page,
            targetParent === page.root ? null : (targetParent as Board)
        );

        if (targetParent !== page.root && params.childLayout && (targetParent as any).type === "board") {
            this.applyWidgetChildLayout(
                instance,
                { type: "library_component", childLayout: params.childLayout },
                targetParent as Board
            );
        }

        if (params.detach) {
            instance.detach();
        }

        return {
            match,
            instanceId: instance.id,
            parentId: (instance.parent as any)?.id ?? null,
            targetShapeId: targetShape?.id ?? null,
            detached: params.detach ?? false,
            isComponentInstance: instance.isComponentInstance(),
            matchConfidence: match.matchConfidence ?? null,
            exactMatch: match.exactMatch ?? false,
        };
    }

    public static dockShapeIntoContainer(params: DockShapeIntoContainerParams): object {
        const shape = this.findShapeById(params.shapeId);
        if (!shape) {
            throw new Error(`Shape not found: ${params.shapeId}`);
        }

        const targetShape = this.findShapeById(params.targetShapeId);
        if (!targetShape) {
            throw new Error(`Target shape not found: ${params.targetShapeId}`);
        }

        if (typeof (targetShape as any).appendChild !== "function") {
            throw new Error(`Target shape cannot contain children: ${params.targetShapeId}`);
        }

        (targetShape as any).appendChild(shape);

        const targetBoard = targetShape.type === "board" ? (targetShape as Board) : null;
        if (targetBoard) {
            this.ensureSlotContainerLayout(targetBoard, params.inset ?? DEFAULT_WIDGET_SPACING_SYSTEM.xs);
            this.applyWidgetChildLayout(
                shape,
                { type: "docked_shape", childLayout: params.childLayout ?? { absolute: false } },
                targetBoard
            );
        }

        this.fitShapeWithinContainer(shape, targetShape, params.fit ?? "none", params.inset ?? 0);

        return {
            shapeId: shape.id,
            targetShapeId: targetShape.id,
            parentId: (shape.parent as any)?.id ?? null,
            fit: params.fit ?? "none",
        };
    }

    public static instantiateLibraryComponentIntoSlot(
        params: InstantiateLibraryComponentParams & {
            targetShapeId: string;
            fit?: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
            inset?: number;
        }
    ): object {
        const instanceResult: any = this.instantiateLibraryComponent({
            libraryName: params.libraryName,
            componentNameContains: params.componentNameContains,
            componentPathContains: params.componentPathContains,
            pageId: params.pageId,
            detach: params.detach,
            // @ts-ignore compatibility with enhanced server tool args
            matchMode: (params as any).matchMode,
            // @ts-ignore compatibility with enhanced server tool args
            requireExactMatch: (params as any).requireExactMatch,
        });

        const placement = this.inferLibrarySlotPlacement(instanceResult.match);

        const dockResult = this.dockShapeIntoContainer({
            shapeId: instanceResult.instanceId,
            targetShapeId: params.targetShapeId,
            childLayout:
                params.childLayout ?? {
                    ...placement.childLayout,
                },
            fit: params.fit ?? placement.fit,
            inset: params.inset ?? placement.inset,
        });

        return {
            ...instanceResult,
            ...dockResult,
        };
    }

    public static instantiateLocalComponentIntoSlot(params: InstantiateLocalComponentIntoSlotParams): object {
        const localComponents = penpot.library.local.components as any[];
        const ranked = this.listLocalComponents({
            nameContains: params.componentName,
            pathContains: params.componentPath,
            matchMode: params.matchMode,
            requireExactMatch: params.requireExactMatch,
            limit: 1,
        }).map((match) => {
            const component = localComponents.find((entry) => entry.id === match.componentId);
            return component
                ? {
                      component,
                      score: match.matchConfidence ?? 1,
                      exact: match.exactMatch ?? false,
                  }
                : null;
        }).filter((entry): entry is { component: any; score: number; exact: boolean } => entry !== null);

        const selected = params.componentId
            ? (() => {
                  const component = localComponents.find((entry) => entry.id === params.componentId);
                  return component ? { component, score: 1, exact: true } : null;
              })()
            : ranked[0];
        if (!selected) {
            throw new Error(
                params.componentId
                    ? `Local component not found: ${params.componentId}`
                    : `No local component matched the requested query`
            );
        }

        const page = params.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No target page available for local component instantiation");
        }

        penpot.openPage(page);
        const targetShape = this.findShapeOnPageById(page, params.targetShapeId);
        if (!targetShape) {
            throw new Error(`Target shape not found on current page: ${params.targetShapeId}`);
        }

        const instance = selected.component.instance();
        const dockResult = this.dockShapeIntoContainer({
            shapeId: instance.id,
            targetShapeId: params.targetShapeId,
            childLayout: params.childLayout ?? { absolute: false },
            fit: params.fit ?? "none",
            inset: params.inset ?? 0,
        });

        this.applyRuntimeIdentityMetadata(
            instance,
            {
                type: "local_component_instance",
                name: instance.name || selected.component.name,
                semanticId: this.slugify(selected.component.name || selected.component.path || "local-component"),
                sourceLibrary: penpot.library.local.name,
                sourceComponentId: selected.component.id,
                sourceComponentName: selected.component.name,
                sourceComponentPath: selected.component.path ?? null,
            },
            page,
            targetShape.type === "board" ? (targetShape as Board) : null
        );

        return {
            component: {
                id: selected.component.id,
                name: selected.component.name,
                path: selected.component.path ?? null,
            },
            instanceId: instance.id,
            parentId: (instance.parent as any)?.id ?? null,
            targetShapeId: targetShape.id,
            matchConfidence: selected.score,
            exactMatch: selected.exact,
            ...dockResult,
        };
    }

    public static applyInstanceTextOverrides(params: ApplyInstanceTextOverridesParams): {
        instance: { id: string; name: string; componentId: string | null };
        overrides: Array<{ layerName: string; text: string; applied: boolean; matchedShapeId?: string; reason?: string }>;
    } {
        const page = params.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for instance overrides");
        }

        const instanceShape = this.findShapeOnPageById(page, params.instanceShapeId);
        if (!instanceShape) {
            throw new Error(`Instance shape not found: ${params.instanceShapeId}`);
        }
        if (!instanceShape.isComponentInstance()) {
            throw new Error(`Shape is not a component instance: ${params.instanceShapeId}`);
        }

        const descendantTexts = this.findShapes(
            (shape) => shape.type === "text",
            instanceShape
        ) as Text[];

        const findTextLayer = (layerName: string): Text | null => {
            const normalizedQuery = this.getPlainWidgetName(layerName).toLowerCase();
            return (
                descendantTexts.find((shape) => this.getPlainWidgetName(shape.name || "").toLowerCase() === normalizedQuery) ??
                descendantTexts.find((shape) => this.getPlainWidgetName(shape.name || "").toLowerCase().includes(normalizedQuery)) ??
                null
            );
        };

        const results = params.overrides.map((override) => {
            const textShape = findTextLayer(override.layerName);
            if (!textShape) {
                return {
                    layerName: override.layerName,
                    text: override.text,
                    applied: false,
                    reason: "Matching text layer not found in instance subtree",
                };
            }

            textShape.characters = override.text;
            return {
                layerName: override.layerName,
                text: override.text,
                applied: true,
                matchedShapeId: textShape.id,
            };
        });

        return {
            instance: {
                id: instanceShape.id,
                name: instanceShape.name,
                componentId: instanceShape.component()?.id ?? null,
            },
            overrides: results,
        };
    }

    public static getPageForShape(shape: Shape): Page | null {
        for (const page of penpot.currentFile!.pages) {
            if (page.getShapeById(shape.id)) {
                return page;
            }
        }
        return null;
    }

    public static generateCss(shape: Shape): string {
        const page = this.getPageForShape(shape);
        if (!page) {
            throw new Error("Shape is not part of any page");
        }
        penpot.openPage(page);
        return penpot.generateStyle([shape], { type: "css", includeChildren: true });
    }

    /**
     * Gets the actual rendering bounds of a shape. For most shapes, this is simply the `bounds` property.
     * However, for Text shapes, the `bounds` may not reflect the true size of the rendered text content,
     * so we use the `textBounds` property instead.
     *
     * @param shape - The shape to get the bounds for
     */
    public static getBounds(shape: Shape): Bounds {
        if (shape.type === "text") {
            const text = shape as Text;
            // TODO: Remove ts-ignore once type definitions are updated
            // @ts-ignore
            return text.textBounds;
        } else {
            return shape.bounds;
        }
    }

    /**
     * Checks if a child shape is fully contained within its parent's bounds.
     * Visual containment means all edges of the child are within the parent's bounding box.
     *
     * @param child - The child shape to check
     * @param parent - The parent shape to check against
     * @returns true if child is fully contained within parent bounds, false otherwise
     */
    public static isContainedIn(child: Shape, parent: Shape): boolean {
        const childBounds = this.getBounds(child);
        const parentBounds = this.getBounds(parent);
        return (
            childBounds.x >= parentBounds.x &&
            childBounds.y >= parentBounds.y &&
            childBounds.x + childBounds.width <= parentBounds.x + parentBounds.width &&
            childBounds.y + childBounds.height <= parentBounds.y + parentBounds.height
        );
    }

    /**
     * Sets the position of a shape relative to its parent's position.
     * This is a convenience method since parentX and parentY are read-only properties.
     *
     * @param shape - The shape to position
     * @param parentX - The desired X position relative to the parent
     * @param parentY - The desired Y position relative to the parent
     * @throws Error if the shape has no parent
     */
    public static setParentXY(shape: Shape, parentX: number, parentY: number): void {
        if (!shape.parent) {
            throw new Error("Shape has no parent - cannot set parent-relative position");
        }
        shape.x = shape.parent.x + parentX;
        shape.y = shape.parent.y + parentY;
    }

    /**
     * Adds a flex layout to a container while preserving the visual order of existing children.
     * Without this, adding a flex layout can arbitrarily reorder children.
     *
     * The method sorts children by their current position (x for "row", y for "column") before
     * adding the layout, then reorders them to maintain that visual sequence.
     *
     * @param container - The container (board) to add the flex layout to
     * @param dir - The layout direction: "row" for horizontal, "column" for vertical
     * @returns The created FlexLayout instance
     */
    public static addFlexLayout(container: Board, dir: "column" | "row"): FlexLayout {
        // obtain children sorted by position (ascending)
        const children = "children" in container && container.children ? [...container.children] : [];
        const sortedChildren = children.sort((a, b) => (dir === "row" ? a.x - b.x : a.y - b.y));

        // add the flex layout
        const flexLayout = container.addFlexLayout();
        flexLayout.dir = dir;

        // reorder children to preserve visual order; since the children array is reversed
        // relative to visual order for dir="column" or dir="row", we insert each child at
        // index 0 in sorted order, which places the first (smallest position) at the highest
        // index, making it appear first visually
        for (const child of sortedChildren) {
            child.setParentIndex(0);
        }

        return flexLayout;
    }

    /**
     * Analyzes all descendants of a shape by applying an evaluator function to each.
     * Only descendants for which the evaluator returns a non-null/non-undefined value are included in the result.
     * This is a general-purpose utility for validation, analysis, or collecting corrector functions.
     *
     * @param root - The root shape whose descendants to analyze
     * @param evaluator - Function called for each descendant with (root, descendant); return null/undefined to skip
     * @param maxDepth - Optional maximum depth to traverse (undefined for unlimited)
     * @returns Array of objects containing the shape and the evaluator's result
     */
    public static analyzeDescendants<T>(
        root: Shape,
        evaluator: (root: Shape, descendant: Shape) => T | null | undefined,
        maxDepth: number | undefined = undefined
    ): Array<{ shape: Shape; result: NonNullable<T> }> {
        const results: Array<{ shape: Shape; result: NonNullable<T> }> = [];

        const traverse = (shape: Shape, currentDepth: number): void => {
            const result = evaluator(root, shape);
            if (result !== null && result !== undefined) {
                results.push({ shape, result: result as NonNullable<T> });
            }

            if (maxDepth === undefined || currentDepth < maxDepth) {
                if ("children" in shape && shape.children) {
                    for (const child of shape.children) {
                        traverse(child, currentDepth + 1);
                    }
                }
            }
        };

        // Start traversal with root's children (not root itself)
        if ("children" in root && root.children) {
            for (const child of root.children) {
                traverse(child, 1);
            }
        }

        return results;
    }

    /**
     * Decodes a base64 string to a Uint8Array.
     *
     * @param base64 - The base64-encoded string to decode
     * @returns The decoded data as a Uint8Array
     */
    public static base64ToByteArray(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Imports an image from base64 data into the Penpot design as a Rectangle shape filled with the image.
     * The rectangle has the image's original proportions by default.
     * Optionally accepts position (x, y) and dimensions (width, height) parameters.
     * If only one dimension is provided, the other is calculated to maintain the image's aspect ratio.
     *
     * This function is used internally by the ImportImageTool in the MCP server.
     *
     * @param base64 - The base64-encoded image data
     * @param mimeType - The MIME type of the image (e.g., "image/png")
     * @param name - The name to assign to the newly created rectangle shape
     * @param x - The x-coordinate for positioning the rectangle (optional)
     * @param y - The y-coordinate for positioning the rectangle (optional)
     * @param width - The desired width of the rectangle (optional)
     * @param height - The desired height of the rectangle (optional)
     */
    public static async importImage(
        base64: string,
        mimeType: string,
        name: string,
        x: number | undefined,
        y: number | undefined,
        width: number | undefined,
        height: number | undefined
    ): Promise<Rectangle> {
        // convert base64 to Uint8Array
        const bytes = PenpotUtils.base64ToByteArray(base64);

        // upload the image data to Penpot
        const imageData = await penpot.uploadMediaData(name, bytes, mimeType);

        // create a rectangle shape
        const rect = penpot.createRectangle();
        rect.name = name;

        // calculate dimensions
        let rectWidth, rectHeight;
        const hasWidth = width !== undefined;
        const hasHeight = height !== undefined;

        if (hasWidth && hasHeight) {
            // both width and height provided - use them directly
            rectWidth = width;
            rectHeight = height;
        } else if (hasWidth) {
            // only width provided - maintain aspect ratio
            rectWidth = width;
            rectHeight = rectWidth * (imageData.height / imageData.width);
        } else if (hasHeight) {
            // only height provided - maintain aspect ratio
            rectHeight = height;
            rectWidth = rectHeight * (imageData.width / imageData.height);
        } else {
            // neither provided - use original dimensions
            rectWidth = imageData.width;
            rectHeight = imageData.height;
        }

        // set rectangle dimensions
        rect.resize(rectWidth, rectHeight);

        // set position if provided
        if (x !== undefined) {
            rect.x = x;
        }
        if (y !== undefined) {
            rect.y = y;
        }

        // apply the image as a fill
        rect.fills = [{ fillOpacity: 1, fillImage: imageData }];

        return rect;
    }

    /**
     * Exports the given shape (or its fill) to BASE64 image data.
     *
     * This function is used internally by the ExportImageTool in the MCP server.
     *
     * @param shape - The shape whose image data to export
     * @param mode - Either "shape" (to export the entire shape, including descendants) or "fill"
     *    to export the shape's raw fill image data
     * @param asSVG - Whether to export as SVG rather than as a pixel image (only supported for mode "shape")
     * @returns A byte array containing the exported image data.
     *   - For mode="shape", it will be PNG or SVG data depending on the value of `asSVG`.
     *   - For mode="fill", it will be whatever format the fill image is stored in.
     */
    public static async exportImage(shape: Shape, mode: "shape" | "fill", asSVG: boolean): Promise<Uint8Array> {
        switch (mode) {
            case "shape":
                return shape.export({ type: asSVG ? "svg" : "png" });
            case "fill":
                if (asSVG) {
                    throw new Error("Image fills cannot be exported as SVG");
                }
                // check whether the shape has the `fills` member
                if (!("fills" in shape)) {
                    throw new Error("Shape with `fills` member is required for fill export mode");
                }
                // find first fill that has fillImage
                const fills: Fill[] = (shape as any).fills;
                for (const fill of fills) {
                    if (fill.fillImage) {
                        const imageData = fill.fillImage;
                        return imageData.data();
                    }
                }
                throw new Error("No fill with image data found in the shape");
            default:
                throw new Error(`Unsupported export mode: ${mode}`);
        }
    }

    /**
     * Finds all tokens that match the given name across all token sets.
     *
     * @param name - The name of the token to search for (case-sensitive exact match)
     * @returns An array of all matching tokens (may be empty)
     */
    public static findTokensByName(name: string): any[] {
        const tokens: any[] = [];
        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;

        for (const set of tokenCatalog.sets) {
            for (const token of set.tokens) {
                if (token.name === name) {
                    tokens.push(token);
                }
            }
        }

        return tokens;
    }

    /**
     * Finds the first token that matches the given name across all token sets.
     *
     * @param name - The name of the token to search for (case-sensitive exact match)
     * @returns The first matching token, or null if not found
     */
    public static findTokenByName(name: string): any | null {
        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;

        for (const set of tokenCatalog.sets) {
            for (const token of set.tokens) {
                if (token.name === name) {
                    return token;
                }
            }
        }

        return null;
    }

    /**
     * Gets the token set that contains the given token.
     *
     * @param token - The token whose set to find
     * @returns The TokenSet containing this token, or null if not found
     */
    public static getTokenSet(token: any): any | null {
        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;

        for (const set of tokenCatalog.sets) {
            if (set.tokens.includes(token)) {
                return set;
            }
        }

        return null;
    }

    /**
     * Generates an overview of all tokens organized by token set name, token type, and token name.
     * The result is a nested object structure: {tokenSetName: {tokenType: [tokenName, ...]}}.
     *
     * @returns An object mapping token set names to objects that map token types to arrays of token names
     */
    public static tokenOverview(): Record<string, Record<string, string[]>> {
        const overview: Record<string, Record<string, string[]>> = {};
        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;

        for (const set of tokenCatalog.sets) {
            const setOverview: Record<string, string[]> = {};

            for (const token of set.tokens) {
                const tokenType = token.type;
                if (!setOverview[tokenType]) {
                    setOverview[tokenType] = [];
                }
                setOverview[tokenType].push(token.name);
            }

            overview[set.name] = setOverview;
        }

        return overview;
    }

    public static inspectDesignTokens(): {
        sets: Array<{
            id: string;
            name: string;
            active: boolean;
            tokenCount: number;
            tokens: Array<{
                name: string;
                type: string;
                value: unknown;
                resolvedValue: unknown;
            }>;
        }>;
        themes: Array<{
            id: string;
            group: string;
            name: string;
            active: boolean;
            activeSetIds: string[];
            activeSetNames: string[];
        }>;
    } {
        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;

        return {
            sets: tokenCatalog.sets.map((set: any) => ({
                id: set.id,
                name: set.name,
                active: set.active,
                tokenCount: set.tokens.length,
                tokens: set.tokens.map((token: any) => ({
                    name: token.name,
                    type: token.type,
                    value: token.value,
                    resolvedValue: token.resolvedValue,
                })),
            })),
            themes: tokenCatalog.themes.map((theme: any) => ({
                id: theme.id,
                group: theme.group,
                name: theme.name,
                active: theme.active,
                activeSetIds: theme.activeSets.map((set: any) => set.id),
                activeSetNames: theme.activeSets.map((set: any) => set.name),
            })),
        };
    }

    public static async applyDesignTokensToShape(params: {
        shapeId: string;
        pageId?: string;
        assignments: Array<{
            tokenName: string;
            setName?: string;
            properties?: string[];
        }>;
    }): Promise<{
        shape: { id: string; name: string; type: string };
        assignments: Array<{
            tokenName: string;
            setName?: string;
            properties?: string[];
            applied: boolean;
            reason?: string;
        }>;
        tokens: Record<string, string>;
    }> {
        const page = params.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for token application");
        }

        const shape = this.findShapeOnPageById(page, params.shapeId);
        if (!shape) {
            throw new Error(`Shape not found: ${params.shapeId}`);
        }

        const resolveToken = (tokenName: string, setName?: string): any | null => {
            // @ts-ignore
            const tokenCatalog = penpot.library.local.tokens;
            if (setName) {
                const set = tokenCatalog.sets.find((entry: any) => entry.name === setName);
                if (!set) {
                    return null;
                }
                return set.tokens.find((entry: any) => entry.name === tokenName) ?? null;
            }

            return this.findTokenByName(tokenName);
        };

        const results = params.assignments.map((assignment) => {
            const token = resolveToken(assignment.tokenName, assignment.setName);
            if (!token) {
                return {
                    tokenName: assignment.tokenName,
                    setName: assignment.setName,
                    properties: assignment.properties,
                    applied: false,
                    reason: assignment.setName
                        ? `Token ${assignment.tokenName} not found in set ${assignment.setName}`
                        : `Token ${assignment.tokenName} not found`,
                };
            }

            const properties = this.normalizeTokenProperties(assignment.properties);
            (shape as any).applyToken(token, properties as any);

            return {
                tokenName: assignment.tokenName,
                setName: assignment.setName,
                properties,
                applied: true,
            };
        });

        await new Promise((resolve) => setTimeout(resolve, 320));
        const refreshedShape = this.findShapeOnPageById(page, params.shapeId) ?? shape;

        return {
            shape: {
                id: refreshedShape.id,
                name: refreshedShape.name,
                type: refreshedShape.type,
            },
            assignments: results,
            tokens: { ...(((refreshedShape as any).tokens ?? {}) as Record<string, string>) },
        };
    }

    public static inspectDesignTokenUsage(params?: {
        shapeId?: string;
        pageId?: string;
        includeSubtree?: boolean;
        includeCatalogMatches?: boolean;
    }): {
        page: { id: string; name: string };
        shapes: Array<{
            id: string;
            name: string;
            type: string;
            tokens: Record<string, string>;
            warnings: Array<{
                property: string;
                issue: string;
                currentValue: unknown;
                suggestedTokens?: string[];
            }>;
        }>;
    } {
        const page = params?.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for token usage inspection");
        }

        const normalizeColor = (value: unknown): string | null => {
            if (typeof value !== "string") {
                return null;
            }
            return value.trim().toLowerCase();
        };

        const normalizeNumber = (value: unknown): number | null => {
            if (typeof value === "number" && Number.isFinite(value)) {
                return value;
            }
            if (typeof value === "string" && value.trim() !== "") {
                const parsed = Number(value);
                return Number.isFinite(parsed) ? parsed : null;
            }
            return null;
        };

        const findMatchingTokens = (type: string, value: unknown): string[] => {
            // @ts-ignore
            const tokenCatalog = penpot.library.local.tokens;
            const matches: string[] = [];
            for (const set of tokenCatalog.sets) {
                for (const token of set.tokens) {
                    if (token.type !== type) {
                        continue;
                    }

                    if (type === "color") {
                        const tokenValue = normalizeColor(token.resolvedValue ?? token.value);
                        const currentValue = normalizeColor(value);
                        if (tokenValue && currentValue && tokenValue === currentValue) {
                            matches.push(token.name);
                        }
                        continue;
                    }

                    const tokenValue = normalizeNumber(token.resolvedValue ?? token.value);
                    const currentValue = normalizeNumber(value);
                    if (tokenValue !== null && currentValue !== null && tokenValue === currentValue) {
                        matches.push(token.name);
                    }
                }
            }
            return Array.from(new Set(matches));
        };

        const inspectShape = (shape: Shape) => {
            const warnings: Array<{
                property: string;
                issue: string;
                currentValue: unknown;
                suggestedTokens?: string[];
            }> = [];
            const tokens = { ...(((shape as any).tokens ?? {}) as Record<string, string>) };

            const warnIfHardcoded = (property: string, type: string, value: unknown) => {
                if (tokens[property]) {
                    return;
                }
                const suggestedTokens = params?.includeCatalogMatches === false ? [] : findMatchingTokens(type, value);
                warnings.push({
                    property,
                    issue: suggestedTokens.length
                        ? "Hardcoded value has matching tokens in the catalog"
                        : "Hardcoded value is not tokenized",
                    currentValue: value,
                    suggestedTokens: suggestedTokens.length ? suggestedTokens : undefined,
                });
            };

            if ("fills" in shape && Array.isArray(shape.fills) && shape.fills.length > 0) {
                const firstFill = shape.fills[0] as any;
                if (firstFill?.fillColor) {
                    warnIfHardcoded("fill", "color", firstFill.fillColor);
                }
            }

            if ("strokes" in shape && Array.isArray(shape.strokes) && shape.strokes.length > 0) {
                const firstStroke = shape.strokes[0] as any;
                if (firstStroke?.strokeColor) {
                    warnIfHardcoded("strokeColor", "color", firstStroke.strokeColor);
                }
                if (firstStroke?.strokeWidth !== undefined) {
                    warnIfHardcoded("strokeWidth", "borderWidth", firstStroke.strokeWidth);
                }
            }

            if ("borderRadius" in shape && typeof (shape as any).borderRadius === "number") {
                warnIfHardcoded("borderRadius", "borderRadius", (shape as any).borderRadius);
            }

            if ("opacity" in shape && typeof (shape as any).opacity === "number") {
                warnIfHardcoded("opacity", "opacity", (shape as any).opacity);
            }

            if ("fontSize" in shape && typeof (shape as any).fontSize === "string") {
                warnIfHardcoded("fontSize", "fontSizes", (shape as any).fontSize);
            }

            if ("fontWeight" in shape && typeof (shape as any).fontWeight === "string") {
                warnIfHardcoded("fontWeight", "fontWeights", (shape as any).fontWeight);
            }

            if ("letterSpacing" in shape && typeof (shape as any).letterSpacing === "string") {
                warnIfHardcoded("letterSpacing", "letterSpacing", (shape as any).letterSpacing);
            }

            if ("flex" in shape && shape.flex) {
                warnIfHardcoded("rowGap", "spacing", shape.flex.rowGap);
                warnIfHardcoded("columnGap", "spacing", shape.flex.columnGap);
            }

            return {
                id: shape.id,
                name: shape.name,
                type: shape.type,
                tokens,
                warnings,
            };
        };

        const rootShape = params?.shapeId ? this.findShapeOnPageById(page, params.shapeId) : page.root;
        if (!rootShape) {
            throw new Error(params?.shapeId ? `Shape not found: ${params.shapeId}` : "Page root not found");
        }

        const shapes: Shape[] = [];
        const collect = (shape: Shape) => {
            if (shape !== page.root || params?.shapeId) {
                shapes.push(shape);
            }
            if (!params?.includeSubtree) {
                return;
            }
            if (!("children" in shape) || !shape.children) {
                return;
            }
            for (const child of shape.children) {
                collect(child);
            }
        };

        collect(rootShape);

        return {
            page: {
                id: page.id,
                name: page.name,
            },
            shapes: shapes.map((shape) => inspectShape(shape)),
        };
    }

    public static inspectUnsafeConstructionPatterns(params?: {
        pageId?: string;
    }): {
        page: { id: string; name: string };
        summary: {
            topLevelCount: number;
            componentInstanceCount: number;
            rawBoardCount: number;
            tokenizedShapeCount: number;
            untokenizedShapeCount: number;
        };
        findings: Array<{
            severity: "high" | "medium" | "low";
            code: string;
            message: string;
            shapeId?: string;
            shapeName?: string;
        }>;
    } {
        const page = params?.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for construction safety inspection");
        }

        const topLevel = this.getPageRootChildren(page);
        const allShapes = this.findShapes((shape) => shape !== page.root, page.root);
        const componentInstances = allShapes.filter((shape) => shape.isComponentInstance());
        const tokenizedShapes = allShapes.filter((shape: any) => Object.keys((shape.tokens ?? {}) as Record<string, string>).length > 0);
        const rawBoards = allShapes.filter((shape) => shape.type === "board" && !shape.isComponentInstance());
        const findings: Array<{
            severity: "high" | "medium" | "low";
            code: string;
            message: string;
            shapeId?: string;
            shapeName?: string;
        }> = [];

        const isScreenPage = this.getPlainPageName(page.name).startsWith("Screens/");
        if (isScreenPage && componentInstances.length === 0 && rawBoards.length > 6) {
            findings.push({
                severity: "high",
                code: "screen-without-instances",
                message:
                    "This screen page is composed entirely of raw shapes/boards without component instances. Build reusable UI in _Components first, then place instances on the screen.",
            });
        }

        if (topLevel.length > 1) {
            findings.push({
                severity: "medium",
                code: "multiple-top-level-boards",
                message:
                    "This page has multiple top-level elements. For screens, prefer a single parent frame/board and keep floating extras to a minimum.",
            });
        }

        if (tokenizedShapes.length === 0 && allShapes.length > 10) {
            findings.push({
                severity: "medium",
                code: "untokenized-screen",
                message:
                    "The page contains many shapes but no applied design tokens. This usually indicates hardcoded fills/typography and makes design updates brittle.",
            });
        }

        if (this.getPlainPageName(page.name) === "_Components") {
            const localComponents = penpot.library.local.components as any[];
            const seen = new Map<string, string>();
            for (const component of localComponents) {
                const normalized = component.name.trim().toLowerCase();
                if (seen.has(normalized)) {
                    findings.push({
                        severity: "high",
                        code: "duplicate-local-component-name",
                        message: `Duplicate local component name detected: ${component.name}. Reuse one main component and use overrides or variants instead of cloning by content.`,
                        shapeId: component.mainInstance?.()?.id ?? undefined,
                        shapeName: component.name,
                    });
                } else {
                    seen.set(normalized, component.id);
                }
            }

            for (const component of localComponents) {
                const main = component.mainInstance?.();
                if (!main || main.type !== "board") {
                    continue;
                }
                const directTextChildren = ("children" in main ? main.children : []).filter((child: Shape) => child.type === "text");
                const directBoardChildren = ("children" in main ? main.children : []).filter((child: Shape) => child.type === "board");
                if (directTextChildren.length > 0 && directBoardChildren.length > 0) {
                    findings.push({
                        severity: "medium",
                        code: "text-directly-under-component-root",
                        message:
                            "This main component has text directly under the component root. Wrap text layers in an inner frame with layout so the component remains responsive.",
                        shapeId: main.id,
                        shapeName: main.name,
                    });
                }
            }
        }

        for (const shape of allShapes) {
            const layoutChild = (shape as any).layoutChild;
            if (!layoutChild) {
                continue;
            }
            const invalidCenter =
                layoutChild.verticalSizing === "center" || layoutChild.horizontalSizing === "center";
            if (invalidCenter) {
                findings.push({
                    severity: "high",
                    code: "invalid-layout-sizing",
                    message: "Found invalid layout sizing value `center`. Only `fix`, `auto`, or `fill` are safe here.",
                    shapeId: shape.id,
                    shapeName: shape.name,
                });
            }
        }

        return {
            page: { id: page.id, name: page.name },
            summary: {
                topLevelCount: topLevel.length,
                componentInstanceCount: componentInstances.length,
                rawBoardCount: rawBoards.length,
                tokenizedShapeCount: tokenizedShapes.length,
                untokenizedShapeCount: Math.max(0, allShapes.length - tokenizedShapes.length),
            },
            findings,
        };
    }

    public static ensureDesignTokenStructure(params: {
        setName?: string;
        themeGroup?: string;
        themeName?: string;
        attachSetToTheme?: boolean;
        activateSet?: boolean;
        activateTheme?: boolean;
    }): {
        set?: { id: string; name: string; active: boolean } | null;
        theme?: { id: string; group: string; name: string; active: boolean; activeSetIds: string[] } | null;
    } {
        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;

        let set = params.setName
            ? tokenCatalog.sets.find((entry: any) => entry.name === params.setName) ?? tokenCatalog.addSet({ name: params.setName })
            : null;

        let theme =
            params.themeName || params.themeGroup
                ? tokenCatalog.themes.find(
                      (entry: any) =>
                          (params.themeName ? entry.name === params.themeName : true) &&
                          (params.themeGroup ? entry.group === params.themeGroup : true)
                  ) ??
                  tokenCatalog.addTheme({
                      group: params.themeGroup ?? "",
                      name: params.themeName ?? "Default",
                  })
                : null;

        if (set && params.activateSet && !set.active) {
            set.toggleActive();
        }

        if (set && theme && params.attachSetToTheme !== false && !theme.activeSets.some((entry: any) => entry.id === set.id)) {
            theme.addSet(set);
        }

        if (theme && params.activateTheme && !theme.active) {
            theme.toggleActive();
        }

        return {
            set: set
                ? {
                      id: set.id,
                      name: set.name,
                      active: set.active,
                  }
                : null,
            theme: theme
                ? {
                      id: theme.id,
                      group: theme.group,
                      name: theme.name,
                      active: theme.active,
                      activeSetIds: theme.activeSets.map((entry: any) => entry.id),
                  }
                : null,
        };
    }

    public static upsertDesignToken(params: {
        setName: string;
        type:
            | "color"
            | "dimension"
            | "spacing"
            | "typography"
            | "shadow"
            | "opacity"
            | "borderRadius"
            | "borderWidth"
            | "fontWeights"
            | "fontSizes"
            | "fontFamilies"
            | "letterSpacing"
            | "number"
            | "rotation"
            | "sizing"
            | "textDecoration"
            | "textCase";
        name: string;
        value: unknown;
        description?: string;
        activateSet?: boolean;
    }): {
        set: { id: string; name: string; active: boolean };
        token: {
            id: string;
            name: string;
            type: string;
            value: unknown;
            resolvedValue: unknown;
            created: boolean;
        };
    } {
        const normalizeDesignTokenValue = (type: string, value: unknown): unknown => {
            if (
                type === "spacing" ||
                type === "borderRadius" ||
                type === "fontSizes" ||
                type === "dimension" ||
                type === "borderWidth" ||
                type === "letterSpacing" ||
                type === "opacity" ||
                type === "rotation" ||
                type === "sizing"
            ) {
                if (typeof value === "number") {
                    return String(value);
                }
            }

            if (type === "fontFamilies") {
                if (typeof value === "string") {
                    return [value];
                }
                if (Array.isArray(value)) {
                    return value.map((entry) => String(entry));
                }
            }

            if (type === "shadow") {
                if (typeof value === "string") {
                    return value;
                }

                if (!Array.isArray(value)) {
                    return value;
                }

                return value.map((entry) => {
                    if (!entry || typeof entry !== "object") {
                        return entry;
                    }

                    const shadow = entry as Record<string, unknown>;
                    const insetValue = shadow["inset"];
                    const normalizedInset =
                        typeof insetValue === "boolean"
                            ? insetValue
                            : typeof insetValue === "string"
                              ? insetValue.trim().toLowerCase() === "true"
                              : false;

                    return {
                        "offset-x": String(shadow["offset-x"] ?? shadow["offsetX"] ?? "0"),
                        "offset-y": String(shadow["offset-y"] ?? shadow["offsetY"] ?? "0"),
                        blur: String(shadow["blur"] ?? "0"),
                        spread: String(shadow["spread"] ?? "0"),
                        color: String(shadow["color"] ?? "#000000"),
                        inset: normalizedInset,
                    };
                });
            }

            if (type === "typography" && value && typeof value === "object" && !Array.isArray(value)) {
                const typography = value as Record<string, unknown>;
                return {
                    "font-family": typography["font-family"] ?? typography["fontFamilies"] ?? typography["fontFamily"],
                    "font-size": String(typography["font-size"] ?? typography["fontSizes"] ?? typography["fontSize"] ?? ""),
                    "font-weight": String(typography["font-weight"] ?? typography["fontWeights"] ?? typography["fontWeight"] ?? ""),
                    "line-height": String(typography["line-height"] ?? typography["lineHeight"] ?? ""),
                    "letter-spacing": String(typography["letter-spacing"] ?? typography["letterSpacing"] ?? ""),
                    "text-case": String(typography["text-case"] ?? typography["textCase"] ?? "none"),
                    "text-decoration": String(
                        typography["text-decoration"] ?? typography["textDecoration"] ?? "none"
                    ),
                };
            }

            return value;
        };

        // @ts-ignore
        const tokenCatalog = penpot.library.local.tokens;
        const set =
            tokenCatalog.sets.find((entry: any) => entry.name === params.setName) ??
            tokenCatalog.addSet({ name: params.setName });

        if (params.activateSet && !set.active) {
            set.toggleActive();
        }

        let token = set.tokens.find((entry: any) => entry.name === params.name);
        const created = !token;
        const normalizedValue = normalizeDesignTokenValue(params.type, params.value);
        if (!token) {
            token = set.addToken({
                type: params.type,
                name: params.name,
                // @ts-ignore token values are unioned in Penpot; we accept MCP-level JSON and pass through
                value: normalizedValue,
            });
        } else {
            token.value = normalizedValue;
        }

        if (typeof params.description === "string") {
            token.description = params.description;
        }

        return {
            set: {
                id: set.id,
                name: set.name,
                active: set.active,
            },
            token: {
                id: token.id,
                name: token.name,
                type: token.type,
                value: token.value,
                resolvedValue: token.resolvedValue,
                created,
            },
        };
    }

    public static createVariantGroupFromComponents(params: {
        componentIds: string[];
        propertyName?: string;
        variantValues?: string[];
        containerName?: string;
        pageId?: string;
        x?: number;
        y?: number;
    }): {
        variantContainer: {
            id: string;
            name: string;
            pageId: string | null;
            pageName: string | null;
        };
        propertyNames: string[];
        components: Array<{
            id: string;
            name: string;
            path: string;
            variantProps: Record<string, string>;
            variantError: string | null;
        }>;
    } {
        const page = params.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for variant creation");
        }

        penpot.openPage(page);

        const localComponents = penpot.library.local.components;
        const components = params.componentIds.map((componentId) => {
            const component = localComponents.find((entry: any) => entry.id === componentId);
            if (!component) {
                throw new Error(`Local component not found: ${componentId}`);
            }
            return component;
        });

        const mainInstances = components.map((component: any) => {
            const shape = component.mainInstance();
            if (!shape || shape.type !== "board") {
                throw new Error(`Component main instance is not a board: ${component.name}`);
            }
            return shape as Board;
        });

        const variantContainer = (penpot as any).createVariantFromComponents(mainInstances as any);
        if (params.containerName) {
            variantContainer.name = params.containerName;
        }
        if (typeof params.x === "number") {
            variantContainer.x = params.x;
        }
        if (typeof params.y === "number") {
            variantContainer.y = params.y;
        }

        const variants = variantContainer.variants;
        if (!variants) {
            throw new Error("Variant container created without variants metadata");
        }

        if (params.propertyName) {
            variants.renameProperty(0, params.propertyName);
        }

        const variantComponents = variants.variantComponents();
        if (params.variantValues && params.variantValues.length > 0) {
            for (const [index, component] of variantComponents.entries()) {
                const value = params.variantValues[index];
                if (value) {
                    (component as any).setVariantProperty(0, value);
                }
            }
        }

        return {
            variantContainer: {
                id: variantContainer.id,
                name: variantContainer.name,
                pageId: this.getPageForShape(variantContainer)?.id ?? null,
                pageName: this.getPageForShape(variantContainer)?.name ?? null,
            },
            propertyNames: [...variants.properties],
            components: variantComponents.map((component: any) => ({
                id: component.id,
                name: component.name,
                path: component.path,
                variantProps: component.variantProps,
                variantError: component.variantError || null,
            })),
        };
    }

    public static createWidgetTree(rootNode: WidgetNode, pageId?: string): WidgetTreeResult {
        const page = pageId ? this.getPageById(pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for widget creation");
        }

        penpot.openPage(page);
        const rootChildrenBefore = new Set<string>(this.getPageRootChildren(page).map((shape) => shape.id));
        const normalizedRoot = this.prepareWidgetNode(this.expandBlueprint(rootNode), [0], 0, DEFAULT_WIDGET_SPACING_SYSTEM);

        try {
            const result = this.instantiateWidgetNode(normalizedRoot, null, 0);
            return {
                root: result.summary,
                nodes: result.nodes,
            };
        } catch (error) {
            this.rollbackTopLevelWidgetCreation(page, rootChildrenBefore);
            throw error;
        }
    }

    public static readWidgetTree(shapeId: string): WidgetTreeResult | null {
        const shape = this.findShapeById(shapeId);
        if (!shape) {
            return null;
        }

        const nodes: WidgetTreeNodeResult[] = [];
        const walk = (current: Shape): WidgetTreeNodeResult => {
            const childIds = "children" in current && current.children ? current.children.map((child) => child.id) : [];
            const node: WidgetTreeNodeResult = {
                id: current.id,
                type: current.getPluginData(`${this.WIDGET_PLUGIN_PREFIX}.type`) || current.type,
                name: current.name || current.type,
                childIds,
            };
            nodes.push(node);
            if ("children" in current && current.children) {
                for (const child of current.children) {
                    walk(child);
                }
            }
            return node;
        };

        const root = walk(shape);
        return { root, nodes };
    }

    public static exportToFlutterTree(params?: { shapeId?: string; pageId?: string }): FlutterExportTree {
        const page = params?.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!penpot.currentFile) {
            throw new Error("No current file is active in the plugin context.");
        }
        if (!page) {
            throw new Error("No current page is active in the plugin context.");
        }

        const rootShape = params?.shapeId ? this.findShapeOnPageById(page, params.shapeId) : null;
        if (params?.shapeId && !rootShape) {
            throw new Error(`Shape not found on page: ${params.shapeId}`);
        }

        const nodes: FlutterExportNode[] = [];
        const walkShape = (shape: Shape, parentWidgetId?: string): FlutterExportNode => {
            const node = this.buildFlutterExportNode(shape, parentWidgetId);
            nodes.push(node);

            if ("children" in shape && shape.children?.length) {
                node.children = shape.children.map((child) => walkShape(child, node.widgetId));
            }

            return node;
        };

        const root: FlutterExportNode = rootShape
            ? walkShape(rootShape)
            : {
                  widgetId: `page-${page.id}`,
                  widgetType: "page",
                  displayName: page.name,
                  sourceShapeId: page.root.id,
                  children: (((page.root as Shape & { children?: Shape[] }).children ?? []) as Shape[]).map((child: Shape) =>
                      walkShape(child, `page-${page.id}`)
                  ),
              };

        if (!rootShape) {
            nodes.unshift(root);
        }

        return { designSystem: this.readDesignSystemMetadata(page), root, nodes };
    }

    public static diagnoseExportShape(params: { shapeId?: string; pageId?: string }): {
        page: { id: string; name: string } | null;
        shape: { id: string; name: string; type: string } | null;
        bounds: { x: number; y: number; width: number; height: number } | null;
        descendantCount: number;
        componentInstanceCount: number;
        hasSvgRawDescendants: boolean;
        hasImageFillDescendants: boolean;
        exportCandidates: Array<{ id: string; name: string; type: string; descendantCount: number }>;
    } {
        const page = params.pageId ? this.getPageById(params.pageId) : penpot.currentPage;
        if (!page) {
            throw new Error("No active page available for export diagnosis");
        }
        const shape = params.shapeId ? this.findShapeOnPageById(page, params.shapeId) : (page.root as Shape);
        if (!shape) {
            throw new Error(`Shape not found on page: ${params.shapeId}`);
        }

        const descendants = this.findShapes((entry) => entry.id !== shape.id, shape);
        const exportCandidates = [shape, ...descendants]
            .filter((entry) => entry.type === "board" || entry.type === "group" || entry.type === "rectangle")
            .map((entry) => ({
                id: entry.id,
                name: entry.name || entry.type,
                type: entry.type,
                descendantCount: this.findShapes((child) => child.id !== entry.id, entry).length,
            }))
            .sort((a, b) => {
                const typeRank = (value: string) => (value === "board" ? 0 : value === "group" ? 1 : 2);
                const rankDelta = typeRank(a.type) - typeRank(b.type);
                if (rankDelta !== 0) {
                    return rankDelta;
                }
                return b.descendantCount - a.descendantCount;
            })
            .slice(0, 20);

        return {
            page: { id: page.id, name: page.name },
            shape: { id: shape.id, name: shape.name, type: shape.type },
            bounds: (() => {
                const bounds = this.getBounds(shape);
                return bounds ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } : null;
            })(),
            descendantCount: descendants.length,
            componentInstanceCount: descendants.filter((entry) => entry.isComponentInstance()).length,
            hasSvgRawDescendants: descendants.some((entry) => entry.type === "svg-raw"),
            hasImageFillDescendants: descendants.some(
                (entry: any) => Array.isArray(entry.fills) && entry.fills.some((fill: any) => fill?.fillImage)
            ),
            exportCandidates,
        };
    }

    public static setDesignSystemMetadata(metadata: DesignSystemMetadata): DesignSystemMetadata {
        const page = penpot.currentPage;
        if (!page) {
            throw new Error("No current page is active in the plugin context.");
        }

        const prefix = this.DESIGN_SYSTEM_PLUGIN_PREFIX;
        page.root.setPluginData(`${prefix}.name`, metadata.name);
        page.root.setPluginData(`${prefix}.namingConvention`, metadata.namingConvention);
        page.root.setPluginData(`${prefix}.scaleType`, metadata.scaleType);

        if (metadata.theme) {
            page.root.setPluginData(`${prefix}.theme`, metadata.theme);
        }
        if (metadata.set) {
            page.root.setPluginData(`${prefix}.set`, metadata.set);
        }
        if (metadata.setNames) {
            page.root.setPluginData(`${prefix}.setNames`, JSON.stringify(metadata.setNames));
        }
        if (metadata.themeNames) {
            page.root.setPluginData(`${prefix}.themeNames`, JSON.stringify(metadata.themeNames));
        }

        return this.readDesignSystemMetadata(page) as DesignSystemMetadata;
    }

    public static readDesignSystemMetadata(page?: Page | null): DesignSystemMetadata | undefined {
        const currentPage = page ?? penpot.currentPage;
        if (!currentPage) {
            return undefined;
        }

        const prefix = this.DESIGN_SYSTEM_PLUGIN_PREFIX;
        const parseJson = <T>(raw: string): T | undefined => {
            try {
                return JSON.parse(raw) as T;
            } catch (_error) {
                return undefined;
            }
        };

        const name = currentPage.root.getPluginData(`${prefix}.name`);
        const namingConvention = currentPage.root.getPluginData(`${prefix}.namingConvention`) as DesignSystemMetadata["namingConvention"] | "";
        const scaleType = currentPage.root.getPluginData(`${prefix}.scaleType`) as DesignSystemMetadata["scaleType"] | "";

        if (!name || !namingConvention || !scaleType) {
            return undefined;
        }

        return {
            name,
            namingConvention,
            scaleType,
            theme: currentPage.root.getPluginData(`${prefix}.theme`) || undefined,
            set: currentPage.root.getPluginData(`${prefix}.set`) || undefined,
            setNames: (() => {
                const raw = currentPage.root.getPluginData(`${prefix}.setNames`);
                return raw ? parseJson<string[]>(raw) : undefined;
            })(),
            themeNames: (() => {
                const raw = currentPage.root.getPluginData(`${prefix}.themeNames`);
                return raw ? parseJson<string[]>(raw) : undefined;
            })(),
        };
    }

    private static instantiateWidgetNode(
        node: WidgetNode,
        parent: Board | null,
        childIndex: number
    ): { rootShape: Shape; summary: WidgetTreeNodeResult; nodes: WidgetTreeNodeResult[] } {
        const shape = this.createShapeForWidgetNode(node, childIndex);

        if (parent) {
            parent.appendChild(shape);
        }

        this.applyWidgetMetadata(shape, node, parent);
        this.applyWidgetSizing(shape, node.layout);
        this.applyWidgetStyle(shape, node.style);
        this.applyWidgetChildLayout(shape, node, parent);

        const childSummaries: WidgetTreeNodeResult[] = [];
        if (shape.type === "board" && node.children && node.children.length > 0) {
            for (const [index, child] of node.children.entries()) {
                const childNode = this.expandBlueprint(child);
                const childResult = this.instantiateWidgetNode(childNode, shape as Board, index);
                childSummaries.push(...childResult.nodes);
            }
        }

        if (shape.type === "board" && node.layout) {
            this.applyWidgetLayout(shape as Board, node.layout);
        }

        if (node.tokens) {
            this.applyWidgetTokens(shape, node.tokens);
        }

        const summary: WidgetTreeNodeResult = {
            id: shape.id,
            type: node.type,
            name: shape.name || node.type,
            childIds: childSummaries
                .filter((entry) => {
                    if (!(shape.type === "board" && "children" in shape && shape.children)) {
                        return false;
                    }
                    return shape.children.some((child) => child.id === entry.id);
                })
                .map((entry) => entry.id),
        };

        return {
            rootShape: shape,
            summary,
            nodes: [summary, ...childSummaries],
        };
    }

    private static createShapeForWidgetNode(node: WidgetNode, childIndex: number): Shape {
        switch (node.type) {
            case "text":
                return this.createTextNode(node, childIndex);
            case "rectangle":
                return this.createRectangleNode(node, childIndex);
            default:
                return this.createBoardNode(node, childIndex);
        }
    }

    private static createBoardNode(node: WidgetNode, childIndex: number): Board {
        const board = penpot.createBoard();
        board.name = this.getWidgetDisplayName(node);
        board.x = node.props?.x ?? 80 + childIndex * 24;
        board.y = node.props?.y ?? 80 + childIndex * 24;
        board.resize(node.props?.width ?? 320, node.props?.height ?? 180);
        board.fills = node.style?.fills ?? [{ fillColor: "#FFFFFF", fillOpacity: 1 }];
        if (typeof node.style?.radius === "number") {
            board.borderRadius = node.style.radius;
        }
        return board;
    }

    private static createRectangleNode(node: WidgetNode, childIndex: number): Rectangle {
        const rect = penpot.createRectangle();
        rect.name = this.getWidgetDisplayName(node);
        rect.x = node.props?.x ?? 80 + childIndex * 24;
        rect.y = node.props?.y ?? 80 + childIndex * 24;
        rect.resize(node.props?.width ?? 160, node.props?.height ?? 120);
        rect.fills = node.style?.fills ?? [{ fillColor: "#FFFFFF", fillOpacity: 1 }];
        if (typeof node.style?.radius === "number") {
            rect.borderRadius = node.style.radius;
        }
        return rect;
    }

    private static createTextNode(node: WidgetNode, childIndex: number): Text {
        const text = penpot.createText(String(node.props?.text ?? node.name ?? ""));
        if (!text) {
            throw new Error(`Could not create text for widget type '${node.type}'`);
        }
        text.name = this.getWidgetDisplayName(node);
        text.x = node.props?.x ?? 80 + childIndex * 16;
        text.y = node.props?.y ?? 80 + childIndex * 16;
        if (typeof node.props?.fontSize === "number") {
            text.fontSize = String(node.props.fontSize);
        }
        if (typeof node.props?.fontFamily === "string") {
            text.fontFamily = node.props.fontFamily;
        }
        if (node.props?.fontStyle === "normal" || node.props?.fontStyle === "italic") {
            text.fontStyle = node.props.fontStyle;
        }
        if (typeof node.props?.fontWeight === "string" || typeof node.props?.fontWeight === "number") {
            this.applySafeFontWeight(text, node.props.fontWeight);
        }
        text.fills = node.style?.fills ?? [{ fillColor: "#111827", fillOpacity: 1 }];
        return text;
    }

    private static applyWidgetTokens(shape: Shape, tokens: Record<string, string>): void {
        for (const [property, tokenName] of Object.entries(tokens)) {
            const token = this.findTokenByName(tokenName);
            if (!token) {
                continue;
            }

            const normalizedProperties = this.normalizeTokenProperties([property]);
            (shape as any).applyToken(token, normalizedProperties as any);
        }
    }

    private static applySafeFontWeight(text: Text, requestedWeight: string | number): void {
        const normalizedRequestedWeight = this.normalizeFontWeightAlias(requestedWeight);
        const font = this.getFontForText(text);
        if (!font) {
            return;
        }

        const preferredStyle = text.fontStyle ?? "normal";
        const exactVariant =
            font.variants.find(
                (variant: any) =>
                    this.normalizeFontWeightAlias(variant.fontWeight) === normalizedRequestedWeight &&
                    variant.fontStyle === preferredStyle
            ) ??
            font.variants.find((variant: any) => this.normalizeFontWeightAlias(variant.fontWeight) === normalizedRequestedWeight) ??
            this.findClosestFontVariant(font.variants, normalizedRequestedWeight, preferredStyle);

        if (exactVariant) {
            font.applyToText(text, exactVariant);
            return;
        }
    }

    private static getFontForText(text: Text): any | null {
        const fontId = (text as any).fontId;
        if (typeof fontId === "string" && fontId) {
            const byId = penpot.fonts.findById(fontId);
            if (byId) {
                return byId;
            }
        }

        const fontFamily = text.fontFamily;
        if (fontFamily) {
            const byName = penpot.fonts.findByName(fontFamily);
            if (byName) {
                return byName;
            }
        }

        return null;
    }

    private static findClosestFontVariant(
        variants: Array<{ name: string; fontVariantId: string; fontWeight: string; fontStyle: "normal" | "italic" }>,
        requestedWeight: string,
        preferredStyle: string
    ): { name: string; fontVariantId: string; fontWeight: string; fontStyle: "normal" | "italic" } | null {
        const requestedNumeric = this.fontWeightToNumeric(requestedWeight);
        const sorted = [...variants]
            .filter((variant) => variant.fontStyle === preferredStyle || variants.every((entry) => entry.fontStyle !== preferredStyle))
            .sort((a, b) => {
                const distanceA = Math.abs(this.fontWeightToNumeric(a.fontWeight) - requestedNumeric);
                const distanceB = Math.abs(this.fontWeightToNumeric(b.fontWeight) - requestedNumeric);
                return distanceA - distanceB;
            });

        return sorted[0] ?? variants[0] ?? null;
    }

    private static normalizeFontWeightAlias(weight: string | number): string {
        const raw = String(weight).trim().toLowerCase();
        const aliases: Record<string, string> = {
            thin: "100",
            hairline: "100",
            extralight: "200",
            "extra-light": "200",
            ultralight: "200",
            "ultra-light": "200",
            light: "300",
            normal: "400",
            regular: "400",
            book: "400",
            medium: "500",
            semibold: "600",
            "semi-bold": "600",
            demi: "600",
            demibold: "600",
            "demi-bold": "600",
            bold: "700",
            extrabold: "800",
            "extra-bold": "800",
            ultrabold: "800",
            "ultra-bold": "800",
            black: "900",
            heavy: "900",
        };

        return aliases[raw] ?? raw;
    }

    private static fontWeightToNumeric(weight: string): number {
        const normalized = this.normalizeFontWeightAlias(weight);
        const numeric = Number.parseInt(normalized, 10);
        if (!Number.isNaN(numeric)) {
            return numeric;
        }

        return 400;
    }

    private static applyWidgetMetadata(shape: Shape, node: WidgetNode, parent: Board | null): void {
        const page = penpot.currentPage;
        const sequence = page ? this.allocateNextWidgetSequence(page) : null;
        const plainName = this.getPlainWidgetName(node.name || this.humanizeType(node.type));
        shape.name = this.ensureWidgetDisplayName(
            plainName,
            node.id || this.slugify(node.name || node.type),
            sequence
        );

        const metadata: Record<string, string> = {
            [`${this.WIDGET_PLUGIN_PREFIX}.type`]: node.type,
            [`${this.WIDGET_PLUGIN_PREFIX}.version`]: "1",
            [`${this.WIDGET_PLUGIN_PREFIX}.name`]: plainName,
        };

        metadata[`${this.WIDGET_PLUGIN_PREFIX}.id`] = node.id || this.slugify(node.name || node.type);
        if (sequence !== null) {
            metadata[this.WIDGET_SEQUENCE_KEY] = String(sequence);
        }
        if (parent) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.parentId`] = parent.id;
        }
        if (node.role) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.role`] = node.role;
        }
        if (node.slot) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.slot`] = node.slot;
        }
        if (node.props) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.props`] = JSON.stringify(node.props);
        }
        if (node.tokens) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.tokens`] = JSON.stringify(node.tokens);
        }
        if (node.responsive) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.responsive`] = JSON.stringify(node.responsive);
        }
        if (node.layout) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.layout`] = JSON.stringify(node.layout);
        }
        if (node.childLayout) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.childLayout`] = JSON.stringify(node.childLayout);
        }
        if (node.props?.spacingSystem) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.spacingSystem`] = JSON.stringify(node.props.spacingSystem);
        }

        for (const [key, value] of Object.entries(metadata)) {
            shape.setPluginData(key, value);
        }
    }

    private static applyWidgetSizing(shape: Shape, layout?: WidgetLayoutSpec): void {
        if (!layout || shape.type !== "board") {
            return;
        }

        const board = shape as Board;
        if (layout.width === "hug") {
            board.horizontalSizing = "auto";
        } else {
            board.horizontalSizing = "fix";
        }
        if (layout.height === "hug") {
            board.verticalSizing = "auto";
        } else {
            board.verticalSizing = "fix";
        }
    }

    private static applyWidgetStyle(shape: Shape, style?: WidgetNode["style"]): void {
        if (!style) {
            return;
        }

        if ("fills" in shape && style.fills) {
            shape.fills = style.fills;
        }
        if ("borderRadius" in shape && typeof style.radius === "number") {
            // @ts-ignore borderRadius is shared by board/rectangle shape types
            shape.borderRadius = style.radius;
        }
    }

    private static applyWidgetChildLayout(shape: Shape, node: WidgetNode, parent: Board | null): void {
        if (!parent || (!parent.flex && !parent.grid)) {
            return;
        }

        const layoutChild = (shape as any).layoutChild;
        if (!layoutChild) {
            return;
        }

        const childLayout = node.childLayout ?? {};
        layoutChild.absolute = childLayout.absolute ?? false;
        layoutChild.horizontalSizing = this.resolveChildHorizontalSizing(shape, node, childLayout);
        layoutChild.verticalSizing = this.resolveChildVerticalSizing(shape, node, childLayout);

        if (childLayout.alignSelf) {
            layoutChild.alignSelf = childLayout.alignSelf;
        }
        if (typeof childLayout.horizontalMargin === "number") {
            layoutChild.horizontalMargin = childLayout.horizontalMargin;
        }
        if (typeof childLayout.verticalMargin === "number") {
            layoutChild.verticalMargin = childLayout.verticalMargin;
        }
        if (typeof childLayout.topMargin === "number") {
            layoutChild.topMargin = childLayout.topMargin;
        }
        if (typeof childLayout.rightMargin === "number") {
            layoutChild.rightMargin = childLayout.rightMargin;
        }
        if (typeof childLayout.bottomMargin === "number") {
            layoutChild.bottomMargin = childLayout.bottomMargin;
        }
        if (typeof childLayout.leftMargin === "number") {
            layoutChild.leftMargin = childLayout.leftMargin;
        }
        if ("minWidth" in childLayout) {
            layoutChild.minWidth = childLayout.minWidth ?? null;
        }
        if ("maxWidth" in childLayout) {
            layoutChild.maxWidth = childLayout.maxWidth ?? null;
        }
        if ("minHeight" in childLayout) {
            layoutChild.minHeight = childLayout.minHeight ?? null;
        }
        if ("maxHeight" in childLayout) {
            layoutChild.maxHeight = childLayout.maxHeight ?? null;
        }
    }

    private static fitShapeWithinContainer(
        shape: Shape,
        targetShape: Shape,
        fit: "none" | "contain" | "fill-width" | "fill-height" | "stretch",
        inset: number
    ): void {
        if (fit === "none") {
            return;
        }

        const resize = (shape as any).resize;
        const shapeBounds = (shape as any).bounds;
        const targetBounds = (targetShape as any).bounds;
        if (typeof resize !== "function" || !shapeBounds || !targetBounds) {
            return;
        }

        const availableWidth = Math.max(targetBounds.width - inset * 2, 1);
        const availableHeight = Math.max(targetBounds.height - inset * 2, 1);
        const currentWidth = Math.max(shapeBounds.width, 1);
        const currentHeight = Math.max(shapeBounds.height, 1);

        let width = currentWidth;
        let height = currentHeight;

        switch (fit) {
            case "stretch":
                width = availableWidth;
                height = availableHeight;
                break;
            case "fill-width": {
                const scale = availableWidth / currentWidth;
                width = availableWidth;
                height = Math.max(currentHeight * scale, 1);
                break;
            }
            case "fill-height": {
                const scale = availableHeight / currentHeight;
                width = Math.max(currentWidth * scale, 1);
                height = availableHeight;
                break;
            }
            case "contain": {
                const scale = Math.min(availableWidth / currentWidth, availableHeight / currentHeight);
                width = Math.max(currentWidth * scale, 1);
                height = Math.max(currentHeight * scale, 1);
                break;
            }
        }

        resize.call(shape, width, height);
    }

    private static ensureSlotContainerLayout(container: Board, inset: number): void {
        const padding = Math.max(inset, DEFAULT_WIDGET_SPACING_SYSTEM.xs);

        if (!container.flex && !container.grid) {
            const flex = this.addFlexLayout(container, "row");
            flex.wrap = "nowrap";
            flex.alignItems = "center";
            flex.justifyContent = "center";
            flex.rowGap = 0;
            flex.columnGap = 0;
            flex.topPadding = padding;
            flex.rightPadding = padding;
            flex.bottomPadding = padding;
            flex.leftPadding = padding;
            return;
        }

        if (container.flex) {
            container.flex.alignItems = "center";
            container.flex.justifyContent = "center";
            container.flex.topPadding = Math.max(container.flex.topPadding ?? 0, padding);
            container.flex.rightPadding = Math.max(container.flex.rightPadding ?? 0, padding);
            container.flex.bottomPadding = Math.max(container.flex.bottomPadding ?? 0, padding);
            container.flex.leftPadding = Math.max(container.flex.leftPadding ?? 0, padding);
        }
    }

    private static inferLibrarySlotPlacement(match: LibraryComponentSummary): {
        childLayout: WidgetChildLayoutSpec;
        fit: "none" | "contain" | "fill-width" | "fill-height" | "stretch";
        inset: number;
    } {
        const descriptor = `${match.componentPath ?? ""} ${match.componentName}`.toLowerCase();

        if (descriptor.includes("input")) {
            return {
                childLayout: {
                    absolute: false,
                    horizontalSizing: "fill",
                    verticalSizing: "auto",
                    alignSelf: "stretch",
                },
                fit: "fill-width",
                inset: DEFAULT_WIDGET_SPACING_SYSTEM.xs,
            };
        }

        if (descriptor.includes("tabs")) {
            return {
                childLayout: {
                    absolute: false,
                    horizontalSizing: "auto",
                    verticalSizing: "auto",
                    alignSelf: "center",
                },
                fit: "contain",
                inset: DEFAULT_WIDGET_SPACING_SYSTEM.xs,
            };
        }

        if (descriptor.includes("avatar") || descriptor.includes("icon")) {
            return {
                childLayout: {
                    absolute: false,
                    horizontalSizing: "auto",
                    verticalSizing: "auto",
                    alignSelf: "center",
                },
                fit: "contain",
                inset: DEFAULT_WIDGET_SPACING_SYSTEM.xxs,
            };
        }

        return {
            childLayout: {
                absolute: false,
                horizontalSizing: "auto",
                verticalSizing: "auto",
                alignSelf: "center",
            },
            fit: "contain",
            inset: DEFAULT_WIDGET_SPACING_SYSTEM.xs,
        };
    }

    private static resolveChildHorizontalSizing(
        shape: Shape,
        node: WidgetNode,
        childLayout: WidgetChildLayoutSpec
    ): "fill" | "auto" | "fix" {
        if (childLayout.horizontalSizing) {
            return childLayout.horizontalSizing;
        }
        if (node.layout?.width === "fill") {
            return "fill";
        }
        if (node.layout?.width === "hug") {
            return "auto";
        }
        if (shape.type === "text") {
            return "auto";
        }
        return "fix";
    }

    private static resolveChildVerticalSizing(
        shape: Shape,
        node: WidgetNode,
        childLayout: WidgetChildLayoutSpec
    ): "fill" | "auto" | "fix" {
        if (childLayout.verticalSizing) {
            return childLayout.verticalSizing;
        }
        if (node.layout?.height === "fill") {
            return "fill";
        }
        if (node.layout?.height === "hug") {
            return "auto";
        }
        if (shape.type === "text") {
            return "auto";
        }
        return "fix";
    }

    private static applyWidgetLayout(container: Board, layout: WidgetLayoutSpec): void {
        if (layout.kind === "row" || layout.kind === "column") {
            const flex = this.addFlexLayout(container, layout.kind);
            flex.wrap = layout.wrap ?? "nowrap";
            if (layout.align) {
                flex.alignItems = layout.align;
            }
            if (layout.justifyContent) {
                flex.justifyContent = layout.justifyContent;
            }
            flex.rowGap = layout.gap ?? 0;
            flex.columnGap = layout.gap ?? 0;
            this.applyLayoutPadding(flex, layout.padding);
            if (layout.width === "fill") {
                flex.horizontalSizing = "fill";
            } else if (layout.width === "hug") {
                flex.horizontalSizing = "auto";
            }
            if (layout.height === "fill") {
                flex.verticalSizing = "fill";
            } else if (layout.height === "hug") {
                flex.verticalSizing = "auto";
            }
            return;
        }

        if (layout.kind === "grid") {
            const grid = container.addGridLayout();
            grid.dir = "row";
            grid.rowGap = layout.gap ?? 0;
            grid.columnGap = layout.gap ?? 0;
            this.applyLayoutPadding(grid, layout.padding);
            const columns = Math.max(1, layout.columns ?? 2);
            const childCount = container.children?.length ?? 0;
            const rows = Math.max(1, Math.ceil(childCount / columns));
            for (let col = 0; col < columns; col++) {
                grid.addColumn("flex", 1);
            }
            for (let row = 0; row < rows; row++) {
                grid.addRow("auto");
            }
            container.children.forEach((child, index) => {
                const row = Math.floor(index / columns);
                const column = index % columns;
                grid.appendChild(child, row, column);
            });
        }
    }

    private static applyLayoutPadding(layout: FlexLayout | GridLayout, padding?: number | WidgetPadding): void {
        if (padding === undefined) {
            return;
        }

        if (typeof padding === "number") {
            layout.topPadding = padding;
            layout.rightPadding = padding;
            layout.bottomPadding = padding;
            layout.leftPadding = padding;
            return;
        }

        layout.topPadding = padding.top;
        layout.rightPadding = padding.right;
        layout.bottomPadding = padding.bottom;
        layout.leftPadding = padding.left;
    }

    private static prepareWidgetNode(
        node: WidgetNode,
        path: number[],
        depth: number,
        spacingSystem: WidgetSpacingSystem
    ): WidgetNode {
        const nodeSpacingSystem = this.resolveSpacingSystem(node, spacingSystem);
        const ensuredId = node.id || this.buildWidgetId(node, path);
        const ensuredName = this.getPlainWidgetName(node.name || this.humanizeType(node.type));
        const preparedChildren = node.children?.map((child, index) =>
            this.prepareWidgetNode(child, [...path, index], depth + 1, nodeSpacingSystem)
        );

        const preparedNode: WidgetNode = {
            ...node,
            id: ensuredId,
            name: ensuredName,
            role: node.role ?? this.inferWidgetRole(node),
            slot: node.slot,
            props: {
                ...(node.props ?? {}),
                ...(depth === 0 ? { spacingSystem: nodeSpacingSystem } : {}),
            },
            children: preparedChildren,
        };

        preparedNode.layout = this.normalizeWidgetLayout(preparedNode, depth, nodeSpacingSystem);

        if (!preparedNode.childLayout && depth > 0) {
            preparedNode.childLayout = this.defaultChildLayoutForNode(preparedNode);
        }

        return preparedNode;
    }

    private static resolveSpacingSystem(node: WidgetNode, fallback: WidgetSpacingSystem): WidgetSpacingSystem {
        const raw = node.props?.spacingSystem;
        if (!raw || typeof raw !== "object") {
            return fallback;
        }

        return {
            xxs: typeof raw.xxs === "number" ? raw.xxs : fallback.xxs,
            xs: typeof raw.xs === "number" ? raw.xs : fallback.xs,
            sm: typeof raw.sm === "number" ? raw.sm : fallback.sm,
            md: typeof raw.md === "number" ? raw.md : fallback.md,
            lg: typeof raw.lg === "number" ? raw.lg : fallback.lg,
            xl: typeof raw.xl === "number" ? raw.xl : fallback.xl,
            xxl: typeof raw.xxl === "number" ? raw.xxl : fallback.xxl,
        };
    }

    private static normalizeWidgetLayout(
        node: WidgetNode,
        depth: number,
        spacingSystem: WidgetSpacingSystem
    ): WidgetLayoutSpec | undefined {
        const layout = node.layout ? { ...node.layout } : this.inferDefaultLayout(node, depth, spacingSystem);
        if (!layout) {
            return undefined;
        }
        const semanticName = `${node.type} ${node.name}`.toLowerCase();

        if (layout.gap === undefined && (layout.kind === "row" || layout.kind === "column" || layout.kind === "grid")) {
            layout.gap = semanticName.includes("toolbar") ? spacingSystem.xs : spacingSystem.md;
        }

        if (layout.padding === undefined && layout.kind !== "stack") {
            if (depth === 0) {
                layout.padding = spacingSystem.lg;
            } else if (
                /header|toolbar|panel|card|slot|block|section|shell|content|stack|row/.test(semanticName) ||
                (node.children?.length ?? 0) > 0
            ) {
                layout.padding = semanticName.includes("slot") ? spacingSystem.xs : spacingSystem.md;
            }
        }

        return layout;
    }

    private static inferDefaultLayout(
        node: WidgetNode,
        depth: number,
        spacingSystem: WidgetSpacingSystem
    ): WidgetLayoutSpec | undefined {
        if (node.type !== "board") {
            return undefined;
        }

        const semanticName = `${node.name ?? ""} ${node.role ?? ""} ${node.slot ?? ""}`.toLowerCase();
        const hasChildren = (node.children?.length ?? 0) > 0;

        if (!hasChildren && !semanticName.includes("slot")) {
            return undefined;
        }

        if (semanticName.includes("slot")) {
            return {
                kind: "row",
                gap: 0,
                padding: spacingSystem.xs,
                align: "center",
                justifyContent: "center",
            };
        }

        if (/toolbar|actions|tabs|metrics|row/.test(semanticName)) {
            return {
                kind: "row",
                gap: semanticName.includes("toolbar") ? spacingSystem.xs : spacingSystem.md,
                padding: depth === 0 ? spacingSystem.lg : spacingSystem.md,
                align: "center",
            };
        }

        return {
            kind: "column",
            gap: spacingSystem.md,
            padding: depth === 0 ? spacingSystem.lg : spacingSystem.md,
        };
    }

    private static inferWidgetRole(node: WidgetNode): string | undefined {
        const semanticName = `${node.type} ${node.name ?? ""}`.toLowerCase();

        if (semanticName.includes("slot")) {
            return "slot";
        }
        if (semanticName.includes("header")) {
            return "header";
        }
        if (semanticName.includes("toolbar")) {
            return "toolbar";
        }
        if (semanticName.includes("card")) {
            return "card";
        }
        if (semanticName.includes("panel")) {
            return "panel";
        }
        if (semanticName.includes("dashboard")) {
            return "dashboard";
        }
        if (node.type === "board" && (node.children?.length ?? 0) > 0) {
            return "container";
        }

        return undefined;
    }

    private static defaultChildLayoutForNode(node: WidgetNode): WidgetChildLayoutSpec {
        if (node.type === "text") {
            return {
                absolute: false,
                horizontalSizing: "auto",
                verticalSizing: "auto",
            };
        }

        if (node.type === "rectangle") {
            return {
                absolute: false,
                horizontalSizing: "fill",
                verticalSizing: "fix",
                alignSelf: "stretch",
            };
        }

        return {
            absolute: false,
            horizontalSizing: "fill",
            verticalSizing: "auto",
            alignSelf: "stretch",
        };
    }

    private static buildWidgetId(node: WidgetNode, path: number[]): string {
        return `${this.slugify(node.name || node.type)}-${path.join("-")}`;
    }

    private static applyRuntimeIdentityMetadata(
        shape: Shape,
        identity: {
            type: string;
            name: string;
            semanticId: string;
            sourceLibrary?: string;
            sourceComponentId?: string;
            sourceComponentName?: string;
            sourceComponentPath?: string | null;
        },
        page: Page,
        parent: Board | null
    ): void {
        const sequence = this.allocateNextWidgetSequence(page);
        shape.name = this.ensureWidgetDisplayName(identity.name, identity.semanticId, sequence);
        shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.type`, identity.type);
        shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.id`, identity.semanticId);
        shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.name`, identity.name);
        shape.setPluginData(this.WIDGET_SEQUENCE_KEY, String(sequence));
        if (parent) {
            shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.parentId`, parent.id);
        }
        if (identity.sourceLibrary) {
            shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.sourceLibrary`, identity.sourceLibrary);
        }
        if (identity.sourceComponentId) {
            shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.sourceComponentId`, identity.sourceComponentId);
        }
        if (identity.sourceComponentName) {
            shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.sourceComponentName`, identity.sourceComponentName);
        }
        if (identity.sourceComponentPath) {
            shape.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.sourceComponentPath`, identity.sourceComponentPath);
        }
    }

    private static allocateNextWidgetSequence(page: Page): number {
        const shapes = this.findShapes(() => true, page.root);
        let maxSequence = 0;

        for (const shape of shapes) {
            const raw = shape.getPluginData(this.WIDGET_SEQUENCE_KEY);
            const numeric = Number(raw);
            if (Number.isFinite(numeric) && numeric > maxSequence) {
                maxSequence = numeric;
            }
        }

        return maxSequence + 1;
    }

    private static rollbackTopLevelWidgetCreation(page: Page, rootChildrenBefore: Set<string>): void {
        for (const shape of this.getPageRootChildren(page)) {
            if (rootChildrenBefore.has(shape.id)) {
                continue;
            }

            try {
                shape.remove();
            } catch (_error) {
                // ignore and continue with the fallback below
            }

            const stillPresent = this.getPageRootChildren(page).some((candidate) => candidate.id === shape.id);
            if (stillPresent) {
                shape.hidden = true;
                shape.name = `[ROLLBACK FAILED] ${shape.name}`;
            }
        }
    }

    private static getPageRootChildren(page: Page): Shape[] {
        const root = page.root as Shape & { children?: Shape[] };
        return [...(root.children ?? [])];
    }

    private static getWidgetDisplayName(node: WidgetNode): string {
        return this.ensureWidgetDisplayName(
            this.getPlainWidgetName(node.name || this.humanizeType(node.type)),
            node.id || this.slugify(node.type)
        );
    }

    private static ensureWidgetDisplayName(name: string, id: string, sequence?: number | null): string {
        const suffix = sequence !== undefined && sequence !== null ? ` [#${sequence} | ${id}]` : ` [${id}]`;
        const plainName = this.getPlainWidgetName(name);
        return plainName.endsWith(suffix) ? plainName : `${plainName}${suffix}`;
    }

    private static ensurePageDisplayName(name: string, sequence?: number | null): string {
        const plainName = this.getPlainPageName(name);
        if (sequence === undefined || sequence === null) {
            return plainName;
        }
        const suffix = ` [#${sequence}]`;
        return plainName.endsWith(suffix) ? plainName : `${plainName}${suffix}`;
    }

    private static getPlainPageName(name: string): string {
        return name.replace(/\s+\[#\d+\]\s*$/g, "").trim();
    }

    private static parsePageSequence(name: string): number | null {
        const match = name.match(/\[#(\d+)\]\s*$/);
        if (!match) {
            return null;
        }
        const numeric = Number(match[1]);
        return Number.isFinite(numeric) ? numeric : null;
    }

    private static allocateNextPageSequence(): number {
        const pages = penpot.currentFile?.pages ?? [];
        let maxSequence = 0;
        for (const page of pages) {
            const sequence = this.parsePageSequence(page.name);
            if (sequence && sequence > maxSequence) {
                maxSequence = sequence;
            }
        }
        return maxSequence + 1;
    }

    private static getPlainWidgetName(name: string): string {
        return name.replace(/\s+\[(?:#\d+\s+\|\s+)?[^\]]+\]\s*$/g, "").trim();
    }

    private static humanizeType(type: string): string {
        return type
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    private static buildFlutterExportNode(shape: Shape, parentWidgetId?: string): FlutterExportNode {
        const metadata = this.readWidgetPluginData(shape);
        const component = shape.isComponentInstance() ? shape.component() : null;
        const semanticId = metadata.id || this.slugify(this.getPlainWidgetName(shape.name || shape.type) || shape.id);
        const widgetId = this.buildFlutterExportWidgetId(shape, semanticId, metadata.sequence ?? undefined);
        const layoutIntent = this.inferFlutterLayoutIntent(shape, metadata);
        const spacingIntent = this.inferFlutterSpacingIntent(shape, metadata);
        const inferredProps = this.inferFlutterProps(shape, metadata.props);
        const sourceLibrary = metadata.sourceLibrary || undefined;
        const sourceComponentName = metadata.sourceComponentName || component?.name || undefined;
        const sourceComponentPath = metadata.sourceComponentPath || component?.path || null;
        const isLucideIcon = (sourceLibrary ?? "").toLowerCase().includes("lucide");
        const iconCanonicalName = isLucideIcon
            ? this.toFlutterIconName(sourceComponentName ?? sourceComponentPath ?? shape.name ?? semanticId)
            : undefined;

        return {
            widgetId,
            semanticId,
            sequenceId: metadata.sequence ?? undefined,
            widgetType: isLucideIcon ? "icon" : metadata.type || (component ? "library_component" : shape.type),
            role: metadata.role || undefined,
            displayName: this.getPlainWidgetName(metadata.name || shape.name || shape.type),
            sourceShapeId: shape.id,
            parentWidgetId,
            slot: metadata.slot || undefined,
            sourceLibrary,
            sourceComponentId: metadata.sourceComponentId || component?.id || undefined,
            sourceComponentName,
            sourceComponentPath,
            layoutIntent: layoutIntent ?? undefined,
            spacingIntent: spacingIntent ?? undefined,
            props: iconCanonicalName ? { ...inferredProps, iconName: iconCanonicalName } : inferredProps,
            tokens: metadata.tokens ?? undefined,
            children: [],
        };
    }

    private static toFlutterIconName(raw: string): string {
        return raw
            .replace(/[^a-zA-Z0-9]+/g, " ")
            .trim()
            .split(/\s+/)
            .map((part, index) =>
                index === 0
                    ? part.charAt(0).toLowerCase() + part.slice(1)
                    : part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join("");
    }

    private static buildFlutterExportWidgetId(shape: Shape, semanticId: string, sequence?: number): string {
        if (typeof sequence === "number" && Number.isFinite(sequence)) {
            return `${semanticId}__${sequence}`;
        }

        return `${semanticId}__${shape.id.replace(/[^a-zA-Z0-9]+/g, "_")}`;
    }

    private static readWidgetPluginData(shape: Shape): {
        id?: string;
        sequence?: number | null;
        type?: string;
        name?: string;
        role?: string;
        slot?: string;
        props?: Record<string, unknown>;
        tokens?: Record<string, string>;
        layout?: Partial<WidgetLayoutSpec>;
        sourceLibrary?: string;
        sourceComponentId?: string;
        sourceComponentName?: string;
        sourceComponentPath?: string | null;
    } {
        const prefix = this.WIDGET_PLUGIN_PREFIX;
        const parseJson = <T>(raw: string): T | undefined => {
            try {
                return JSON.parse(raw) as T;
            } catch (_error) {
                return undefined;
            }
        };

        const sequenceRaw = shape.getPluginData(this.WIDGET_SEQUENCE_KEY);
        const sequence = sequenceRaw ? Number(sequenceRaw) : null;

        return {
            id: shape.getPluginData(`${prefix}.id`) || undefined,
            sequence: Number.isFinite(sequence) ? sequence : null,
            type: shape.getPluginData(`${prefix}.type`) || undefined,
            name: shape.getPluginData(`${prefix}.name`) || undefined,
            role: shape.getPluginData(`${prefix}.role`) || undefined,
            slot: shape.getPluginData(`${prefix}.slot`) || undefined,
            props: (() => {
                const raw = shape.getPluginData(`${prefix}.props`);
                return raw ? parseJson<Record<string, unknown>>(raw) : undefined;
            })(),
            tokens: (() => {
                const raw = shape.getPluginData(`${prefix}.tokens`);
                return raw ? parseJson<Record<string, string>>(raw) : undefined;
            })(),
            layout: (() => {
                const raw = shape.getPluginData(`${prefix}.layout`);
                return raw ? parseJson<Partial<WidgetLayoutSpec>>(raw) : undefined;
            })(),
            sourceLibrary: shape.getPluginData(`${prefix}.sourceLibrary`) || undefined,
            sourceComponentId: shape.getPluginData(`${prefix}.sourceComponentId`) || undefined,
            sourceComponentName: shape.getPluginData(`${prefix}.sourceComponentName`) || undefined,
            sourceComponentPath: shape.getPluginData(`${prefix}.sourceComponentPath`) || undefined,
        };
    }

    private static inferFlutterLayoutIntent(
        shape: Shape,
        metadata: ReturnType<typeof PenpotUtils.readWidgetPluginData>
    ): FlutterExportLayoutIntent | null {
        if (metadata.layout) {
            return {
                kind:
                    metadata.layout.kind === "row" ||
                    metadata.layout.kind === "column" ||
                    metadata.layout.kind === "grid" ||
                    metadata.layout.kind === "stack"
                        ? metadata.layout.kind
                        : "component",
                width: metadata.layout.width,
                height: metadata.layout.height,
                align: metadata.layout.align,
                crossAlign: metadata.layout.crossAlign,
                justifyContent: metadata.layout.justifyContent,
                wrap: metadata.layout.wrap,
                columns: metadata.layout.columns,
            };
        }

        if (shape.isComponentInstance()) {
            return { kind: "component" };
        }

        if ("flex" in shape && shape.flex) {
            return {
                kind: shape.flex.dir === "row" ? "row" : "column",
                wrap: shape.flex.wrap,
                align: shape.flex.alignItems,
                justifyContent: shape.flex.justifyContent,
            };
        }

        if ("grid" in shape && shape.grid) {
            return {
                kind: "grid",
                columns: shape.grid.columns?.length ?? undefined,
            };
        }

        if (shape.type === "board" && "children" in shape && shape.children?.length) {
            return { kind: "column" };
        }

        return null;
    }

    private static inferFlutterSpacingIntent(
        shape: Shape,
        metadata: ReturnType<typeof PenpotUtils.readWidgetPluginData>
    ): FlutterExportSpacingIntent | null {
        if (metadata.layout) {
            return {
                gap: metadata.layout.gap,
                padding: metadata.layout.padding as number | WidgetPadding | undefined,
            };
        }

        if ("flex" in shape && shape.flex) {
            return {
                gap: Math.max(shape.flex.rowGap ?? 0, shape.flex.columnGap ?? 0),
                padding: {
                    top: shape.flex.topPadding ?? 0,
                    right: shape.flex.rightPadding ?? 0,
                    bottom: shape.flex.bottomPadding ?? 0,
                    left: shape.flex.leftPadding ?? 0,
                },
            };
        }

        if ("grid" in shape && shape.grid) {
            return {
                gap: Math.max(shape.grid.rowGap ?? 0, shape.grid.columnGap ?? 0),
                padding: {
                    top: shape.grid.topPadding ?? 0,
                    right: shape.grid.rightPadding ?? 0,
                    bottom: shape.grid.bottomPadding ?? 0,
                    left: shape.grid.leftPadding ?? 0,
                },
            };
        }

        return null;
    }

    private static inferFlutterProps(
        shape: Shape,
        existingProps?: Record<string, unknown>
    ): Record<string, unknown> | undefined {
        const props = existingProps ? { ...existingProps } : {};

        if (shape.type === "text") {
            const textShape = shape as unknown as Text & { characters?: string; content?: string };
            if (props.text === undefined) {
                const textValue =
                    textShape.characters ??
                    textShape.content ??
                    (typeof (shape as any).text === "string" ? (shape as any).text : undefined);
                if (typeof textValue === "string" && textValue.trim().length > 0) {
                    props.text = textValue;
                }
            }
            if (props.fontSize === undefined && (shape as any).fontSize) {
                const fontSize = Number((shape as any).fontSize);
                if (Number.isFinite(fontSize)) {
                    props.fontSize = fontSize;
                }
            }
            if (props.fontFamily === undefined && typeof (shape as any).fontFamily === "string") {
                props.fontFamily = (shape as any).fontFamily;
            }
            if (props.fontWeight === undefined && (shape as any).fontWeight !== undefined) {
                props.fontWeight = (shape as any).fontWeight;
            }
        }

        return Object.keys(props).length > 0 ? props : undefined;
    }

    private static slugify(value: string): string {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48);
    }

    private static buildLibraryComponentSemanticId(match: LibraryComponentSummary): string {
        return this.slugify(`${match.libraryName}-${match.componentPath ?? match.componentName}`);
    }

    private static expandBlueprint(node: WidgetNode): WidgetNode {
        switch (node.type) {
            case "dashboard_shell":
                return {
                    ...node,
                    name: node.name || "Dashboard Shell",
                    layout: node.layout || {
                        kind: "column",
                        height: "hug",
                        gap: 24,
                        padding: 24,
                    },
                    style: {
                        fills: [{ fillColor: "#F5F7FB", fillOpacity: 1 }],
                        radius: 24,
                        ...node.style,
                    },
                };
            case "metric_card": {
                const props = node.props || {};
                const accent = String(props.accent ?? "#2F6BFF");
                return {
                    ...node,
                    name: node.name || "Metric Card",
                    props: {
                        width: 256,
                        height: 156,
                        ...props,
                    },
                    layout: {
                        kind: "column",
                        width: "fill",
                        height: "hug",
                        gap: 16,
                        padding: { top: 0, right: 20, bottom: 20, left: 20 },
                        ...node.layout,
                    },
                    childLayout: {
                        horizontalSizing: "fill",
                        verticalSizing: "fix",
                        ...node.childLayout,
                    },
                    style: {
                        fills: [{ fillColor: "#FFFFFF", fillOpacity: 1 }],
                        radius: 20,
                        ...node.style,
                    },
                    children: [
                        {
                            type: "rectangle",
                            name: "Accent",
                            props: { width: 216, height: 8 },
                            childLayout: {
                                horizontalSizing: "fill",
                                verticalSizing: "fix",
                            },
                            style: {
                                fills: [{ fillColor: accent, fillOpacity: 1 }],
                                radius: 999,
                            },
                        },
                        {
                            type: "board",
                            name: "Content Stack",
                            layout: {
                                kind: "column",
                                width: "fill",
                                height: "hug",
                                gap: 8,
                            },
                            childLayout: {
                                horizontalSizing: "fill",
                                verticalSizing: "auto",
                            },
                            style: {
                                fills: [{ fillColor: "#FFFFFF", fillOpacity: 0 }],
                            },
                            children: [
                                {
                                    type: "text",
                                    name: "Label",
                                    props: {
                                        text: String(props.label ?? "Label"),
                                        fontSize: 15,
                                        fontWeight: "400",
                                    },
                                    childLayout: {
                                        horizontalSizing: "auto",
                                        verticalSizing: "auto",
                                    },
                                    style: { fills: [{ fillColor: "#6B7280", fillOpacity: 1 }] },
                                },
                                {
                                    type: "text",
                                    name: "Value",
                                    props: {
                                        text: String(props.value ?? "Value"),
                                        fontSize: 30,
                                        fontWeight: "700",
                                    },
                                    childLayout: {
                                        horizontalSizing: "auto",
                                        verticalSizing: "auto",
                                    },
                                    style: { fills: [{ fillColor: "#111827", fillOpacity: 1 }] },
                                },
                            ],
                        },
                    ],
                };
            }
            default:
                return {
                    ...node,
                    children: node.children?.map((child) => this.expandBlueprint(child)),
                };
        }
    }
}
