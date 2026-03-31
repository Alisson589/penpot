import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

export interface AssembleScreenOptions {
  name: string;
  device: string;
  components?: string[];
  offsetY?: number;
}

/**
 * `penpot-cli assemble-screen --name <name> --device desktop [--components "A,B,C"]`
 *
 * Orchestrates:
 *   inspect_project_setup → find_local_components (validate) → assemble_screen_on_components_page
 *   → [inform user to copy to Screens/* manually]
 *
 * This bypasses cross-page instability by building the screen board
 * directly on `_Components` with a Y offset (default 5000).
 */
export async function assembleScreenCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: AssembleScreenOptions
): Promise<void> {
  output.header(`Assemble Screen: ${opts.name} (${opts.device})`);

  // Step 1: Check project setup
  output.step("inspect_project_setup", "checking project setup");
  const setupResult = await client.callTool("inspect_project_setup", {});
  if (setupResult.isError) {
    output.error(`inspect_project_setup failed: ${setupResult.raw}`);
    return;
  }
  output.success("Project setup inspected");

  // Step 2: Validate components exist (if specified)
  if (opts.components && opts.components.length > 0) {
    output.step("find_local_components", "validating components exist");
    const findResult = await client.callTool("find_local_components", {});
    if (findResult.isError) {
      output.warn(`find_local_components failed: ${findResult.raw}`);
      output.info("Proceeding anyway — components may fail to instantiate");
    } else {
      output.success("Local components catalogue loaded");
    }
  }

  // Step 3: Assemble on _Components page
  output.step(
    "assemble_screen_on_components_page",
    `creating screen board on _Components (y: ${opts.offsetY ?? 5000})`
  );

  const assembleArgs: Record<string, unknown> = {
    screenName: opts.name,
    device: opts.device,
    offsetY: opts.offsetY ?? 5000,
  };
  if (opts.components && opts.components.length > 0) {
    assembleArgs.components = opts.components;
  }

  const assembleResult = await client.callTool(
    "assemble_screen_on_components_page",
    assembleArgs
  );

  if (assembleResult.isError) {
    output.error(
      `assemble_screen_on_components_page failed: ${assembleResult.raw}`
    );
    return;
  }
  output.success("Screen board assembled on _Components");

  // Final output
  output.separator();
  if (output.isJson) {
    output.result({
      command: "assemble-screen",
      name: opts.name,
      device: opts.device,
      data: assembleResult.data,
    });
  } else {
    output.success(
      `Screen "${opts.name}/${opts.device}" assembled on _Components page`
    );
    output.separator();
    output.info("📋 Next steps:");
    output.info("  1. Open _Components in Penpot and review the screen board (at Y ~5000)");
    output.info(`  2. Select the board "${opts.name}/..." and Ctrl+C to copy`);
    output.info(`  3. Navigate to Screens/${opts.name} page (create if needed)`);
    output.info("  4. Ctrl+V to paste");
    output.info("  5. Return to _Components and delete the original board");
    output.separator();
    output.warn(
      "The Plugin API does not support cross-page copy/paste — this step requires manual action."
    );
  }
}
