import { z } from "zod";
import { Tool } from "../Tool";
import { ImageContent, PNGImageContent, PNGResponse, TextContent, TextResponse, ToolResponse } from "../ToolResponse";
import "reflect-metadata";
import { PenpotMcpServer } from "../PenpotMcpServer";
import { ExecuteCodePluginTask } from "../tasks/ExecuteCodePluginTask";
import { FileUtils } from "../utils/FileUtils";
import sharp from "sharp";

/**
 * Arguments class for ExportShapeTool
 */
export class ExportShapeArgs {
    static schema = {
        shapeId: z
            .string()
            .min(1, "shapeId cannot be empty")
            .describe(
                "Identifier of the shape to export. " +
                    "Special identifiers you can use: 'selection' (first shape currently selected by the user), 'page' (entire current page)"
            ),
        format: z.enum(["svg", "png"]).default("png").describe("The output format, either 'png' (default) or 'svg'."),
        mode: z
            .enum(["shape", "fill"])
            .default("shape")
            .describe(
                "The export mode: either 'shape' (full shape as it appears in the design, including descendants; the default) or " +
                    "'fill' (export the raw image that is used as a fill for the shape; PNG format only)"
            ),
        filePath: z
            .string()
            .optional()
            .describe(
                "Optional file path to save the exported image to. If not provided, " +
                    "the image data is returned directly for you to see."
            ),
    };

    shapeId!: string;

    format: "svg" | "png" = "png";

    mode: "shape" | "fill" = "shape";

    filePath?: string;
}

/**
 * Tool for executing JavaScript code in the Penpot plugin context
 */
export class ExportShapeTool extends Tool<ExportShapeArgs> {
    private static readonly FALLBACK_TYPE_PRIORITY: Record<string, number> = {
        board: 0,
        frame: 1,
        group: 2,
        shape: 3,
    };

    /**
     * Creates a new ExecuteCode tool instance.
     *
     * @param mcpServer - The MCP server instance
     */
    constructor(mcpServer: PenpotMcpServer) {
        let schema: any = ExportShapeArgs.schema;
        if (!mcpServer.isFileSystemAccessEnabled()) {
            // remove filePath key from schema
            schema = { ...schema };
            delete schema.filePath;
        }
        super(mcpServer, schema);
    }

    public getToolName(): string {
        return "export_shape";
    }

    public getToolDescription(): string {
        let description =
            "Exports a shape (or a shape's image fill) from the Penpot design to a PNG or SVG image, " +
            "such that you can get an impression of what it looks like.";
        if (this.mcpServer.isFileSystemAccessEnabled()) {
            description += "\nAlternatively, you can save it to a file.";
        }
        return description;
    }

