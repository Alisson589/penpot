import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

/**
 * `penpot-cli init`
 *
 * Runs the recommended startup sequence:
 *   first_tool_recommended_flow → plugin_connection_status →
 *   inspect_project_setup → inspect_canvas
 */
export async function initCommand(
  client: PenpotMcpClient,
  output: Output
): Promise<void> {
  output.header("Penpot CLI Init (Startup Sequence)");

  const results = await client.callSequence(
    [
      { tool: "first_tool_recommended_flow" },
      { tool: "plugin_connection_status" },
      { tool: "inspect_project_setup" },
      { tool: "inspect_canvas" },
    ],
    {
      onStep: ({ tool, index, total }) => {
        output.step(tool, `step ${index + 1}/${total}`);
      },
      onResult: (result) => {
        if (result.isError) {
          output.error(`${result.toolName} failed: ${result.raw}`);
        } else {
          output.success(`${result.toolName} completed`);
        }
      },
    }
  );

  output.separator();

  if (output.isJson) {
    output.result({
      command: "init",
      steps: results.map((r) => ({
        tool: r.toolName,
        ok: !r.isError,
        data: r.data,
      })),
    });
    return;
  }

  const allOk = results.every((r) => !r.isError);
  if (allOk) {
    output.success("Init complete — system is ready and canvas inspected");
  } else {
    const failed = results.filter((r) => r.isError);
    output.warn(`Init completed with ${failed.length} error(s)`);
  }

  output.info(`
============================================================
🤖 CRITICAL AGENT INSTRUCTIONS FOR UI BUILDING
============================================================
1. CLI vs MCP BOUNDARY:
   - Use penpot-cli for macro checks (init, health-check, pre-export).
   - Use MCP Tools directly for constructing UI (e.g., create_component_shell, create_text_block).
   - DO NOT USE CLI TO CREATE UI. It does not accept complex JSON natively.

2. execute_code LIMITATIONS & RULES:
   - Never inject Javascript to build screens if high-level MCP tools exist.
   - Penpot 'width' & 'height' properties are READ-ONLY. Use node.resize(w, h).
   - React/CSS properties like 'flexStart' or 'spaceBetween' DO NOT EXIST in Penpot. 
     You MUST use 'start', 'end', 'space-between', 'center' instead.
============================================================`);
}
