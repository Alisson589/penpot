import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { CliConfig } from "./config.js";

/**
 * Wraps the MCP SDK client for calling Penpot MCP tools over Streamable HTTP.
 */
export class PenpotMcpClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport | null = null;
  private config: CliConfig;
  private connected = false;

  constructor(config: CliConfig) {
    this.config = config;
    this.client = new Client({
      name: "penpot-cli",
      version: "1.0.0",
    });
  }

  /**
   * Connects to the MCP server via Streamable HTTP transport.
   */
  async connect(): Promise<void> {
    const url = new URL(this.config.serverUrl);
    if (this.config.userToken) {
      url.searchParams.set("userToken", this.config.userToken);
    }

    this.transport = new StreamableHTTPClientTransport(url);
    await this.client.connect(this.transport);
    this.connected = true;
  }

  /**
   * Disconnects from the MCP server.
   */
  async disconnect(): Promise<void> {
    if (this.connected && this.transport) {
      await this.transport.close();
      this.connected = false;
    }
  }

  /**
   * Calls an MCP tool by name with the given arguments.
   * Returns the parsed text content from the tool response.
   */
  async callTool(
    name: string,
    args: Record<string, unknown> = {}
  ): Promise<ToolResult> {
    if (!this.connected) {
      throw new Error(
        "Not connected to MCP server. Call connect() first."
      );
    }

    const result = await this.client.callTool({ name, arguments: args });

    // Extract text content from the MCP response
    const content = result.content as Array<{ type: string; text?: string }>;
    const textParts = content
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!);

    const rawText = textParts.join("\n");

    // Try to parse as JSON
    let parsed: unknown = rawText;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Keep as raw text
    }

    return {
      toolName: name,
      raw: rawText,
      data: parsed,
      isError: result.isError ?? false,
    };
  }

  /**
   * Calls a sequence of MCP tools in order, collecting results.
   * If any tool fails and `stopOnError` is true, stops immediately.
   */
  async callSequence(
    steps: Array<{ tool: string; args?: Record<string, unknown> }>,
    options?: {
      stopOnError?: boolean;
      onStep?: (step: { tool: string; index: number; total: number }) => void;
      onResult?: (result: ToolResult, index: number) => void;
    }
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    const stopOnError = options?.stopOnError ?? true;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      options?.onStep?.({ tool: step.tool, index: i, total: steps.length });

      try {
        const result = await this.callTool(step.tool, step.args ?? {});
        results.push(result);
        options?.onResult?.(result, i);

        if (result.isError && stopOnError) {
          break;
        }
      } catch (error) {
        const errorResult: ToolResult = {
          toolName: step.tool,
          raw: String(error),
          data: { error: String(error) },
          isError: true,
        };
        results.push(errorResult);
        options?.onResult?.(errorResult, i);

        if (stopOnError) break;
      }
    }

    return results;
  }
}

export interface ToolResult {
  toolName: string;
  raw: string;
  data: unknown;
  isError: boolean;
}
