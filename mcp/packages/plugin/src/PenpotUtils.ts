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

type FlutterExportTree = {
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
};

type InstantiateLibraryComponentParams = {
    libraryName?: string;
    componentNameContains?: string;
    componentPathContains?: string;
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

    public static getPages(): { id: string; name: string }[] {
        return penpot.currentFile!.pages.map((page) => ({ id: page.id, name: page.name }));
    }

    public static getPageById(id: string): Page | null {
        return this.findPage((page) => page.id === id);
    }

    public static getPageByName(name: string): Page | null {
        return this.findPage((page) => page.name.toLowerCase() === name.toLowerCase());
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

        if (options?.includeTokens !== false) {
            wantedPages.push("_Tokens");
        }
        if (options?.includeComponents !== false) {
            wantedPages.push("_Components");
        }
        if (options?.includeDocumentation !== false) {
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
                return { page: existing, created: false };
            }

            const page = penpot.createPage();
            page.name = pageName;
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

        const originalBounds = this.getBounds(shape);
        const sourceParent = shape.parent as any;
        const sourceIndex = typeof shape.parentIndex === "number" ? shape.parentIndex : null;

        const component = penpot.library.local.createComponent([shape]);
        component.name = params.componentName ?? component.name;

        const mainInstance = component.mainInstance();
        mainInstance.name = params.componentName ?? mainInstance.name;
        const targetPageName = params.componentPageName ?? "_Components";
        const targetPage = this.getPageByName(targetPageName) ?? (() => {
            const page = penpot.createPage();
            page.name = targetPageName;
            return page;
        })();
        const mainPage = this.getPageForShape(mainInstance);

        mainInstance.x = 120;
        mainInstance.y = 120;
        mainInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentRole`, "main");
        mainInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentId`, component.id);
        mainInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentName`, component.name);

        let sourceInstance: Shape | null = null;
        if (params.leaveInstanceOnSourcePage !== false && mainPage?.id !== sourcePage.id) {
            sourceInstance = component.instance();
            sourceInstance.name = params.componentName ?? sourceInstance.name;
            if (sourceParent && typeof sourceParent.appendChild === "function") {
                sourceParent.appendChild(sourceInstance);
                if (sourceIndex !== null && typeof sourceInstance.setParentIndex === "function") {
                    sourceInstance.setParentIndex(sourceIndex);
                }
            } else {
                (sourcePage.root as any).appendChild(sourceInstance);
            }
            sourceInstance.x = originalBounds.x;
            sourceInstance.y = originalBounds.y;
            sourceInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentRole`, "instance");
            sourceInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentId`, component.id);
            sourceInstance.setPluginData(`${this.WIDGET_PLUGIN_PREFIX}.componentName`, component.name);
        }

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
            sourceInstance: sourceInstance
                ? {
                      id: sourceInstance.id,
                      name: sourceInstance.name,
                      pageId: sourcePage.id,
                      pageName: sourcePage.name,
                  }
                : null,
        };
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
        limit?: number;
    }): LibraryComponentSummary[] {
        const libraryName = options.libraryName?.toLowerCase();
        const componentNameContains = options.componentNameContains?.toLowerCase();
        const componentPathContains = options.componentPathContains?.toLowerCase();

        return this.listLibraryComponents()
            .filter((entry) => {
                if (libraryName && !entry.libraryName.toLowerCase().includes(libraryName)) {
                    return false;
                }
                if (componentNameContains && !entry.componentName.toLowerCase().includes(componentNameContains)) {
                    return false;
                }
                if (
                    componentPathContains &&
                    !(entry.componentPath ?? "").toLowerCase().includes(componentPathContains)
                ) {
                    return false;
                }
                return true;
            })
            .slice(0, options.limit ?? 50);
    }

    public static instantiateLibraryComponent(params: InstantiateLibraryComponentParams): object {
        const matches = this.findLibraryComponents({
            libraryName: params.libraryName,
            componentNameContains: params.componentNameContains,
            componentPathContains: params.componentPathContains,
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

        return { root, nodes };
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

        return {
            widgetId,
            semanticId,
            sequenceId: metadata.sequence ?? undefined,
            widgetType: metadata.type || (component ? "library_component" : shape.type),
            role: metadata.role || undefined,
            displayName: this.getPlainWidgetName(metadata.name || shape.name || shape.type),
            sourceShapeId: shape.id,
            parentWidgetId,
            slot: metadata.slot || undefined,
            sourceLibrary: metadata.sourceLibrary || undefined,
            sourceComponentId: metadata.sourceComponentId || component?.id || undefined,
            sourceComponentName: metadata.sourceComponentName || component?.name || undefined,
            sourceComponentPath: metadata.sourceComponentPath || component?.path || null,
            layoutIntent: layoutIntent ?? undefined,
            spacingIntent: spacingIntent ?? undefined,
            props: inferredProps,
            tokens: metadata.tokens ?? undefined,
            children: [],
        };
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
