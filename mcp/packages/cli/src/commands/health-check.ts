import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

/**
 * `penpot-cli health-check`
 *
 * Runs full diagnostics:
 *   first_tool_recommended_flow → plugin_connection_status → inspect_project_setup →
 *   inspect_canvas → find_local_components → inspect_design_tokens
 */
export async function healthCheckCommand(
  client: PenpotMcpClient,
  output: Output
): Promise<void> {
  const tools = [
    "first_tool_recommended_flow",
    "plugin_connection_status",
    "inspect_project_setup",
    "inspect_canvas",
    "find_local_components",
    "inspect_design_tokens",
  ];

  output.header("Penpot Diagnostics & Health Check");

  const results = await client.callSequence(
    tools.map(tool => ({ tool })),
    {
      onStep: ({ tool, index, total }) => {
        output.step(tool, `step ${index + 1}/${total}`);
      },
      onResult: (result) => {
        if (result.isError) {
          output.error(`${result.toolName} failed: ${result.raw}`);
        } else {
          output.success(`${result.toolName} ok`);
        }
      },
    }
  );

  output.separator();

  if (output.isJson) {
    output.result({
      command: "health-check",
      steps: results.map((r) => ({
        tool: r.toolName,
        ok: !r.isError,
        data: r.data,
      })),
    });
    return;
  }
}
