import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

/**
 * `penpot-cli publish-components`
 *
 * Wraps: publish_components_from_components_page
 */
export async function publishComponentsCommand(
  client: PenpotMcpClient,
  output: Output
): Promise<void> {
  output.header("Publish Components");

  const spinner = output.spinner("Publishing components from _Components page...");

  const result = await client.callTool(
    "publish_components_from_components_page",
    {}
  );

  spinner.stop();

  if (result.isError) {
    output.error(`publish failed: ${result.raw}`);
    return;
  }

  output.separator();
  if (output.isJson) {
    output.result({
      command: "publish-components",
      data: result.data,
    });
  } else {
    output.success("Components published to local library");
    output.info("They are now available for placement on screen pages");
  }
}