    protected async executeCore(args: ExportShapeArgs): Promise<ToolResponse> {
        // check arguments
        if (args.filePath) {
            FileUtils.checkPathIsAbsolute(args.filePath);
        }

        // create code for exporting the shape
        let shapeCode: string;
        if (args.shapeId === "selection") {
            shapeCode = `penpot.selection[0]`;
        } else if (args.shapeId === "page") {
            shapeCode = `penpot.root`;
        } else {
            shapeCode = `penpotUtils.findShapeById("${args.shapeId}")`;
        }
        const asSvg = args.format === "svg";
        const code = `return penpotUtils.exportImage(${shapeCode}, "${args.mode}", ${asSvg});`;

        let imageData: Uint8Array | object;
        let fallbackNote: string | null = null;
        try {
            const task = new ExecuteCodePluginTask({ code });
            const result = await this.mcpServer.pluginBridge.executePluginTask(task);
            imageData = result.data!.result;
        } catch (error: any) {
            const diagnosis = await this.tryDiagnoseExport(args.shapeId);
            const fallbackCandidates = this.selectFallbackCandidates(args.shapeId, diagnosis?.result?.exportCandidates ?? []);
            if (fallbackCandidates.length === 0) {
                throw error;
            }

            let fallbackError = error;
            let successfulCandidate: { id: string; name: string; type: string; descendantCount: number } | null = null;
            for (const fallbackCandidate of fallbackCandidates) {
                try {
                    const fallbackCode = `return penpotUtils.exportImage(penpotUtils.findShapeById("${fallbackCandidate.id}"), "${args.mode}", ${asSvg});`;
                    const fallbackTask = new ExecuteCodePluginTask({ code: fallbackCode });
                    const fallbackResult = await this.mcpServer.pluginBridge.executePluginTask(fallbackTask);
                    imageData = fallbackResult.data!.result;
                    successfulCandidate = fallbackCandidate;
                    break;
                } catch (candidateError: any) {
                    fallbackError = candidateError;
                }
            }

            if (!successfulCandidate) {
                throw fallbackError;
            }

            fallbackNote =
                `Primary export failed for ${args.shapeId}. ` +
                `Returned fallback export for ${successfulCandidate.name} ` +
                `(${successfulCandidate.type}, id=${successfulCandidate.id}, descendants=${successfulCandidate.descendantCount}).`;
        }

        // handle output and return response
        if (!args.filePath) {
            // return image data directly (for the LLM to "see" it)
            if (args.format === "png") {
                return new PNGResponse(await this.toPngImageBytes(imageData));
            } else {
                const textResponse = TextResponse.fromData(imageData);
                if (fallbackNote) {
                    return new TextResponse(`${fallbackNote}\n\n${textResponse.content[0].text}`);
                }
                return textResponse;
            }
        } else {
            // save to file requested: make sure file system access is enabled
            if (!this.mcpServer.isFileSystemAccessEnabled()) {
                throw new Error("File system access is not enabled on the MCP server!");
            }
            // save to file
            if (args.format === "png") {
                FileUtils.writeBinaryFile(args.filePath, await this.toPngImageBytes(imageData));
            } else {
                FileUtils.writeTextFile(args.filePath, TextContent.textData(imageData));
            }
            return new TextResponse(
                fallbackNote ? `${fallbackNote}\nThe shape has been exported to ${args.filePath}` : `The shape has been exported to ${args.filePath}`
            );
        }
    }

    private async tryDiagnoseExport(shapeId: string): Promise<any | null> {
        try {
            const task = new ExecuteCodePluginTask({
                code: `return penpotUtils.diagnoseExportShape({ shapeId: ${JSON.stringify(shapeId)} });`,
            });
            const result = await this.mcpServer.pluginBridge.executePluginTask(task);
            return result.data;
        } catch (_error) {
            return null;
        }
    }

    private selectFallbackCandidates(
        shapeId: string,
        exportCandidates: Array<{ id: string; name: string; type: string; descendantCount: number }>
    ): Array<{ id: string; name: string; type: string; descendantCount: number }> {
        const filtered = exportCandidates.filter((candidate) => candidate.id !== shapeId);
        if (filtered.length === 0) {
            return [];
        }

        const preferred = filtered
            .filter((candidate) => candidate.descendantCount > 0 && candidate.descendantCount <= 36)
            .sort((left, right) => {
                const typeDelta =
                    (ExportShapeTool.FALLBACK_TYPE_PRIORITY[left.type] ?? 99) -
                    (ExportShapeTool.FALLBACK_TYPE_PRIORITY[right.type] ?? 99);
                if (typeDelta !== 0) {
                    return typeDelta;
                }
                return left.descendantCount - right.descendantCount;
            });

        const secondary = filtered
            .filter((candidate) => !preferred.some((entry) => entry.id === candidate.id))
            .sort((left, right) => left.descendantCount - right.descendantCount);

        return [...preferred, ...secondary].slice(0, 6);
    }

    /**
     * Converts image data to PNG format if necessary.
     *
     * @param data - The original image data as Uint8Array or as object (from JSON conversion of Uint8Array)
     * @return The image data as PNG bytes
     */
    private async toPngImageBytes(data: Uint8Array | object): Promise<Uint8Array> {
        const originalBytes = ImageContent.byteData(data);

        // use sharp to detect format and convert to PNG if necessary
        const image = sharp(originalBytes);
        const metadata = await image.metadata();

        // if already PNG, return as-is to avoid unnecessary re-encoding
        if (metadata.format === "png") {
            return originalBytes;
        }

        // convert to PNG
        const pngBuffer = await image.png().toBuffer();
        return new Uint8Array(pngBuffer);
    }
}
