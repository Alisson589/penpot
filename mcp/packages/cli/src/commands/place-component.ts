import type { PenpotMcpClient } from "../client.js";
import type { Output } from "../output.js";

export interface PlaceComponentOptions {
  componentName: string;
  screenPage: string;
  targetShapeId?: string;
}

/**
 * `penpot-cli place-component --component <name> --screen <page>`
 *
 * Wraps: place_component_on_screen
 */
export async function placeComponentCommand(
  client: PenpotMcpClient,
  output: Output,
  opts: PlaceComponentOptions
): Promise<void> {
  output.header(
    `Place Component: ${opts.componentName} → ${opts.screenPage}`
  );

  const spinner = output.spinner(
    `Placing "${opts.componentName}" on "${opts.screenPage}"...`
  );

  const result = await client.callTool("place_component_on_screen", {
    componentName: opts.componentName,
    screenPageName: opts.screenPage,
    targetShapeId: opts.targetShapeId,
  });

  spinner.stop();

  if (result.isError) {
    output.error(`place_component_on_screen failed: ${result.raw}`);
    return;
  }

  output.separator();
  if (output.isJson) {
    output.result({
      command: "place-component",
      component: opts.componentName,
      screen: opts.screenPage,
      data: result.data,
    });
  } else {
    output.success(
      `"${opts.componentName}" placed on "${opts.screenPage}"`
    );
  }
}
