import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

export interface LintOptions {
  pageId?: string;
}

/**
 * `penpot-cli lint [--page-id <id>]`
 *
 * Orchestrates:
 *   validate_components_page_layout → lint_screen_composition → inspect_unsafe_construction_patterns
 */
export async function lintCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: LintOptions
): Promise<void> {
  output.header("Lint");

  const issues: Array<{ tool: string; data: unknown }> = [];

  // Step 1: Validate components page layout
  output.step("validate_components_page_layout", "checking _Components layout");
  const validateResult = await client.callTool(
    "validate_components_page_layout",
    {}
  );
  if (validateResult.isError) {
    output.warn(`validate_components_page_layout: ${validateResult.raw}`);
  } else {
    output.success("_Components layout checked");
  }
  issues.push({ tool: "validate_components_page_layout", data: validateResult.data });

  // Step 2: Lint screen composition
  output.step("lint_screen_composition", "checking screen composition");
  const lintArgs: Record<string, unknown> = {};
  if (opts.pageId) lintArgs.pageId = opts.pageId;

  const lintResult = await client.callTool("lint_screen_composition", lintArgs);
  if (lintResult.isError) {
    output.warn(`lint_screen_composition: ${lintResult.raw}`);
  } else {
    output.success("Screen composition checked");
  }
  issues.push({ tool: "lint_screen_composition", data: lintResult.data });

  // Step 3: Inspect unsafe patterns
  output.step(
    "inspect_unsafe_construction_patterns",
    "checking for unsafe patterns"
  );
  const unsafeArgs: Record<string, unknown> = {};
  if (opts.pageId) unsafeArgs.pageId = opts.pageId;

  const unsafeResult = await client.callTool(
    "inspect_unsafe_construction_patterns",
    unsafeArgs
  );
  if (unsafeResult.isError) {
    output.warn(
      `inspect_unsafe_construction_patterns: ${unsafeResult.raw}`
    );
  } else {
    output.success("Unsafe patterns checked");
  }
  issues.push({
    tool: "inspect_unsafe_construction_patterns",
    data: unsafeResult.data,
  });

  // Final output
  output.separator();
  if (output.isJson) {
    output.result({
      command: "lint",
      pageId: opts.pageId ?? null,
      results: issues,
    });
  } else {
    output.success("Lint complete — review results above");
    output.info("Fix any issues before exporting to Flutter");
  }
}
