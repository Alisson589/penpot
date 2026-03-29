import chalk from "chalk";
import ora, { type Ora } from "ora";

/**
 * Output formatter supporting both human-readable and JSON modes.
 */
export class Output {
  private format: "human" | "json";

  constructor(format: "human" | "json") {
    this.format = format;
  }

  get isJson(): boolean {
    return this.format === "json";
  }

  /**
   * Print a final result. In JSON mode, outputs raw JSON.
   * In human mode, outputs formatted text.
   */
  result(data: unknown): void {
    if (this.isJson) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      if (typeof data === "string") {
        console.log(data);
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  /** Header line — only in human mode */
  header(text: string): void {
    if (!this.isJson) {
      console.log(chalk.bold.cyan(`\n🔷 ${text}`));
    }
  }

  /** Success line — only in human mode */
  success(text: string): void {
    if (!this.isJson) {
      console.log(chalk.green(`  ✅ ${text}`));
    }
  }

  /** Warning line — only in human mode */
  warn(text: string): void {
    if (!this.isJson) {
      console.log(chalk.yellow(`  ⚠️  ${text}`));
    }
  }

  /** Error line — always visible */
  error(text: string): void {
    if (this.isJson) {
      console.error(JSON.stringify({ error: text }));
    } else {
      console.error(chalk.red(`  ❌ ${text}`));
    }
  }

  /** Info line — only in human mode */
  info(text: string): void {
    if (!this.isJson) {
      console.log(chalk.gray(`  ℹ️  ${text}`));
    }
  }

  /** Dimmed step description — only in human mode */
  step(tool: string, description?: string): void {
    if (!this.isJson) {
      const desc = description ? chalk.dim(` — ${description}`) : "";
      console.log(chalk.white(`  → ${chalk.bold(tool)}${desc}`));
    }
  }

  /** Create a spinner (no-op in JSON mode) */
  spinner(text: string): Ora {
    if (this.isJson) {
      // Return a dummy spinner that does nothing
      return ora({ text, isEnabled: false });
    }
    return ora({ text, color: "cyan" }).start();
  }

  /** Print a separator line — only in human mode */
  separator(): void {
    if (!this.isJson) {
      console.log(chalk.dim("  ──────────────────────────────────"));
    }
  }

  /** Print key-value pairs nicely — only in human mode */
  keyValue(pairs: Record<string, unknown>): void {
    if (!this.isJson) {
      for (const [key, value] of Object.entries(pairs)) {
        const val =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        console.log(`  ${chalk.bold(key)}: ${val}`);
      }
    }
  }
}
