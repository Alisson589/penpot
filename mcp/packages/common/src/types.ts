/**
 * Result of a plugin task execution.
 *
 * Contains the outcome status of a task and any additional result data.
 */
export interface PluginTaskResult<T> {
    /**
     * Optional result data from the task execution.
     */
    data?: T;
}

/**
 * Request message sent from server to plugin.
 *
 * Contains a unique identifier, task name, and parameters for execution.
 */
export interface PluginTaskRequest {
    /**
     * Unique identifier for request/response correlation.
     */
    id: string;

    /**
     * The name of the task to execute.
     */
    task: string;

    /**
     * The parameters for task execution.
     */
    params: any;
}

/**
 * Response message sent from plugin back to server.
 *
 * Contains the original request ID and the execution result.
 */
export interface PluginTaskResponse<T> {
    /**
     * Unique identifier matching the original request.
     */
    id: string;

    /**
     * Whether the task completed successfully.
     */
    success: boolean;

    /**
     * Optional error message if the task failed.
     */
    error?: string;

    /**
     * The result of the task execution.
     */
    data?: T;
}

/**
 * Parameters for the executeCode task.
 */
export interface ExecuteCodeTaskParams {
    /**
     * The JavaScript code to be executed.
     */
    code: string;
}

/**
 * Result data for the executeCode task.
 */
export interface ExecuteCodeTaskResultData<T> {
    /**
     * The result of the executed code, if any.
     */
    result: T;

    /**
     * Captured console output during code execution.
     */
    log: string;
}

export type WidgetBreakpointKey = "compact" | "medium" | "expanded";

export type WidgetLayoutKind = "stack" | "row" | "column" | "grid";

export interface WidgetPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface WidgetLayoutSpec {
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
}

export interface WidgetResponsiveOverride {
    layout?: Partial<WidgetLayoutSpec>;
    visible?: boolean;
    slotOrder?: string[];
}

export type WidgetResponsiveSpec = Partial<Record<WidgetBreakpointKey, WidgetResponsiveOverride>>;

export interface WidgetChildLayoutSpec {
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
}

export interface WidgetNode {
    id?: string;
    type: string;
    name?: string;
    role?: string;
    slot?: string;
    props?: Record<string, unknown>;
    tokens?: Record<string, string>;
    layout?: WidgetLayoutSpec;
    childLayout?: WidgetChildLayoutSpec;
    responsive?: WidgetResponsiveSpec;
    style?: {
        fills?: Array<Record<string, unknown>>;
        radius?: number;
        shadows?: Array<Record<string, unknown>>;
    };
    slots?: Record<string, string>;
    children?: WidgetNode[];
}

export interface WidgetCreateTaskParams {
    root: WidgetNode;
    pageId?: string;
}

export interface WidgetTreeNodeResult {
    id: string;
    type: string;
    name: string;
    childIds: string[];
}

export interface WidgetTreeResult {
    root: WidgetTreeNodeResult;
    nodes: WidgetTreeNodeResult[];
}

export interface FlutterExportSpacingIntent {
    gap?: number;
    padding?: number | WidgetPadding;
    margin?: number | WidgetPadding;
}

export interface FlutterExportLayoutIntent {
    kind: "stack" | "row" | "column" | "grid" | "component";
    width?: number | "fill" | "hug";
    height?: number | "fill" | "hug";
    align?: "start" | "end" | "center" | "stretch";
    crossAlign?: "start" | "end" | "center" | "stretch";
    justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly" | "stretch";
    wrap?: "wrap" | "nowrap";
    columns?: number;
}

export interface FlutterExportNode {
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
}

export interface DesignSystemMetadata {
    name: string;
    namingConvention: "semantic" | "scale" | "hybrid";
    scaleType: "4pt" | "8pt" | "60/30/10" | "custom";
    theme?: string;
    set?: string;
    setNames?: string[];
    themeNames?: string[];
}

export interface FlutterExportTree {
    designSystem?: DesignSystemMetadata;
    root: FlutterExportNode;
    nodes: FlutterExportNode[];
}
