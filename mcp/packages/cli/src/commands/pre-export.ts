import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

/**
 * `penpot-cli pre-export`
 *
 * Validates a shape before exporting to flutter:
 *   inspect_unsafe_construction_patterns → inspect_design_token_usage → lint_screen_composition
 */
export async function preExportCommand(
  client: PenpotMcpClient,
  output: Output
): Promise<void> {
  const tools = [
    "inspect_unsafe_construction_patterns",
    "inspect_design_token_usage",
    "lint_screen_composition",
  ];

  output.header("Pre-Export Design Validation");

  const results = await client.callSequence(
    tools.map(tool => ({ tool })),
    {
      onStep: ({ tool, index, total }) => {
        output.step(tool, `step ${index + 1}/${total}`);
      },
      onResult: (result) => {
        if (result.isError) {
          output.warn(`${result.toolName} reported issues: ${result.raw}`);
        } else {
          output.success(`${result.toolName} ok`);
        }
      },
    }
  );

  output.separator();

  if (output.isJson) {
    output.result({
      command: "pre-export",
      steps: results.map((r) => ({
        tool: r.toolName,
        ok: !r.isError,
        data: r.data,
      })),
    });
    return;
  }
}
