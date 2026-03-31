import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

export interface BuildComponentOptions {
  name: string;
  category?: string;
}

/**
 * `penpot-cli build-component`
 *
 * Orchestrates:
 *   create_component_shell → organize_component_in_components_page →
 *   validate_components_page_layout → publish_components_from_components_page
 */
export async function buildComponentCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: BuildComponentOptions
): Promise<void> {
  output.header(`Build Component Flow: ${opts.name}`);

  const results = await client.callSequence(
    [
      { tool: "create_component_shell", args: { name: opts.name, category: opts.category } },
      { tool: "organize_component_in_components_page" },
      { tool: "validate_components_page_layout" },
      { tool: "publish_components_from_components_page" },
    ],
    {
      onStep: ({ tool, index, total }) => {
        output.step(tool, `step ${index + 1}/${total}`);
      },
      onResult: (result) => {
        if (result.isError) {
          output.error(`${result.toolName} failed: ${result.raw}`);
          throw new Error(`Flow interrupted at ${result.toolName}`);
        } else {
          output.success(`${result.toolName} completed`);
        }
      },
    }
  );

  output.separator();

  if (output.isJson) {
    output.result({
      command: "build-component",
      name: opts.name,
      steps: results.map((r) => ({
        tool: r.toolName,
        ok: !r.isError,
        data: r.data,
      })),
    });
    return;
  }

  output.success(`Component "${opts.name}" successfully built, organized, validated, and published!`);
}
