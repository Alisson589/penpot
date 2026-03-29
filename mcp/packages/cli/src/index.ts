import { Command } from "commander";
import { loadConfig } from "./config.js";
import { Output } from "./output.js";
import { PenpotMcpClient } from "./client.js";

// Commands
import { preflightCommand } from "./commands/preflight.js";
import {
  createScreenCommand,
  type CreateScreenOptions,
} from "./commands/create-screen.js";
import {
  createComponentCommand,
  type CreateComponentOptions,
} from "./commands/create-component.js";
import { publishComponentsCommand } from "./commands/publish-components.js";
import {
  placeComponentCommand,
  type PlaceComponentOptions,
} from "./commands/place-component.js";
import { tokensPlanCommand, tokensSetupCommand } from "./commands/tokens.js";
import { lintCommand, type LintOptions } from "./commands/lint.js";
import {
  exportFlutterCommand,
  type ExportFlutterOptions,
} from "./commands/export-flutter.js";

const VERSION = "1.0.0";

const program = new Command();

program
  .name("penpot-cli")
  .description(
    "CLI for orchestrating Penpot MCP tools in the correct order.\n\n" +
      "Requires a running Penpot MCP server (default: http://localhost:4401/mcp)\n" +
      "and a connected Penpot MCP Plugin."
  )
  .version(VERSION)
  .option(
    "--server-url <url>",
    "MCP server URL",
    "http://localhost:4401/mcp"
  )
  .option("--user-token <token>", "User token for multi-user mode")
  .option("--json", "Output raw JSON instead of human-readable text");

/**
 * Creates a connected MCP client and Output instance from the global CLI options.
 */
async function createContext(
  cmd: Command
): Promise<{ client: PenpotMcpClient; output: Output }> {
  const opts = cmd.optsWithGlobals();
  const config = loadConfig({
    serverUrl: opts.serverUrl,
    userToken: opts.userToken,
    outputFormat: opts.json ? "json" : "human",
  });

  const output = new Output(config.outputFormat);
  const client = new PenpotMcpClient(config);

  try {
    await client.connect();
  } catch (error) {
    output.error(
      `Failed to connect to MCP server at ${config.serverUrl}: ${error}`
    );
    output.info("Make sure the MCP server is running (pnpm run start)");
    process.exit(1);
  }

  return { client, output };
}

/**
 * Wraps a command handler with connect/disconnect lifecycle.
 */
function withClient(
  fn: (client: PenpotMcpClient, output: Output, cmd: Command) => Promise<void>
) {
  return async function (this: Command) {
    const cmd = this;
    const { client, output } = await createContext(cmd);
    try {
      await fn(client, output, cmd);
    } catch (error) {
      output.error(`Command failed: ${error}`);
      process.exit(1);
    } finally {
      await client.disconnect();
    }
  };
}

// ============================================================================
// Commands
// ============================================================================

program
  .command("preflight")
  .description(
    "Run startup checks: recommended flow, plugin status, project setup"
  )
  .action(
    withClient(async (client, output) => {
      await preflightCommand(client, output);
    })
  );

program
  .command("create-screen")
  .description("Create a new screen page with device frames")
  .requiredOption("-n, --name <name>", "Screen name (e.g. Dashboard, Home)")
  .option(
    "-d, --devices <devices>",
    "Comma-separated device list: mobile,tablet,desktop",
    "mobile,desktop"
  )
  .option("-y, --yes", "Skip confirmation prompt")
  .action(
    withClient(async (client, output, cmd) => {
      const opts = cmd.opts();
      const options: CreateScreenOptions = {
        name: opts.name,
        devices: (opts.devices as string).split(",").map((d: string) => d.trim()),
        yes: opts.yes,
      };
      await createScreenCommand(client, output, options);
    })
  );

program
  .command("create-component")
  .description("Create a reusable component in _Components")
  .requiredOption("-n, --name <name>", "Component name")
  .option("-c, --category <category>", "Component category")
  .action(
    withClient(async (client, output, cmd) => {
      const opts = cmd.opts();
      const options: CreateComponentOptions = {
        name: opts.name,
        category: opts.category,
      };
      await createComponentCommand(client, output, options);
    })
  );

program
  .command("publish-components")
  .description("Publish components from _Components to the local library")
  .action(
    withClient(async (client, output) => {
      await publishComponentsCommand(client, output);
    })
  );

program
  .command("place-component")
  .description("Place a component instance on a screen page")
  .requiredOption(
    "--component <name>",
    "Name of the component to place"
  )
  .requiredOption(
    "--screen <page>",
    "Target screen page name"
  )
  .action(
    withClient(async (client, output, cmd) => {
      const opts = cmd.opts();
      const options: PlaceComponentOptions = {
        componentName: opts.component,
        screenPage: opts.screen,
      };
      await placeComponentCommand(client, output, options);
    })
  );

// Tokens sub-commands
const tokensCmd = program
  .command("tokens")
  .description("Design token management");

tokensCmd
  .command("plan")
  .description(
    "Plan design token system and suggest token names"
  )
  .action(
    withClient(async (client, output) => {
      await tokensPlanCommand(client, output);
    })
  );

tokensCmd
  .command("setup")
  .description(
    "Normalize and set up the design token system"
  )
  .action(
    withClient(async (client, output) => {
      await tokensSetupCommand(client, output);
    })
  );

// Lint
program
  .command("lint")
  .description(
    "Run all validation checks: components layout, screen composition, unsafe patterns"
  )
  .option("--page-id <id>", "Specific page ID to lint")
  .action(
    withClient(async (client, output, cmd) => {
      const opts = cmd.opts();
      const options: LintOptions = {
        pageId: opts.pageId,
      };
      await lintCommand(client, output, options);
    })
  );

// Export sub-commands
const exportCmd = program
  .command("export")
  .description("Export workflows");

exportCmd
  .command("flutter")
  .description(
    "Export Penpot design to Flutter: build export tree, then generate Dart"
  )
  .option("--shape-id <id>", "Root shape ID to export")
  .option("--page-id <id>", "Page ID to export")
  .action(
    withClient(async (client, output, cmd) => {
      const opts = cmd.opts();
      const options: ExportFlutterOptions = {
        shapeId: opts.shapeId,
        pageId: opts.pageId,
      };
      await exportFlutterCommand(client, output, options);
    })
  );

// Parse and run
program.parse();
