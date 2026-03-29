import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface CliConfig {
  serverUrl: string;
  userToken: string | null;
  outputFormat: "human" | "json";
}

const DEFAULT_CONFIG: CliConfig = {
  serverUrl: "http://localhost:4401/mcp",
  userToken: null,
  outputFormat: "human",
};

/**
 * Loads CLI configuration from multiple sources with the following priority:
 * 1. Environment variables (highest)
 * 2. Local `.penpot-cli.json` in current directory
 * 3. Global `~/.config/penpot-cli/config.json`
 * 4. Defaults (lowest)
 */
export function loadConfig(overrides?: Partial<CliConfig>): CliConfig {
  let config: CliConfig = { ...DEFAULT_CONFIG };

  // global config
  const globalPath = join(homedir(), ".config", "penpot-cli", "config.json");
  config = mergeFromFile(config, globalPath);

  // local config
  const localPath = join(process.cwd(), ".penpot-cli.json");
  config = mergeFromFile(config, localPath);

  // env vars
  if (process.env.PENPOT_CLI_SERVER_URL) {
    config.serverUrl = process.env.PENPOT_CLI_SERVER_URL;
  }
  if (process.env.PENPOT_CLI_USER_TOKEN) {
    config.userToken = process.env.PENPOT_CLI_USER_TOKEN;
  }
  if (
    process.env.PENPOT_CLI_OUTPUT_FORMAT === "json" ||
    process.env.PENPOT_CLI_OUTPUT_FORMAT === "human"
  ) {
    config.outputFormat = process.env.PENPOT_CLI_OUTPUT_FORMAT;
  }

  // CLI flag overrides
  if (overrides) {
    if (overrides.serverUrl) config.serverUrl = overrides.serverUrl;
    if (overrides.userToken !== undefined)
      config.userToken = overrides.userToken;
    if (overrides.outputFormat) config.outputFormat = overrides.outputFormat;
  }

  return config;
}

function mergeFromFile(config: CliConfig, filePath: string): CliConfig {
  if (!existsSync(filePath)) return config;
  try {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CliConfig>;
    return { ...config, ...parsed };
  } catch {
    return config;
  }
}
