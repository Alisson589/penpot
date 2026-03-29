import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

/**
 * `penpot-cli preflight`
 *
 * Runs the startup sequence:
 *   first_tool_recommended_flow → plugin_connection_status → inspect_project_setup
 */
export async function preflightCommand(
  client: PenpotMcpClient,
  output: Output
): Promise<void> {
  output.header("Preflight Check");

  const results = await client.callSequence(
    [
      { tool: "first_tool_recommended_flow" },
      { tool: "plugin_connection_status" },
      { tool: "inspect_project_setup" },
    ],
    {
      onStep: ({ tool, index, total }) => {
        output.step(tool, `step ${index + 1}/${total}`);
      },
      onResult: (result, index) => {
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
      command: "preflight",
      steps: results.map((r) => ({
        tool: r.toolName,
        ok: !r.isError,
        data: r.data,
      })),
    });
    return;
  }

  // Human-readable summary
  const allOk = results.every((r) => !r.isError);
  if (allOk) {
    output.success("Preflight complete — system is ready");

    // Extract connection status from plugin_connection_status result
    const statusResult = results.find(
      (r) => r.toolName === "plugin_connection_status"
    );
    if (statusResult && typeof statusResult.data === "object" && statusResult.data !== null) {
      const status = statusResult.data as Record<string, unknown>;
      output.keyValue({
        "Plugin connected": status.ready ?? "unknown",
        "Connected clients": status.connectedClientCount ?? 0,
        "Multi-user mode": status.multiUserMode ?? false,
      });
    }

    // Extract project info from inspect_project_setup result
    const projectResult = results.find(
      (r) => r.toolName === "inspect_project_setup"
    );
    if (projectResult && typeof projectResult.data === "object" && projectResult.data !== null) {
      output.separator();
      output.info("Project setup data available (use --json for full details)");
    }
  } else {
    const failed = results.filter((r) => r.isError);
    output.warn(
      `Preflight completed with ${failed.length} error(s)`
    );
    for (const f of failed) {
      output.error(`${f.toolName}: ${f.raw}`);
    }
  }
}
