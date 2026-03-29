import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { Tool } from "../Tool";
import type { ToolResponse } from "../ToolResponse";
import { TextResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";

type WidgetPadding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
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

type FlutterExportSpacingIntent = {
    gap?: number;
    padding?: number | WidgetPadding;
    margin?: number | WidgetPadding;
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

type InspectedToken = {
    name: string;
    type: string;
    value: unknown;
    resolvedValue: unknown;
};

type InspectedTokenSet = {
    id: string;
    name: string;
    active: boolean;
    tokens?: InspectedToken[];
};

type InspectedTokenCatalog = {
    sets: InspectedTokenSet[];
};

export class GenerateFlutterDartArgs {
    static schema = {
        shapeId: z.string().optional().describe("Optional root shape id to export."),
        pageId: z.string().optional().describe("Optional page id to export. Defaults to the current page."),
        className: z.string().optional().describe("Flutter widget class name. Defaults to PenpotGeneratedScreen."),
        outputPath: z.string().optional().describe("Optional output path for the generated Dart file."),
        mode: z.enum(["app", "dartpad"]).optional().describe("Output mode. Use dartpad to emit a runnable main() wrapper."),
    };

    shapeId?: string;
    pageId?: string;
    className?: string;
    outputPath?: string;
    mode?: "app" | "dartpad";
}

export class GenerateFlutterDartTool extends Tool<GenerateFlutterDartArgs> {
    constructor(mcpServer: PenpotMcpServer) {
        super(mcpServer, GenerateFlutterDartArgs.schema);
    }

    public getToolName(): string {
        return "generate_flutter_dart";
    }

    public getToolDescription(): string {
        return "Generates a first-pass Flutter Dart widget from the safe export IR produced from the current Penpot page or a specific shape subtree.";
    }

    protected async executeCore(args: GenerateFlutterDartArgs): Promise<ToolResponse> {
        const code =
            `return {` +
            ` tree: penpotUtils.exportToFlutterTree({` +
            `   shapeId: ${args.shapeId ? JSON.stringify(args.shapeId) : "undefined"},` +
            `   pageId: ${args.pageId ? JSON.stringify(args.pageId) : "undefined"}` +
            ` }),` +
            ` tokens: penpotUtils.inspectDesignTokens()` +
            ` };`;

        const task = new ExecuteCodePluginTask({ code });
        const result = await this.mcpServer.pluginBridge.executePluginTask(task);
        const payload = result.data?.result as { tree?: FlutterExportTree; tokens?: InspectedTokenCatalog } | undefined;
        const tree = payload?.tree;
        const tokenCatalog = payload?.tokens;

        if (!tree?.root) {
            return new TextResponse("Flutter Dart generation completed with no export tree.");
        }

        const className = this.normalizeClassName(args.className || tree.root.displayName || "PenpotGeneratedScreen");
        const dart = this.renderDartFile(className, tree, tokenCatalog, args.mode ?? "app");
        const outputPath = args.outputPath || path.join(process.cwd(), "export", `${this.toSnakeCase(className)}.dart`);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, dart, "utf8");

        return new TextResponse(
            JSON.stringify(
                {
                    className,
                    rootWidgetId: tree.root.widgetId,
                    nodeCount: tree.nodes.length,
                    outputPath,
                    dart,
                },
                null,
                2
            )
        );
    }

    private normalizeClassName(input: string): string {
        const cleaned = input
            .replace(/[^a-zA-Z0-9]+/g, " ")
            .trim()
            .split(/\s+/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");
        return cleaned || "PenpotGeneratedScreen";
    }

    private renderDartFile(
        className: string,
        tree: FlutterExportTree,
        tokenCatalog: InspectedTokenCatalog | undefined,
        mode: "app" | "dartpad"
    ): string {
        const normalizedRoot = this.normalizeTree(tree.root);
        const usesVariantCardHelper = this.treeUsesVariantCard(normalizedRoot);
        const usesFontWeightHelper = this.treeUsesFontWeightItem(normalizedRoot);
        const usesSectionTitleHelper = this.treeUsesSectionTitle(normalizedRoot);
        const usesLucideIcons = this.treeUsesLucideIcons(normalizedRoot);
        const tokenMap = this.buildTokenValueMap(tokenCatalog, normalizedRoot);
        const appTokensClass = tokenMap.size > 0 ? this.renderAppTokensClass(tokenMap) : "";
        const helpers = [
            usesSectionTitleHelper ? this.renderSectionTitleHelper() : "",
            usesVariantCardHelper ? this.renderVariantCardHelper() : "",
            usesFontWeightHelper ? this.renderFontWeightHelper() : "",
        ]
            .filter(Boolean)
            .join("\n\n");
        const body = this.indentBlock(this.renderNode(normalizedRoot, 0, true), 4);
        const mainWrapper =
            mode === "dartpad"
                ? `void main() {\n  runApp(const MaterialApp(\n    debugShowCheckedModeBanner: false,\n    home: ${className}(),\n  ));\n}\n\n`
                : "";
        const importBlock = [
            `import 'package:flutter/material.dart';`,
            usesLucideIcons ? `import 'package:lucide_icons_flutter/lucide_icons.dart';` : "",
        ]
            .filter(Boolean)
            .join("\n");
        const dart = `${importBlock}

${mainWrapper}${appTokensClass ? `${appTokensClass}\n\n` : ""}class ${className} extends StatelessWidget {
  const ${className}({super.key});

${helpers ? `${helpers}\n` : ""}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child:
${body},
      ),
    );
  }
}
`;
        return this.tidyGeneratedDart(dart);
    }

    private normalizeTree(node: FlutterExportNode): FlutterExportNode {
        const children = node.children
            .map((child) => this.normalizeTree(child))
            .filter((child) => !this.isIgnorableNode(child));

        const normalized: FlutterExportNode = {
            ...node,
            children,
        };

        if (this.shouldCollapseContainer(normalized)) {
            const [onlyChild] = normalized.children;
            return {
                ...onlyChild,
                spacingIntent: this.mergeSpacingIntent(normalized.spacingIntent, onlyChild.spacingIntent),
                parentWidgetId: normalized.parentWidgetId,
            };
        }

        return normalized;
    }

    private isIgnorableNode(node: FlutterExportNode): boolean {
        if (node.sourceComponentName || node.sourceComponentPath) {
            return false;
        }
        if (node.widgetType === "text") {
            return false;
        }
        if (node.children.length > 0) {
            return false;
        }
        const hasProps = Object.keys(node.props ?? {}).length > 0;
        const hasTokens = Object.keys(node.tokens ?? {}).length > 0;
        return !hasProps && !hasTokens;
    }

    private shouldCollapseContainer(node: FlutterExportNode): boolean {
        if (node.children.length !== 1) {
            return false;
        }
        if (node.sourceComponentName || node.sourceComponentPath) {
            return false;
        }
        if (node.widgetType === "text") {
            return false;
        }
        if (this.isVariantCard(node) || this.isFontWeightItem(node) || this.isSectionTitle(node)) {
            return false;
        }

        const hasDecorationTokens =
            !!this.resolveTokenRef(node, ["fill", "background", "surface", "color"]) ||
            !!this.resolveTokenRef(node, ["radius", "borderRadius"]) ||
            !!this.resolveTokenRef(node, ["borderColor", "stroke", "border"]);
        const hasConcreteSize =
            typeof node.layoutIntent?.width === "number" || typeof node.layoutIntent?.height === "number";
        return !hasDecorationTokens && !hasConcreteSize;
    }

    private mergeSpacingIntent(
        outer?: FlutterExportSpacingIntent,
        inner?: FlutterExportSpacingIntent
    ): FlutterExportSpacingIntent | undefined {
        if (!outer) return inner;
        if (!inner) return outer;
        return {
            gap: inner.gap ?? outer.gap,
            padding: inner.padding ?? outer.padding,
            margin: inner.margin ?? outer.margin,
        };
    }

    private renderNode(node: FlutterExportNode, indent: number, isRoot = false): string {
        if (node.widgetType === "page" || isRoot) {
            return this.renderColumn(node.children, indent);
        }

        if (this.isSectionTitle(node)) {
            return this.wrapSpacing(node, this.renderSectionTitle(node, indent));
        }

        if (this.isFontWeightItem(node)) {
            return this.wrapSpacing(node, this.renderFontWeightItem(node));
        }

        if (node.widgetType === "text") {
            return this.wrapSpacing(node, this.renderText(node, indent));
        }

        if (node.widgetType === "icon") {
            return this.wrapSpacing(node, this.renderIcon(node, indent));
        }

        if (this.isVariantCard(node)) {
            return this.wrapSpacing(node, this.renderVariantCard(node));
        }

        if (node.widgetType === "rectangle" && node.children.length === 0) {
            return this.wrapSpacing(node, this.renderLeafBox(node, indent));
        }

        if (node.children.length === 0 && !node.sourceComponentName && !node.sourceComponentPath) {
            return "const SizedBox.shrink()";
        }

        const layoutKind = node.layoutIntent?.kind;
        if (layoutKind === "row") {
            if (this.shouldUseWrap(node)) {
                return this.wrapSpacing(node, this.renderWrap(node, indent));
            }
            return this.wrapSpacing(node, this.renderRow(node, indent));
        }
        if (layoutKind === "column") {
            return this.wrapSpacing(node, this.renderContainerColumn(node, indent, false));
        }
        if (layoutKind === "grid") {
            return this.wrapSpacing(node, this.renderWrap(node, indent));
        }

        if (node.sourceComponentName || node.sourceComponentPath) {
            return this.wrapSpacing(node, this.renderLibraryComponent(node, indent));
        }

        return this.wrapSpacing(node, this.renderContainerColumn(node, indent));
    }

    private renderColumn(children: FlutterExportNode[], indent: number): string {
        const i = "  ".repeat(indent);
        const rendered = this.renderChildren(children, indent + 1, "column", undefined);
        return `SingleChildScrollView(\n${i}  padding: const EdgeInsets.all(24),\n${i}  child: Column(\n${i}    crossAxisAlignment: CrossAxisAlignment.start,\n${i}    children: [\n${rendered}\n${i}    ],\n${i}  ),\n${i})`;
    }

    private renderRow(node: FlutterExportNode, indent: number): string {
        if (node.children.length === 0) {
            return "const SizedBox.shrink()";
        }
        const i = "  ".repeat(indent);
        const rendered = this.renderChildren(node.children, indent + 1, "row", node.spacingIntent?.gap);
        return `Row(\n${i}  crossAxisAlignment: ${this.mapCrossAxis(node.layoutIntent?.align)},\n${i}  mainAxisAlignment: ${this.mapMainAxis(node.layoutIntent?.justifyContent)},\n${i}  children: [\n${rendered}\n${i}  ],\n${i})`;
    }

    private renderWrap(node: FlutterExportNode, indent: number): string {
        if (node.children.length === 0) {
            return "const SizedBox.shrink()";
        }
        const i = "  ".repeat(indent);
        const spacing = node.spacingIntent?.gap ?? 12;
        const rendered = this.renderChildren(node.children, indent + 1, "wrap", undefined);
        return `Wrap(\n${i}  spacing: ${spacing},\n${i}  runSpacing: ${spacing},\n${i}  children: [\n${rendered}\n${i}  ],\n${i})`;
    }

    private renderContainerColumn(node: FlutterExportNode, indent: number, decorated = true): string {
        if (node.children.length === 0 && !decorated) {
            return "const SizedBox.shrink()";
        }
        const i = "  ".repeat(indent);
        const rendered = this.renderChildren(node.children, indent + 1, "column", node.spacingIntent?.gap);
        const explicitWidth =
            typeof node.layoutIntent?.width === "number" && this.shouldRenderExplicitWidth(node)
                ? node.layoutIntent.width
                : null;
        const height = typeof node.layoutIntent?.height === "number" ? `height: ${node.layoutIntent.height},\n${i}  ` : "";
        const decoration = decorated ? this.renderContainerDecoration(node, i) : "";
        const childBody =
            node.children.length > 0
                ? `Column(\n${i}    crossAxisAlignment: CrossAxisAlignment.start,\n${i}    children: [\n${rendered}\n${i}    ],\n${i}  )`
                : "const SizedBox.shrink()";
        const widthBlock =
            explicitWidth !== null && !this.shouldUseMaxWidthConstraint(node) ? `width: ${explicitWidth},\n${i}  ` : "";
        const shouldUseContainer = Boolean(widthBlock || height || decoration);
        const container = shouldUseContainer
            ? `Container(\n${i}  ${widthBlock}${height}${decoration}child: ${childBody},\n${i})`
            : childBody;
        if (explicitWidth !== null && this.shouldUseMaxWidthConstraint(node)) {
            return `ConstrainedBox(\n${i}  constraints: const BoxConstraints(maxWidth: ${explicitWidth}),\n${i}  child: ${container},\n${i})`;
        }
        return container;
    }

    private renderText(node: FlutterExportNode, indent: number): string {
        const i = "  ".repeat(indent);
        const text = this.escapeDartString(String(node.props?.text ?? node.displayName));
        const styleParts: string[] = [];
        const fontSize = node.props?.fontSize;
        const fontWeight = node.props?.fontWeight;
        const fontFamily = node.props?.fontFamily;
        const fontSizeToken = this.resolveTokenRef(node, ["fontSize", "fontSizes", "typography.size"]);
        const fontFamilyToken = this.resolveTokenRef(node, ["fontFamily", "fontFamilies", "typography.family"]);
        const fontWeightToken = this.resolveTokenRef(node, ["fontWeight", "fontWeights", "typography.weight"]);
        const textColorToken = this.resolveTokenRef(node, ["textColor", "color", "foreground", "content"]);
        if (fontSizeToken) styleParts.push(`fontSize: ${fontSizeToken}`);
        else if (typeof fontSize === "number") styleParts.push(`fontSize: ${fontSize}`);
        if (fontFamilyToken) styleParts.push(`fontFamily: ${fontFamilyToken}`);
        else if (typeof fontFamily === "string") styleParts.push(`fontFamily: '${this.escapeDartString(fontFamily)}'`);
        if (fontWeightToken) styleParts.push(`fontWeight: ${fontWeightToken}`);
        else if (typeof fontWeight === "number") styleParts.push(`fontWeight: ${this.mapFontWeight(fontWeight)}`);
        else if (typeof fontWeight === "string") styleParts.push(`fontWeight: ${this.mapFontWeight(fontWeight)}`);
        if (textColorToken) styleParts.push(`color: ${textColorToken}`);
        const style = styleParts.length ? `,\n${i}  style: TextStyle(${styleParts.join(", ")}),` : "";
        return `Text(\n${i}  '${text}'${style}\n${i})`;
    }

    private renderSectionTitle(node: FlutterExportNode, indent: number): string {
        const text = this.escapeDartString(String(node.props?.text ?? node.displayName));
        const fontSizeToken = this.resolveTokenRef(node, ["fontSize", "fontSizes", "typography.size"]) ?? "24";
        const fontFamilyToken = this.resolveTokenRef(node, ["fontFamily", "fontFamilies", "typography.family"]) ?? "AppTokens.fontFamilyBase";
        const fontWeightToken = this.resolveTokenRef(node, ["fontWeight", "fontWeights", "typography.weight"]) ?? "AppTokens.fontWeightBold";
        const colorToken = this.resolveTokenRef(node, ["textColor", "color", "foreground", "content"]) ?? "AppTokens.colorTextPrimary";
        const args = [`'${text}'`];
        if (fontSizeToken !== "24") args.push(`fontSize: ${fontSizeToken}`);
        if (fontFamilyToken !== "AppTokens.fontFamilyBase") args.push(`fontFamily: ${fontFamilyToken}`);
        if (!["AppTokens.fontWeightBold", "FontWeight.w700"].includes(fontWeightToken)) {
            args.push(`fontWeight: ${fontWeightToken}`);
        }
        if (colorToken !== "AppTokens.colorTextPrimary") args.push(`color: ${colorToken}`);
        return `_buildSectionTitle(${args.join(", ")})`;
    }

    private renderFontWeightItem(node: FlutterExportNode): string {
        const text = this.escapeDartString(String(node.props?.text ?? node.displayName));
        const weight = node.props?.fontWeight ?? 400;
        return `_buildFontWeightText('${text}', ${this.mapFontWeight(weight)})`;
    }

    private renderVariantCard(node: FlutterExportNode): string {
        const titleNode = node.children.find((child) => child.widgetType === "text");
        const subtitleNode = node.children.filter((child) => child.widgetType === "text")[1];
        const title = this.escapeDartString(String(titleNode?.props?.text ?? titleNode?.displayName ?? "Title"));
        const subtitle = this.escapeDartString(String(subtitleNode?.props?.text ?? subtitleNode?.displayName ?? "Subtitle"));
        const titleFamily = titleNode?.props?.fontFamily;
        const titleWeight = titleNode?.props?.fontWeight;
        const titleFamilyToken = titleNode ? this.resolveTokenRef(titleNode, ["fontFamily", "fontFamilies"]) : null;
        const titleColorToken = titleNode ? this.resolveTokenRef(titleNode, ["textColor", "color"]) : null;
        const bodyColorToken = subtitleNode ? this.resolveTokenRef(subtitleNode, ["textColor", "color"]) : null;
        const titleSizeToken = titleNode ? this.resolveTokenRef(titleNode, ["fontSize", "fontSizes"]) : null;
        const bodySizeToken = subtitleNode ? this.resolveTokenRef(subtitleNode, ["fontSize", "fontSizes"]) : null;
        const surfaceColorToken = this.resolveTokenRef(node, ["fill", "background", "surface", "color"]);
        const borderColorToken = this.resolveTokenRef(node, ["borderColor", "stroke", "border"]);
        const radiusToken = this.resolveTokenRef(node, ["radius", "borderRadius"]);

        const args: string[] = [`title: '${title}'`, `subtitle: '${subtitle}'`];
        if (titleFamilyToken && titleFamilyToken !== "AppTokens.fontFamilyBase") {
            args.push(`fontFamily: ${titleFamilyToken}`);
        } else if (typeof titleFamily === "string" && titleFamily !== "Work Sans") {
            args.push(`fontFamily: '${this.escapeDartString(titleFamily)}'`);
        }
        if (titleWeight !== undefined) {
            const mapped = this.mapFontWeight(titleWeight as string | number);
            if (!["AppTokens.fontWeightBold", "FontWeight.w700"].includes(mapped)) {
                args.push(`titleWeight: ${mapped}`);
            }
        }
        if (titleColorToken && titleColorToken !== "AppTokens.colorTextPrimary") {
            args.push(`titleColor: ${titleColorToken}`);
        }
        if (bodyColorToken && bodyColorToken !== "AppTokens.colorTextMuted") {
            args.push(`bodyColor: ${bodyColorToken}`);
        }
        if (titleSizeToken && titleSizeToken !== "AppTokens.fontSizeTitle") {
            args.push(`titleSize: ${titleSizeToken}`);
        }
        if (bodySizeToken && bodySizeToken !== "AppTokens.fontSizeBody") {
            args.push(`bodySize: ${bodySizeToken}`);
        }
        if (surfaceColorToken && surfaceColorToken !== "AppTokens.colorSurface") {
            args.push(`surfaceColor: ${surfaceColorToken}`);
        }
        if (borderColorToken && borderColorToken !== "AppTokens.colorBorderSubtle") {
            args.push(`borderColor: ${borderColorToken}`);
        }
        if (radiusToken && radiusToken !== "AppTokens.radiusCard") {
            args.push(`radius: ${radiusToken}`);
        }
        return `_buildVariantCard(${args.join(", ")})`;
    }

    private renderLibraryComponent(node: FlutterExportNode, indent: number): string {
        const descriptor = `${node.sourceComponentPath ?? ""} ${node.sourceComponentName ?? ""}`.toLowerCase();
        if (descriptor.includes("button")) {
            return "OutlinedButton(onPressed: () {}, child: const Text('Action'))";
        }
        if (descriptor.includes("input")) {
            return "const TextField(decoration: InputDecoration(isDense: true, hintText: 'Search', border: OutlineInputBorder()))";
        }
        if (descriptor.includes("avatar")) {
            return "const CircleAvatar(radius: 18, child: Text('A'))";
        }
        if (descriptor.includes("tabs")) {
            return "Container(decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(12)), child: const Padding(padding: EdgeInsets.all(4), child: Row(mainAxisSize: MainAxisSize.min, children: [Chip(label: Text('Overview')), SizedBox(width: 8), Chip(label: Text('Revenue')), SizedBox(width: 8), Chip(label: Text('Activity'))])))";
        }
        return this.renderContainerColumn(node, indent);
    }

    private renderIcon(node: FlutterExportNode, indent: number): string {
        const iconName = typeof node.props?.iconName === "string" ? String(node.props.iconName) : "";
        const size =
            typeof node.layoutIntent?.width === "number"
                ? node.layoutIntent.width
                : typeof node.layoutIntent?.height === "number"
                  ? node.layoutIntent.height
                  : 20;
        const colorToken = this.resolveTokenRef(node, ["textColor", "color", "foreground", "content"]);
        const iconRef = iconName ? `LucideIcons.${iconName}` : null;
        const i = "  ".repeat(indent);

        if (!iconRef) {
            return `const SizedBox.shrink()`;
        }

        return `Icon(\n${i}  ${iconRef},\n${i}  size: ${size},${colorToken ? `\n${i}  color: ${colorToken},` : ""}\n${i})`;
    }

    private renderLeafBox(node: FlutterExportNode, indent: number): string {
        const i = "  ".repeat(indent);
        const width = typeof node.layoutIntent?.width === "number" ? `width: ${node.layoutIntent.width},\n${i}  ` : "";
        const height = typeof node.layoutIntent?.height === "number" ? `height: ${node.layoutIntent.height},\n${i}  ` : "";
        const decoration = this.renderContainerDecoration(node, i);
        if (!width && !height && !decoration) {
            return "const SizedBox.shrink()";
        }
        return `Container(\n${i}  ${width}${height}${decoration.trimEnd()}child: const SizedBox.shrink(),\n${i})`;
    }

    private renderContainerDecoration(node: FlutterExportNode, indentPrefix: string): string {
        const fillToken = this.resolveTokenRef(node, ["fill", "background", "surface", "color"]);
        const radiusToken = this.resolveTokenRef(node, ["radius", "borderRadius"]);
        if (!fillToken && !radiusToken) {
            return "";
        }
        const fillColor = fillToken ?? "Colors.white";
        const radius = radiusToken ?? "16";
        return (
            `decoration: BoxDecoration(color: ${fillColor}, borderRadius: BorderRadius.circular(${radius})),\n` +
            `${indentPrefix}  `
        );
    }

    private wrapSpacing(node: FlutterExportNode, child: string): string {
        if (child === "const SizedBox.shrink()") {
            return child;
        }
        const padding = this.shouldIgnorePaddingWrapper(node) ? null : this.renderEdgeInsets(node.spacingIntent?.padding);
        const margin = this.renderEdgeInsets(node.spacingIntent?.margin);
        const wrappers: string[] = [];
        if (padding) wrappers.push(`Padding(padding: ${padding}, child: __CHILD__)`);
        if (margin) wrappers.push(`Container(margin: ${margin}, child: __CHILD__)`);
        return wrappers.reduce((acc, wrapper) => wrapper.replace("__CHILD__", acc), child);
    }

    private renderEdgeInsets(value?: number | WidgetPadding): string | null {
        if (value === undefined) return null;
        if (typeof value === "number") return value === 0 ? null : `const EdgeInsets.all(${value})`;
        if (value.top === 0 && value.right === 0 && value.bottom === 0 && value.left === 0) return null;
        return `const EdgeInsets.fromLTRB(${value.left}, ${value.top}, ${value.right}, ${value.bottom})`;
    }

    private renderChildren(
        children: FlutterExportNode[],
        indent: number,
        axis: "row" | "column" | "wrap",
        gap?: number
    ): string {
        const i = "  ".repeat(indent + 1);
        const rendered: string[] = [];
        children.forEach((child, index) => {
            if (index > 0 && typeof gap === "number" && gap > 0 && axis !== "wrap") {
                const spacer = axis === "row" ? `const SizedBox(width: ${gap})` : `const SizedBox(height: ${gap})`;
                rendered.push(`${i}${spacer}`);
            }
            rendered.push(this.indentBlock(this.renderNode(child, indent), indent + 1));
        });
        return rendered.join(",\n");
    }

    private indentBlock(value: string, indent: number): string {
        const prefix = "  ".repeat(indent);
        return value
            .split("\n")
            .map((line) => (line ? `${prefix}${line}` : line))
            .join("\n");
    }

    private shouldUseWrap(node: FlutterExportNode): boolean {
        const semantic = node.semanticId?.toLowerCase() ?? "";
        return (
            semantic.includes("variant-card-row") ||
            semantic.includes("card-row") ||
            semantic.includes("cards-row") ||
            (node.children.length > 1 && node.children.every((child) => this.isVariantCard(child)))
        );
    }

    private shouldRenderExplicitWidth(node: FlutterExportNode): boolean {
        const role = node.role?.toLowerCase() ?? "";
        const semantic = node.semanticId?.toLowerCase() ?? "";
        if (role === "screen" || role === "dashboard" || role === "section") {
            return false;
        }
        if (
            semantic.includes("screen") ||
            semantic.includes("dashboard") ||
            semantic.includes("shell") ||
            semantic.includes("section") ||
            semantic.includes("row")
        ) {
            return false;
        }
        return true;
    }

    private shouldUseMaxWidthConstraint(node: FlutterExportNode): boolean {
        const semantic = node.semanticId?.toLowerCase() ?? "";
        const role = node.role?.toLowerCase() ?? "";
        return (
            role === "panel" ||
            role === "card" ||
            semantic.includes("list") ||
            semantic.includes("panel") ||
            semantic.includes("group")
        );
    }

    private shouldIgnorePaddingWrapper(node: FlutterExportNode): boolean {
        if (this.isVariantCard(node)) {
            return true;
        }

        const semantic = node.semanticId?.toLowerCase() ?? "";
        if (
            semantic.includes("variant-card-row") ||
            semantic.includes("card-row") ||
            semantic.includes("font-weight-list") ||
            semantic.includes("font-weights-list")
        ) {
            return true;
        }

        return false;
    }

    private resolveTokenRef(node: FlutterExportNode, keys: string[]): string | null {
        if (!node.tokens) {
            return null;
        }

        for (const key of keys) {
            const direct = node.tokens[key];
            if (direct) {
                return this.toFlutterTokenRef(direct);
            }
        }

        const aliasesByKey: Record<string, string[]> = {
            fill: ["fill", "background", "surface"],
            background: ["fill", "background", "surface"],
            surface: ["fill", "background", "surface"],
            color: ["color", "textColor", "foreground", "content"],
            textColor: ["textColor", "foreground", "content", "color"],
            foreground: ["foreground", "textColor", "content", "color"],
            content: ["content", "foreground", "textColor", "color"],
            radius: ["radius", "borderRadius"],
            borderRadius: ["borderRadius", "radius"],
            borderColor: ["borderColor", "strokeColor"],
            stroke: ["strokeColor", "borderColor", "strokeWidth"],
            border: ["borderColor", "strokeColor"],
            fontSize: ["fontSize", "fontSizes"],
            fontSizes: ["fontSizes", "fontSize"],
            fontFamily: ["fontFamily", "fontFamilies"],
            fontFamilies: ["fontFamilies", "fontFamily"],
            fontWeight: ["fontWeight", "fontWeights"],
            fontWeights: ["fontWeights", "fontWeight"],
            typography: ["typography"],
            gap: ["gap", "rowGap", "columnGap"],
        };

        const normalizedExpected = new Set(keys.flatMap((key) => aliasesByKey[key] ?? [key]).map((value) => value.toLowerCase()));
        const entry = Object.entries(node.tokens).find(([tokenKey]) => normalizedExpected.has(tokenKey.toLowerCase()));
        return entry ? this.toFlutterTokenRef(entry[1]) : null;
    }

    private toFlutterTokenRef(tokenName: string): string {
        return `AppTokens.${this.toCamelCase(tokenName)}`;
    }

    private mapCrossAxis(value?: string): string {
        switch (value) {
            case "center":
                return "CrossAxisAlignment.center";
            case "end":
                return "CrossAxisAlignment.end";
            case "stretch":
                return "CrossAxisAlignment.stretch";
            default:
                return "CrossAxisAlignment.start";
        }
    }

    private mapMainAxis(value?: string): string {
        switch (value) {
            case "center":
                return "MainAxisAlignment.center";
            case "end":
                return "MainAxisAlignment.end";
            case "space-between":
                return "MainAxisAlignment.spaceBetween";
            case "space-around":
                return "MainAxisAlignment.spaceAround";
            case "space-evenly":
                return "MainAxisAlignment.spaceEvenly";
            default:
                return "MainAxisAlignment.start";
        }
    }

    private mapFontWeight(value: string | number): string {
        const normalized = String(value).toLowerCase();
        const map: Record<string, string> = {
            "100": "FontWeight.w100",
            "200": "FontWeight.w200",
            "300": "FontWeight.w300",
            "400": "FontWeight.w400",
            "500": "FontWeight.w500",
            "600": "FontWeight.w600",
            "700": "FontWeight.w700",
            "800": "FontWeight.w800",
            "900": "FontWeight.w900",
            regular: "FontWeight.w400",
            medium: "FontWeight.w500",
            semibold: "FontWeight.w600",
            bold: "FontWeight.w700",
        };
        return map[normalized] ?? "FontWeight.w400";
    }

    private escapeDartString(value: string): string {
        return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }

    private toSnakeCase(value: string): string {
        return value
            .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
            .replace(/[^a-zA-Z0-9]+/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "")
            .toLowerCase();
    }

    private toCamelCase(value: string): string {
        const parts = value.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/);
        if (!parts.length) {
            return "token";
        }
        return parts
            .map((part, index) =>
                index === 0 ? part.charAt(0).toLowerCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join("");
    }

    private isVariantCard(node: FlutterExportNode): boolean {
        const semantic = node.semanticId?.toLowerCase() ?? "";
        return (
            (semantic.includes("variant-card") && !semantic.endsWith("-row") && node.widgetType === "board") ||
            (node.widgetType === "board" &&
                node.children.length === 2 &&
                node.children.every((child) => child.widgetType === "text"))
        );
    }

    private isFontWeightItem(node: FlutterExportNode): boolean {
        return (
            node.widgetType === "text" &&
            !this.isSectionTitle(node) &&
            typeof node.props?.fontWeight !== "undefined" &&
            Number(node.props?.fontSize ?? 0) >= 18
        );
    }

    private isSectionTitle(node: FlutterExportNode): boolean {
        const semantic = node.semanticId?.toLowerCase() ?? "";
        const text = String(node.props?.text ?? node.displayName).toLowerCase();
        return (
            node.widgetType === "text" &&
            (semantic.includes("section-title") || semantic.includes("section-header") || text === "font weights" || text === "state variants")
        );
    }

    private treeUsesVariantCard(node: FlutterExportNode): boolean {
        return this.walkTree(node).some((entry) => this.isVariantCard(entry));
    }

    private treeUsesFontWeightItem(node: FlutterExportNode): boolean {
        return this.walkTree(node).some((entry) => this.isFontWeightItem(entry));
    }

    private treeUsesSectionTitle(node: FlutterExportNode): boolean {
        return this.walkTree(node).some((entry) => this.isSectionTitle(entry));
    }

    private treeUsesLucideIcons(node: FlutterExportNode): boolean {
        return this.walkTree(node).some(
            (entry) => entry.widgetType === "icon" && (entry.sourceLibrary ?? "").toLowerCase().includes("lucide")
        );
    }

    private walkTree(node: FlutterExportNode): FlutterExportNode[] {
        return [node, ...node.children.flatMap((child) => this.walkTree(child))];
    }

    private renderVariantCardHelper(): string {
        return `  Widget _buildVariantCard({
    required String title,
    required String subtitle,
    String fontFamily = AppTokens.fontFamilyBase,
    FontWeight titleWeight = AppTokens.fontWeightBold,
    Color titleColor = AppTokens.colorTextPrimary,
    Color bodyColor = AppTokens.colorTextMuted,
    Color surfaceColor = AppTokens.colorSurface,
    Color borderColor = AppTokens.colorBorderSubtle,
    double titleSize = AppTokens.fontSizeTitle,
    double bodySize = AppTokens.fontSizeBody,
    double radius = AppTokens.radiusCard,
  }) {
    return Container(
      width: 220,
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: titleSize,
                fontFamily: fontFamily,
                fontWeight: titleWeight,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: bodySize,
                fontFamily: fontFamily,
                fontWeight: FontWeight.w400,
                color: bodyColor,
              ),
            ),
          ],
        ),
      ),
    );
  }`;
    }

    private renderSectionTitleHelper(): string {
        return `  Widget _buildSectionTitle(
    String text, {
    double fontSize = 24,
    String fontFamily = AppTokens.fontFamilyBase,
    FontWeight fontWeight = AppTokens.fontWeightBold,
    Color color = AppTokens.colorTextPrimary,
  }) {
    return Text(
      text,
      style: TextStyle(
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        color: color,
      ),
    );
  }`;
    }

    private renderFontWeightHelper(): string {
        return `  Widget _buildFontWeightText(String label, FontWeight weight) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Text(
        label,
        style: TextStyle(
          fontSize: AppTokens.fontSizeWeightDemo,
          fontFamily: AppTokens.fontFamilyBase,
          fontWeight: weight,
          color: AppTokens.colorTextPrimary,
        ),
      ),
    );
  }`;
    }

    private buildTokenValueMap(
        tokenCatalog: InspectedTokenCatalog | undefined,
        root: FlutterExportNode
    ): Map<string, { tokenType: string; resolvedValue: unknown }> {
        const usedTokenNames = new Set<string>();
        for (const node of this.walkTree(root)) {
            for (const tokenName of Object.values(node.tokens ?? {})) {
                usedTokenNames.add(tokenName);
            }
        }

        const map = new Map<string, { tokenType: string; resolvedValue: unknown }>();
        for (const set of tokenCatalog?.sets ?? []) {
            for (const token of set.tokens ?? []) {
                if (usedTokenNames.has(token.name)) {
                    map.set(token.name, {
                        tokenType: token.type,
                        resolvedValue: token.resolvedValue ?? token.value,
                    });
                }
            }
        }

        if (!map.has("font.family.base")) {
            map.set("font.family.base", { tokenType: "fontFamilies", resolvedValue: ["Work Sans"] });
        }
        if (!map.has("font.size.weight.demo")) {
            map.set("font.size.weight.demo", { tokenType: "fontSizes", resolvedValue: 20 });
        }
        if (!map.has("color.text.primary")) {
            map.set("color.text.primary", { tokenType: "color", resolvedValue: "#111827" });
        }
        if (!map.has("color.text.muted")) {
            map.set("color.text.muted", { tokenType: "color", resolvedValue: "#6B7280" });
        }
        if (!map.has("color.surface")) {
            map.set("color.surface", { tokenType: "color", resolvedValue: "#FFFFFF" });
        }
        if (!map.has("color.border.subtle")) {
            map.set("color.border.subtle", { tokenType: "color", resolvedValue: "#D1D5DB" });
        }
        if (!map.has("radius.card")) {
            map.set("radius.card", { tokenType: "borderRadius", resolvedValue: 12 });
        }
        if (!map.has("font.size.title")) {
            map.set("font.size.title", { tokenType: "fontSizes", resolvedValue: 18 });
        }
        if (!map.has("font.size.body")) {
            map.set("font.size.body", { tokenType: "fontSizes", resolvedValue: 14 });
        }
        if (!map.has("font.weight.bold")) {
            map.set("font.weight.bold", { tokenType: "fontWeights", resolvedValue: 700 });
        }
        if (!map.has("font.weight.medium")) {
            map.set("font.weight.medium", { tokenType: "fontWeights", resolvedValue: 500 });
        }

        return map;
    }

    private renderAppTokensClass(tokenMap: Map<string, { tokenType: string; resolvedValue: unknown }>): string {
        const lines = [...tokenMap.entries()]
            .map(([tokenName, token]) => this.renderAppTokenLine(tokenName, token.tokenType, token.resolvedValue))
            .filter((line): line is string => Boolean(line));

        if (!lines.some((line) => line.includes("fontFamilyBase"))) {
            lines.push(`  static const String fontFamilyBase = 'Work Sans';`);
        }

        if (lines.length === 0) {
            return "";
        }

        return `class AppTokens {\n  const AppTokens._();\n\n${lines.join("\n")}\n}`;
    }

    private renderAppTokenLine(tokenName: string, tokenType: string, resolvedValue: unknown): string | null {
        const field = this.toCamelCase(tokenName);
        if (tokenType === "color" && typeof resolvedValue === "string") {
            const hex = resolvedValue.replace("#", "").toUpperCase();
            const normalized = hex.length === 6 ? `FF${hex}` : hex;
            return `  static const Color ${field} = Color(0x${normalized});`;
        }
        if (
            ["spacing", "borderRadius", "fontSizes", "dimension", "borderWidth", "letterSpacing", "opacity", "rotation", "sizing"].includes(
                tokenType
            )
        ) {
            if (resolvedValue === null || resolvedValue === undefined || resolvedValue === "") {
                return null;
            }
            const numeric = Number(resolvedValue);
            if (Number.isFinite(numeric)) {
                return `  static const double ${field} = ${numeric};`;
            }
        }
        if (tokenType === "fontWeights") {
            if (resolvedValue === null || resolvedValue === undefined || resolvedValue === "") {
                return null;
            }
            return `  static const FontWeight ${field} = ${this.mapFontWeight(resolvedValue as string | number)};`;
        }
        if (tokenType === "fontFamilies") {
            const family = Array.isArray(resolvedValue) ? resolvedValue[0] : resolvedValue;
            if (typeof family === "string") {
                return `  static const String ${field} = '${this.escapeDartString(family)}';`;
            }
        }
        return null;
    }

    private tidyGeneratedDart(source: string): string {
        return source
            .replace(/\n{3,}/g, "\n\n")
            .replace(/child:\n([ \t]*)SingleChildScrollView\(/g, "child: SingleChildScrollView(")
            .replace(/\n([ \t]*)child: Column\(\n/g, "\n$1child: Column(\n")
            .replace(/\n([ \t]*)child: Wrap\(\n/g, "\n$1child: Wrap(\n")
            .trimEnd()
            .concat("\n");
    }
}
