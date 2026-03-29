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
        if (typeof node.props?.fontWeight === "string") {
            text.fontWeight = node.props.fontWeight;
        }
        text.fills = node.style?.fills ?? [{ fillColor: "#111827", fillOpacity: 1 }];
        return text;
    }

    private static applyWidgetMetadata(shape: Shape, node: WidgetNode, parent: Board | null): void {
        const metadata: Record<string, string> = {
            [`${this.WIDGET_PLUGIN_PREFIX}.type`]: node.type,
            [`${this.WIDGET_PLUGIN_PREFIX}.version`]: "1",
            [`${this.WIDGET_PLUGIN_PREFIX}.name`]: node.name || node.type,
        };

        metadata[`${this.WIDGET_PLUGIN_PREFIX}.id`] = node.id || this.slugify(node.name || node.type);
        if (parent) {
            metadata[`${this.WIDGET_PLUGIN_PREFIX}.parentId`] = parent.id;
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
        const ensuredName = this.ensureWidgetDisplayName(node.name || this.humanizeType(node.type), ensuredId);
        const preparedChildren = node.children?.map((child, index) =>
            this.prepareWidgetNode(child, [...path, index], depth + 1, nodeSpacingSystem)
        );

        const preparedNode: WidgetNode = {
            ...node,
            id: ensuredId,
            name: ensuredName,
            props: {
                ...(node.props ?? {}),
                ...(depth === 0 ? { spacingSystem: nodeSpacingSystem } : {}),
            },
            children: preparedChildren,
        };

        if (preparedNode.layout) {
            preparedNode.layout = this.applyDefaultSpacingToLayout(preparedNode, depth, nodeSpacingSystem);
        }

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

    private static applyDefaultSpacingToLayout(
        node: WidgetNode,
        depth: number,
        spacingSystem: WidgetSpacingSystem
    ): WidgetLayoutSpec {
        const layout = { ...node.layout! };
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
        return this.ensureWidgetDisplayName(node.name || this.humanizeType(node.type), node.id || this.slugify(node.type));
    }

    private static ensureWidgetDisplayName(name: string, id: string): string {
        const suffix = ` [${id}]`;
        return name.endsWith(suffix) ? name : `${name}${suffix}`;
    }

    private static humanizeType(type: string): string {
        return type
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    private static slugify(value: string): string {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48);
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
