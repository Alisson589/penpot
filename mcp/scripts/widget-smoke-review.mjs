import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import {
  createDashboardSmokePayload,
  createExportShapeToolPayload,
  serializePayload,
} from "../packages/common/dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const exportDir = path.join(repoRoot, "export");

const sessionId = process.env.PENPOT_MCP_SESSION_ID;
const mcpUrl = process.env.PENPOT_MCP_URL ?? "http://127.0.0.1:4401/mcp";

if (!sessionId) {
  console.error("Missing PENPOT_MCP_SESSION_ID");
  process.exit(1);
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
    throw new Error(extractTextContent(message) ?? "Expected image result from MCP");
  }

  return imageItem;
}

function extractTextContent(message) {
  const textItem = message?.result?.content?.find((item) => item.type === "text");
  return textItem?.text ?? null;
}

async function callMcp(payload) {
  const response = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: serializePayload(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  return parseSseResponse(text);
}

function buildReviewHtml({
  rootId,
  exportTargetId,
  nodeCount,
  imageBase64,
  payloadPath,
  exportPath,
  findings,
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MCP Widget Smoke Review</title>
  <style>
    :root {
      --bg: #eef3f8;
      --panel: #ffffff;
      --ink: #102033;
      --muted: #627289;
      --accent: #2f6bff;
      --line: #d9e2ef;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      background: radial-gradient(circle at top left, #f9fbff, var(--bg));
      color: var(--ink);
    }
    .shell {
      max-width: 1440px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 20px 50px rgba(16, 32, 51, 0.08);
    }
    h1 { margin: 0 0 12px; font-size: 28px; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    p, li { color: var(--muted); line-height: 1.5; }
    ul { padding-left: 20px; margin: 12px 0 0; }
    code {
      background: #f4f7fb;
      border-radius: 8px;
      padding: 2px 6px;
      color: var(--accent);
    }
    img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 18px;
      border: 1px solid var(--line);
      background: #fff;
    }
    .meta {
      display: grid;
      gap: 10px;
      margin-top: 16px;
    }
    .meta-row {
      padding: 12px 14px;
      border-radius: 14px;
      background: #f8fbff;
      border: 1px solid var(--line);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="shell">
    <section class="panel">
      <h1>MCP Widget Smoke</h1>
      <p>Playwright review of a widget tree created through <code>create_widget_tree</code> and exported through <code>export_shape</code>.</p>
      <div class="meta">
        <div class="meta-row"><strong>Root shape:</strong> <code>${rootId}</code></div>
        <div class="meta-row"><strong>Export target:</strong> <code>${exportTargetId}</code></div>
        <div class="meta-row"><strong>Node count:</strong> <code>${nodeCount}</code></div>
        <div class="meta-row"><strong>Payload file:</strong> <code>${payloadPath}</code></div>
        <div class="meta-row"><strong>Export file:</strong> <code>${exportPath}</code></div>
      </div>
      <h2>What this validates</h2>
      <ul>
        <li>Payload generation without manual giant JSON blobs</li>
        <li>Semantic grouping of widgets in Penpot</li>
        <li>End-to-end export through the MCP pipeline</li>
        <li>Visual review artifact suitable for regression checks</li>
      </ul>
      <h2>Findings</h2>
      <ul>${findings.map((finding) => `<li>${finding}</li>`).join("")}</ul>
    </section>
    <section class="panel">
      <h2>Rendered Export</h2>
      <img src="data:image/png;base64,${imageBase64}" alt="Exported Penpot widget" />
    </section>
  </div>
</body>
</html>`;
}

async function main() {
  await fs.mkdir(exportDir, { recursive: true });

  const payload = createDashboardSmokePayload();
  const payloadPath = path.join(exportDir, "widget-smoke-payload.json");
  await fs.writeFile(payloadPath, serializePayload(payload));

  const createMessage = await callMcp(payload);
  const createResult = extractTextResult(createMessage);
  const rootId = createResult.root.id;
  const findings = [];

  let exportTargetId = rootId;
  let exportMessage = await callMcp(
    createExportShapeToolPayload(exportTargetId, "export-dashboard-review"),
  );

  let imageResult;
  try {
    imageResult = extractImageResult(exportMessage);
    findings.push("Dashboard root export succeeded.");
  } catch (error) {
    findings.push(`Dashboard root export failed: ${error.message}`);
    const fallbackNode =
      createResult.nodes.find((node) => node.type === "metric_card") ??
      createResult.nodes.find((node) => node.id !== rootId);

    if (!fallbackNode) {
      throw error;
    }

    exportTargetId = fallbackNode.id;
    exportMessage = await callMcp(
      createExportShapeToolPayload(exportTargetId, "export-dashboard-review-fallback"),
    );
    imageResult = extractImageResult(exportMessage);
    findings.push(`Fallback widget export succeeded for ${fallbackNode.type}.`);
  }

  const pngPath = path.join(exportDir, "widget-smoke-dashboard.png");
  await fs.writeFile(pngPath, Buffer.from(imageResult.data, "base64"));

  const htmlPath = path.join(exportDir, "widget-smoke-review.html");
  const html = buildReviewHtml({
    rootId,
    exportTargetId,
    nodeCount: createResult.nodes.length,
    imageBase64: imageResult.data,
    payloadPath: path.relative(repoRoot, payloadPath),
    exportPath: path.relative(repoRoot, pngPath),
    findings,
  });
  await fs.writeFile(htmlPath, html);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.screenshot({
    path: path.join(exportDir, "widget-smoke-review.png"),
    fullPage: true,
  });
  await browser.close();

  console.log(
    JSON.stringify(
      {
        rootId,
        exportTargetId,
        nodeCount: createResult.nodes.length,
        payloadPath,
        htmlPath,
        pngPath,
        reviewScreenshotPath: path.join(exportDir, "widget-smoke-review.png"),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
