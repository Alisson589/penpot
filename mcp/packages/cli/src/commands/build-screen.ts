import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

export interface BuildScreenOptions {
  name: string;
  device: string;
  components?: string[];
}

/**
 * `penpot-cli build-screen`
 *
 * Orchestrates:
 *   assemble_screen_on_components_page → lint_screen_composition
 */
export async function buildScreenCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: BuildScreenOptions
): Promise<void> {
  output.header(`Build Screen Flow: ${opts.name} (${opts.device})`);

  const results = await client.callSequence(
    [
      { 
        tool: "assemble_screen_on_components_page", 
        args: { 
          screenName: opts.name, 
          device: opts.device, 
          components: opts.components || [], 
          offsetY: 6000 
        } 
      },
      { tool: "lint_screen_composition" },
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
      command: "build-screen",
      name: opts.name,
      steps: results.map((r) => ({
        tool: r.toolName,
        ok: !r.isError,
        data: r.data,
      })),
    });
    return;
  }

  output.success(`Screen "${opts.name}" built and linted on _Components page`);
  output.info("Next steps: Review in _Components, then copy/paste to your Screens page.");
}
