import { createInterface } from "readline";

/**
 * Interactive confirmation prompt.
 * Returns true if user answers y/Y/yes, false otherwise.
 */
export async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question(`  ${message} [y/N] `, (answer) => {
      rl.close();
      resolve(
        answer.trim().toLowerCase() === "y" ||
          answer.trim().toLowerCase() === "yes"
      );
    });
  });
}

/**
 * Interactive text input prompt.
 */
export async function prompt(message: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(`  ${message}: `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
