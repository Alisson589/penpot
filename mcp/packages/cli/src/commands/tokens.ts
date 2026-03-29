import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

/**
 * `penpot-cli tokens plan`
 *
 * Orchestrates: plan_design_token_system → suggest_design_token_names
 */
export async function tokensPlanCommand(
  client: PenpotMcpClient,
  output: Output
): Promise<void> {
  output.header("Design Tokens — Plan");

  // Step 1: Plan token system
  output.step("plan_design_token_system", "analysing current token state");
  const planResult = await client.callTool("plan_design_token_system", {});
  if (planResult.isError) {
    output.error(`plan_design_token_system failed: ${planResult.raw}`);
    return;
  }
  output.success("Token system plan created");

  // Step 2: Suggest names
  output.step("suggest_design_token_names", "suggesting token names");
  const suggestResult = await client.callTool("suggest_design_token_names", {});
  if (suggestResult.isError) {
    output.error(`suggest_design_token_names failed: ${suggestResult.raw}`);
    return;
  }
  output.success("Token names suggested");

  output.separator();
  if (output.isJson) {
    output.result({
      command: "tokens-plan",
      steps: {
        plan: planResult.data,
        suggestions: suggestResult.data,
      },
    });
  } else {
    output.success("Token plan complete");
    output.info("Review the suggestions above, then run: penpot-cli tokens setup");

    // Show summary if available
    if (planResult.data && typeof planResult.data === "object") {
      output.separator();
      output.info("Plan details:");
      output.result(planResult.data);
    }
    if (suggestResult.data && typeof suggestResult.data === "object") {
      output.separator();
      output.info("Suggested names:");
      output.result(suggestResult.data);
    }
  }
}

/**
 * `penpot-cli tokens setup`
 *
 * Orchestrates: normalize_design_token_payload → setup_design_token_system
 */
export async function tokensSetupCommand(
  client: PenpotMcpClient,
  output: Output
): Promise<void> {
  output.header("Design Tokens — Setup");

  // Step 1: Normalize payload
  output.step("normalize_design_token_payload", "normalizing token payload");
  const normalizeResult = await client.callTool(
    "normalize_design_token_payload",
    {}
  );
  if (normalizeResult.isError) {
    output.error(
      `normalize_design_token_payload failed: ${normalizeResult.raw}`
    );
    return;
  }
  output.success("Token payload normalized");

  // Step 2: Setup token system
  output.step("setup_design_token_system", "setting up token system");
  const setupResult = await client.callTool("setup_design_token_system", {});
  if (setupResult.isError) {
    output.error(`setup_design_token_system failed: ${setupResult.raw}`);
    return;
  }
  output.success("Token system set up");

  output.separator();
  if (output.isJson) {
    output.result({
      command: "tokens-setup",
      steps: {
        normalize: normalizeResult.data,
        setup: setupResult.data,
      },
    });
  } else {
    output.success(
      "Design token system is ready"
    );
    output.info(
      "Use apply_design_tokens_to_shape to bind tokens to specific shapes"
    );
  }
}
