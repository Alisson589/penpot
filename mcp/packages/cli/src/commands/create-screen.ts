import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";
import { confirm } from "../prompt.js";

export interface CreateScreenOptions {
  name: string;
  devices: string[];
  yes?: boolean;
}

/**
 * `penpot-cli create-screen --name <name> --devices mobile,desktop`
 *
 * Orchestrates:
 *   plan_ui_build → [user confirmation] → confirm_structural_setup → create_screen_page → create_screen_shell
 */
export async function createScreenCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: CreateScreenOptions
): Promise<void> {
  output.header(`Create Screen: ${opts.name}`);

  // Step 1: Plan
  output.step("plan_ui_build", "planning UI build");
  const planResult = await client.callTool("plan_ui_build", {
    intent: `Create screen page "${opts.name}" with devices: ${opts.devices.join(", ")}`,
  });

  if (planResult.isError) {
    output.error(`plan_ui_build failed: ${planResult.raw}`);
    return;
  }
  output.success("Build plan created");

  // Show plan and confirm
  if (!opts.yes) {
    output.separator();
    output.info("Build plan:");
    output.result(planResult.data);
    output.separator();

    const confirmed = await confirm("Proceed with structural changes?");
    if (!confirmed) {
      output.warn("Aborted by user");
      return;
    }
  }

  // Step 2: Confirm structural setup
  output.step("confirm_structural_setup", "applying structural setup");
  const confirmResult = await client.callTool("confirm_structural_setup", {});
  if (confirmResult.isError) {
    output.error(`confirm_structural_setup failed: ${confirmResult.raw}`);
    return;
  }
  output.success("Structural setup confirmed");

  // Step 3: Create screen page
  output.step("create_screen_page", `creating page Screens/${opts.name}`);
  const pageResult = await client.callTool("create_screen_page", {
    name: opts.name,
    devices: opts.devices,
  });
  if (pageResult.isError) {
    output.error(`create_screen_page failed: ${pageResult.raw}`);
    return;
  }
  output.success("Screen page created");

  // Step 4: Create screen shell with a default column layout shell
  output.step("create_screen_shell", "creating screen shell");
  const shellResult = await client.callTool("create_screen_shell", {
    screenPageName: `Screens/${opts.name}`,
    name: `${opts.name} Shell`,
    root: {
      type: "board",
      role: "screen-shell",
      tokens: { fill: "color.surface" },
      layout: { kind: "column", width: "fill", height: "fill", padding: 24, gap: 16 },
      children: [
        {
          type: "board",
          name: `${opts.name} Body`,
          role: "section",
          layout: { kind: "column", width: "fill", height: "fill", gap: 12 },
          tokens: { fill: "color.surface.card", borderRadius: "radius.md" },
          children: [],
        },
      ],
    },
  });
  if (shellResult.isError) {
    output.error(`create_screen_shell failed: ${shellResult.raw}`);
    return;
  }
  output.success("Screen shell created");

  // Final output
  output.separator();
  if (output.isJson) {
    output.result({
      command: "create-screen",
      name: opts.name,
      devices: opts.devices,
      steps: {
        plan: planResult.data,
        structural: confirmResult.data,
        page: pageResult.data,
        shell: shellResult.data,
      },
    });
  } else {
    output.success(`Screen "${opts.name}" created successfully`);
    output.info("Next: use create-component + place-component to populate it");
  }
}
