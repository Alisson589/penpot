import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

export interface CreateComponentOptions {
  name: string;
  category?: string;
}

/**
 * `penpot-cli create-component --name <name> [--category <category>]`
 *
 * Orchestrates:
 *   create_component_shell → organize_component_in_components_page → validate_components_page_layout
 */
export async function createComponentCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: CreateComponentOptions
): Promise<void> {
  output.header(`Create Component: ${opts.name}`);

  // Pre-check tokens
  output.step("inspect_design_tokens", "checking token catalog");
  const tokens = await client.callTool("inspect_design_tokens", {});
  if (tokens.isError) {
    output.error(`inspect_design_tokens failed: ${tokens.raw}`);
    return;
  }
  const tokenCount = tokens.data?.tokenCount ?? 0;
  if (tokenCount === 0) {
    output.error(
      "Token catalog is empty. Run `penpot-cli tokens plan` and `penpot-cli tokens setup` before creating components."
    );
    return;
  }

  // Step 1: Create component shell
  output.step("create_component_shell", `creating shell for "${opts.name}"`);
  const shellArgs: Record<string, unknown> = { name: opts.name };
  if (opts.category) {
    shellArgs.category = opts.category;
  }
  const shellResult = await client.callTool("create_component_shell", shellArgs);
  if (shellResult.isError) {
    output.error(`create_component_shell failed: ${shellResult.raw}`);
    return;
  }
  output.success("Component shell created");

  // Step 2: Organize in _Components page
  output.step(
    "organize_component_in_components_page",
    "organizing in _Components page"
  );
  const organizeResult = await client.callTool(
    "organize_component_in_components_page",
    { componentName: opts.name }
  );
  if (organizeResult.isError) {
    output.error(
      `organize_component_in_components_page failed: ${organizeResult.raw}`
    );
    return;
  }
  output.success("Component organized");

  // Step 3: Validate layout
  output.step(
    "validate_components_page_layout",
    "validating _Components layout"
  );
  const validateResult = await client.callTool(
    "validate_components_page_layout",
    {}
  );
  if (validateResult.isError) {
    output.warn(
      `validate_components_page_layout reported issues: ${validateResult.raw}`
    );
  } else {
    output.success("Layout validation passed");
  }

  // Final output
  output.separator();
  if (output.isJson) {
    output.result({
      command: "create-component",
      name: opts.name,
      category: opts.category ?? null,
      tokens: tokens.data,
      steps: {
        shell: shellResult.data,
        organize: organizeResult.data,
        validate: validateResult.data,
      },
    });
  } else {
    output.success(`Component "${opts.name}" created in _Components`);
    output.info(
      "Next: use publish-components to make it available in the local library"
    );
  }
}
