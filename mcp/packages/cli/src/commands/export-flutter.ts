import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

export interface ExportFlutterOptions {
  shapeId?: string;
  pageId?: string;
}

/**
 * `penpot-cli export flutter [--shape-id <id>] [--page-id <id>]`
 *
 * Orchestrates: export_to_flutter → generate_flutter_dart
 */
export async function exportFlutterCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: ExportFlutterOptions
): Promise<void> {
  output.header("Export to Flutter");

  // Step 1: Export intermediate tree
  output.step("export_to_flutter", "building Flutter export tree");
  const exportArgs: Record<string, unknown> = {};
  if (opts.shapeId) exportArgs.shapeId = opts.shapeId;
  if (opts.pageId) exportArgs.pageId = opts.pageId;

  const exportResult = await client.callTool("export_to_flutter", exportArgs);
  if (exportResult.isError) {
    output.error(`export_to_flutter failed: ${exportResult.raw}`);
    return;
  }
  output.success("Flutter export tree created");

  // Step 2: Generate Dart code
  output.step("generate_flutter_dart", "generating Dart code");

  const dartArgs: Record<string, unknown> = {};
  // Pass the tree from the export step if the tool expects it
  if (exportResult.data && typeof exportResult.data === "object") {
    dartArgs.exportTree = exportResult.data;
  }

  const dartResult = await client.callTool("generate_flutter_dart", dartArgs);
  if (dartResult.isError) {
    output.error(`generate_flutter_dart failed: ${dartResult.raw}`);
    return;
  }
  output.success("Dart code generated");

  // Final output
  output.separator();
  if (output.isJson) {
    output.result({
      command: "export-flutter",
      shapeId: opts.shapeId ?? null,
      pageId: opts.pageId ?? null,
      steps: {
        exportTree: exportResult.data,
        dartCode: dartResult.data,
      },
    });
  } else {
    output.success("Flutter export complete");

    // If dart code is a string, show a preview
    if (typeof dartResult.data === "string") {
      output.separator();
      output.info("Generated Dart code:");
      console.log(dartResult.data);
    } else {
      output.info("Use --json to get the full export data");
    }
  }
}
