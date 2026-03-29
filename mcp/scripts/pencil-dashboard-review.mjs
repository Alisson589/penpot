import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const exportDir = path.join(repoRoot, "export");

const sessionId = process.env.PENPOT_MCP_SESSION_ID;
const rootId = process.env.PENPOT_DASHBOARD_ROOT_ID;
const mcpUrl = process.env.PENPOT_MCP_URL ?? "http://127.0.0.1:4401/mcp";

if (!sessionId) {
  throw new Error("Missing PENPOT_MCP_SESSION_ID");
}

if (!rootId) {
  throw new Error("Missing PENPOT_DASHBOARD_ROOT_ID");
}

function parseSseResponse(text) {
  const dataLines = text
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6));

  if (dataLines.length === 0) {
    throw new Error(`Invalid MCP response: ${text.slice(0, 500)}`);
  }

  return JSON.parse(dataLines[dataLines.length - 1]);
}

function extractTextResult(message) {
  const textItem = message?.result?.content?.find((item) => item.type === "text");
  if (!textItem?.text) {
    throw new Error("Expected text result from MCP");
  }

  const parsed = JSON.parse(textItem.text);
  if (parsed.error) {
    throw new Error(parsed.error);
  }

  return parsed.result;
}

function extractImageResult(message) {
  const imageItem = message?.result?.content?.find((item) => item.type === "image");
  if (!imageItem?.data) {
    throw new Error("Expected image result from MCP");
  }

  return imageItem;
}

async function callTool(name, args, id) {
  const payload = {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: { name, arguments: args },
  };

  const response = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  return parseSseResponse(text);
}

function buildReviewHtml({ rootShapeId, exportTargetId, findings, imageBase64 }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pencil Dashboard Review</title>
  <style>
    :root {
      --bg: #edf3fa;
      --panel: #ffffff;
      --ink: #0f172a;
      --muted: #475569;
      --line: #dbe4ef;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      background: radial-gradient(circle at top left, #f8fbff, var(--bg));
      color: var(--ink);
    }
    .shell {
      max-width: 1480px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 24px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
    }
    h1 { margin: 0 0 12px; font-size: 28px; }
    p, li { color: var(--muted); line-height: 1.5; }
    ul { padding-left: 20px; margin: 16px 0 0; }
    code {
      background: #f8fafc;
      border-radius: 8px;
      padding: 2px 6px;
      color: #1d4ed8;
    }
    img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 18px;
      border: 1px solid var(--line);
    }
  </style>
</head>
<body>
  <div class="shell">
    <section class="panel">
      <h1>Pencil Dashboard Review</h1>
      <p>Visual review for the library-first dashboard assembled through MCP and Pencil components.</p>
      <p><strong>Root:</strong> <code>${rootShapeId}</code></p>
      <p><strong>Export target:</strong> <code>${exportTargetId}</code></p>
      <ul>${findings.map((finding) => `<li>${finding}</li>`).join("")}</ul>
    </section>
    <section class="panel">
      <img src="data:image/png;base64,${imageBase64}" alt="Pencil dashboard export" />
    </section>
  </div>
</body>
</html>`;
}

async function main() {
  const findings = [];
  let exportTargetId = rootId;
  let exportMessage = await callTool("export_shape", { shapeId: rootId }, "pencil-export-root");
  let imageResult;

  try {
    imageResult = extractImageResult(exportMessage);
    findings.push("Dashboard root export succeeded.");
  } catch (error) {
    findings.push(`Dashboard root export failed: ${error.message}`);
    const treeMessage = await callTool(
      "execute_code",
      {
        code: `
          const root = penpot.currentPage?.findShapeById?.("${rootId}");
          if (!root) return { rootFound: false, all: [] };
          const all = [];
          const walk = (shape) => {
            all.push({ id: shape.id, name: shape.name, type: shape.type });
            for (const child of shape.children || []) walk(child);
          };
          walk(root);
          return { rootFound: true, all };
        `,
      },
      "pencil-export-list-subtree",
    );
    const treeResult = extractTextResult(treeMessage);
    const fallbackNode =
      treeResult.all.find((node) => node.name === "MRR Card") ??
      treeResult.all.find((node) => node.type === "metric_card") ??
      treeResult.all.find((node) => node.id !== rootId);

    if (!fallbackNode) {
      throw error;
    }

    exportTargetId = fallbackNode.id;
    exportMessage = await callTool(
      "export_shape",
      { shapeId: exportTargetId },
      "pencil-export-fallback",
    );
    imageResult = extractImageResult(exportMessage);
    findings.push(
      `Fallback export succeeded for ${fallbackNode.name} (${fallbackNode.type}).`,
    );
  }

  await fs.mkdir(exportDir, { recursive: true });
  const pngPath = path.join(exportDir, "pencil-dashboard-demo.png");
  await fs.writeFile(pngPath, Buffer.from(imageResult.data, "base64"));

  const htmlPath = path.join(exportDir, "pencil-dashboard-review.html");
  await fs.writeFile(
    htmlPath,
    buildReviewHtml({
      rootShapeId: rootId,
      exportTargetId,
      findings,
      imageBase64: imageResult.data,
    }),
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.screenshot({
    path: path.join(exportDir, "pencil-dashboard-review.png"),
    fullPage: true,
  });
  await browser.close();

  console.log(
    JSON.stringify(
      {
        rootId,
        exportTargetId,
        pngPath,
        htmlPath,
        findings,
      },
      null,
      2,
    ),
  );
}

await main();
