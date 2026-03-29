![mcp-server-cover-github-1](https://github.com/user-attachments/assets/dcd14e63-fecd-424f-9a50-c1b1eafe2a4f)

# Penpot's Official MCP Server

Penpot integrates a LLM layer built on the Model Context Protocol
(MCP) via Penpot's Plugin API to interact with a Penpot design
file. Penpot's MCP server enables LLMs to perfom data queries,
transformation and creation operations.

Penpot's MCP Server is unlike any other you've seen. You get
design-to- design, code-to-design and design-code supercharged
workflows.


[![Penpot MCP video playlist](https://github.com/user-attachments/assets/204f1d99-ce51-41dd-a5dd-1ef739f8f089)](https://www.youtube.com/playlist?list=PLgcCPfOv5v57SKMuw1NmS0-lkAXevpn10)


## Architecture

The **Penpot MCP Server** exposes tools to AI clients (LLMs), which
support the retrieval of design data as well as the modification and
creation of design elements.  The MCP server communicates with Penpot
via the dedicated **Penpot MCP Plugin**,
which connects to the MCP server via WebSocket.  
This enables the LLM to carry out tasks in the context of a design file by 
executing code that leverages the Penpot Plugin API.
The LLM is free to write and execute arbitrary code snippets
within the Penpot Plugin environment to accomplish its tasks.

![Architecture](resources/architecture.png)

This repository thus contains not only the MCP server implementation itself
but also the supporting Penpot MCP Plugin 
(see section [Repository Structure](#repository-structure) below).

## Demonstration

[![Video](https://v32155.1blu.de/penpot/PenpotFest2025_thumbnail.png)](https://v32155.1blu.de/penpot/PenpotFest2025.mp4)


## Usage

To use the Penpot MCP server, you must
 * run the MCP server and connect your AI client to it,
 * run the web server providing the Penpot MCP plugin, and
 * open the Penpot MCP plugin in Penpot and connect it to the MCP server. 

Follow the steps below to enable the integration.


### Prerequisites

The project requires [Node.js](https://nodejs.org/) (tested with v22.x).

### 1. Starting the MCP Server and the Plugin Server

#### Running a Released Version via npx

The easiest way to launch the servers is to use `npx` to run the appropriate
version that matches your Penpot version.

* If you are using the latest Penpot release, e.g. as served on [design.penpot.app](https://design.penpot.app), run:
  ```shell
  npx -y @penpot/mcp@">=0"
  ```
* If you are participating in the MCP beta-test, which uses [test-mcp.penpot.dev](https://test-mcp.penpot.dev), run:
  ```shell
  npx -y @penpot/mcp@"*"
  ```

Once the servers are running, continue with step 2.

#### Running the Source Version from the Repository

The tools `corepack` and `npx` should be available in your terminal.

On Windows, use the Git Bash terminal to ensure compatibility with the provided scripts.

##### Clone the Appropriate Branch of the Repository 

> [!IMPORTANT]
> The branches are subject to change in the future.  
> Be sure to check the instructions for the latest information on which branch to use.

Clone the Penpot repository, using the proper branch depending on the
version of Penpot you want to use the MCP server with.

  * For the current Penpot release 2.14, use the `mcp-prod-2.14.0` branch:

    ```shell
    git clone https://github.com/penpot/penpot.git --branch mcp-prod-2.14.0 --depth 1
    ```

  * For the latest development version of Penpot (including the MCP beta-test), use the `develop` branch:

    ```shell
    git clone https://github.com/penpot/penpot.git --branch develop --depth 1
    ```

Then change into the `mcp` directory:

```shell
cd penpot/mcp
```

##### Build & Launch the MCP Server and the Plugin Server

If it's your first execution, install the required dependencies.
(If you are using the Penpot devenv, this step is not necessary, as dependencies are already installed.)

```shell
./scripts/setup
```

Then build all components and start the two servers:

```shell
pnpm run bootstrap
```

This bootstrap command will:

  * install dependencies for all components
  * build all components
  * start all components

### 2. Load the Plugin in Penpot and Establish the Connection

> [!NOTE]
> **Browser Connectivity Restrictions**
>
> Starting with Chromium version 142, the private network access (PNA) restrictions have been hardened,
> and when connecting to `localhost` from a web application served from a different origin
> (such as https://design.penpot.app), the connection must explicitly be allowed.
>
> Most Chromium-based browsers (e.g. Chrome, Vivaldi) will display a popup requesting permission
> to access the local network. Be sure to approve the request to allow the connection.
>
> Some browsers take additional security measures, and you may need to disable them.
> For example, in Brave, disable the "Shield" for the Penpot website to allow local network access.
>
> If your browser refuses to connect to the locally served plugin, check its configuration or
> try a different browser (e.g. Firefox) that does not enforce these restrictions.

1. Open Penpot in your browser
2. Navigate to a design file
3. Open the Plugins menu
4. Load the plugin using the development URL (`http://localhost:4400/manifest.json` by default)
5. Open the plugin UI
6. In the plugin UI, click "Connect to MCP server".
   The connection status should change from "Not connected" to "Connected to MCP server".
   (Check the browser's developer console for WebSocket connection logs.
   Check the MCP server terminal for WebSocket connection messages.)

> [!IMPORTANT]
> Do not close the plugin's UI while using the MCP server, as this will close the connection.

### 3. Connect an MCP Client

By default, the server runs on port 4401 and provides:

- **Modern Streamable HTTP endpoint**: `http://localhost:4401/mcp`
- **Legacy SSE endpoint**: `http://localhost:4401/sse`

These endpoints can be used directly by MCP clients that support them.
Simply configure the client to connect the MCP server by providing the respective URL.

When using a client that only supports stdio transport,
a proxy like `mcp-remote` is required.

#### Using a Proxy for stdio Transport

NOTE: only relevant if you are executing this outside of devenv

The `mcp-remote` package can proxy stdio transport to HTTP/SSE, 
allowing clients that support only stdio to connect to the MCP server indirectly.

1. Install `mcp-remote` globally if you haven't already:

        npm install -g mcp-remote

2. Use `mcp-remote` to provide the launch command for your MCP client:

        npx -y mcp-remote http://localhost:4401/sse --allow-http

#### Example: Claude Desktop

For Windows and macOS, there is the official [Claude Desktop app](https://claude.ai/download), which you can use as an MCP client.
For Linux, there is an [unofficial community version](https://github.com/aaddrick/claude-desktop-debian).

Since Claude Desktop natively supports only stdio transport, you will need to use a proxy like `mcp-remote`.
Install it as described above.

To add the server to Claude Desktop's configuration, locate the configuration file (or find it via Menu / File / Settings / Developer):

- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Add a `penpot` entry under `mcpServers` with the following content: 

```json
{
    "mcpServers": {
        "penpot": {
            "command": "npx",
            "args": ["-y", "mcp-remote", "http://localhost:4401/sse", "--allow-http"]
        }
    }
}
```

After updating the configuration file, restart Claude Desktop completely for the changes to take effect.

> [!IMPORTANT] 
> Be sure to fully quit the app for the changes to take effect; closing the window is *not* sufficient.   
> To fully terminate the app, choose Menu / File / Quit.

After the restart, you should see the MCP server listed when clicking on the "Search and tools" icon at the bottom
of the prompt input area.

#### Example: Claude Code

To add the Penpot MCP server to a Claude Code project, issue the command

    claude mcp add penpot -t http http://localhost:4401/mcp

## Recommended Build Flow

When using the MCP for UI construction, follow this sequence:

1. `plugin_connection_status`
2. `inspect_project_setup`
3. `plan_ui_build`
4. confirm structural changes with the user
5. `confirm_structural_setup` and/or `ensure_frame_scaffolding`
6. create reusable components in `_Components`
7. promote them with `create_main_component_from_shape`
8. find and place them as instances on `Screens/*`
9. use overrides for content changes instead of duplicating components

This keeps the file aligned with how Penpot expects components and screens to be organized.

## Tool Guide

Below is the practical role of the main MCP tools added in this workflow:

- `plugin_connection_status`
  - verifies that the Penpot plugin is connected before any action
- `inspect_project_setup`
  - lists pages, token catalog state, connected libraries, selection, and local components
- `plan_ui_build`
  - creates a non-mutating plan before changing tokens, pages, frames, or screens
- `confirm_structural_setup`
  - performs approved structural setup actions after user confirmation
- `ensure_page_structure`
  - ensures `_Components`, `_Documentation`, `_Tokens`, and `Screens/*` pages exist
- `ensure_frame_scaffolding`
  - creates parent frames/boards for screens or component work
- `find_library_components`
  - searches connected libraries like Pencil or Lucide
- `find_local_components`
  - searches reusable components already created in the local file library
- `create_component_shell`
  - creates a structured reusable shell on `_Components` with safe layout defaults
- `organize_component_in_components_page`
  - moves/restages a shell in `_Components` so categories stay organized and non-overlapping
- `publish_components_from_components_page`
  - batch-publishes eligible `_Components` shells into the local library
- `create_screen_page`
  - creates or reuses a `Screens/*` page and its device frames
- `list_screen_pages`
  - lists the available `Screens/*` pages in the current file
- `create_screen_shell`
  - creates the safe parent shell of a screen before instances are placed on it
- `validate_components_page_layout`
  - lints `_Components` for overlap, missing categories, and staging hygiene
- `lint_screen_composition`
  - lints a `Screens/*` page for raw-shape-heavy or unsafe composition
- `create_text_block`
  - creates text inside an inner layout frame instead of leaving the text layer loose
- `create_component_variant`
  - groups existing local components into a real Penpot variant set
- `apply_component_variant_overrides`
  - switches a placed instance to another local variant while preserving position
- `place_component_on_screen`
  - places a local or connected-library component instance on a chosen `Screens/*` page
- `create_widget_tree`
  - builds semantic shells, sections, slots, and safe container structures
- `create_main_component_from_shape`
  - promotes a prepared frame in `_Components` into a local library component
- `instantiate_library_component_into_slot`
  - places a connected-library component into a slot/container
- `instantiate_local_component_into_slot`
  - places a local library component instance into a slot/container on a screen
- `apply_instance_text_overrides`
  - updates instance text content without duplicating the main component
- `apply_design_tokens_to_shape`
  - binds real Penpot tokens to a shape
- `inspect_design_token_usage`
  - finds hardcoded values that should use tokens
- `inspect_unsafe_construction_patterns`
  - lints a page for risky construction patterns
- `export_to_flutter`
  - builds an intermediate Flutter-oriented tree from the Penpot canvas
- `generate_flutter_dart`
  - generates Dart code from the export tree

## `execute_code` Safety

`execute_code` is powerful, but it should be treated as an advanced escape hatch, not the default UI builder.

Use `execute_code` for:
- targeted inspection that existing tools do not expose yet
- controlled cleanup or page switching
- one-off diagnostics inside the connected Penpot file
- validating hypotheses about the Penpot Plugin API

Do **not** use `execute_code` as the default way to build screens or components.

Avoid these patterns:
- building full screens directly with raw Plugin API calls
- creating components on screen pages instead of `_Components`
- duplicating components by content instead of using instances and overrides
- writing layout child properties manually unless the MCP already normalizes them
- hardcoding colors, font sizes, spacing, or radius instead of binding tokens

If a page starts throwing `Internal Error` after a raw scripted build, run:
- `inspect_project_setup`
- `inspect_unsafe_construction_patterns`
- `inspect_design_token_usage`

Those tools help identify the most common unsafe patterns before you continue editing.

## Repository Structure

This repository is a monorepo containing four main components:

1. **Common Types** (`packages/common/`):
    - Shared TypeScript definitions for request/response protocol
    - Ensures type safety across server and plugin components

2. **Penpot MCP Server** (`packages/server/`):
    - Provides MCP tools to LLMs for Penpot interaction
    - Runs a WebSocket server accepting connections from the Penpot MCP plugin
    - Implements request/response correlation with unique task IDs
    - Handles task timeouts and proper error reporting

3. **Penpot MCP Plugin** (`packages/plugin/`):
    - Connects to the MCP server via WebSocket
    - Executes tasks in Penpot using the Plugin API
    - Sends structured responses back to the server#

4. **Types Generator** (`types-generator/`):
    - Generates data on API types for the MCP server (development use)

The core components are written in TypeScript, rendering interactions with the
Penpot Plugin API both natural and type-safe.

## Configuration

The Penpot MCP server can be configured using environment variables.

### Server Configuration

| Environment Variable               | Description                                                                | Default      |
|------------------------------------|----------------------------------------------------------------------------|--------------|
| `PENPOT_MCP_SERVER_HOST`           | Address on which the MCP server listens (binds to)                         | `localhost`  |
| `PENPOT_MCP_SERVER_PORT`           | Port for the HTTP/SSE server                                               | `4401`       |
| `PENPOT_MCP_WEBSOCKET_PORT`        | Port for the WebSocket server (plugin connection)                          | `4402`       |
| `PENPOT_MCP_REPL_PORT`             | Port for the REPL server (development/debugging)                           | `4403`       |
| `PENPOT_MCP_SERVER_ADDRESS`        | Hostname or IP address via which clients can reach the MCP server          | `localhost`  |
| `PENPOT_MCP_REMOTE_MODE`           | Enable remote mode (disables file system access). Set to `true` to enable. | `false`      |

### Logging Configuration

| Environment Variable   | Description                                          | Default  |
|------------------------|------------------------------------------------------|----------|
| `PENPOT_MCP_LOG_LEVEL` | Log level: `trace`, `debug`, `info`, `warn`, `error` | `info`   |
| `PENPOT_MCP_LOG_DIR`   | Directory for log files                              | `logs`   |

### Plugin Server Configuration

| Environment Variable                      | Description                                                                             | Default      |
|-------------------------------------------|-----------------------------------------------------------------------------------------|--------------|
| `PENPOT_MCP_PLUGIN_SERVER_HOST`           | Address on which the plugin web server listens (single address or comma-separated list) | (local only) |

## Beyond Local Execution

The above instructions describe how to run the MCP server and plugin server locally.
We are working on enabling remote deployments of the MCP server, particularly
in [multi-user mode](docs/multi-user-mode.md), where multiple Penpot users will
be able to connect to the same MCP server instance.

To run the server remotely (even for a single user),
you may set the following environment variables to configure the two servers
(MCP server & plugin server) appropriately:
 * `PENPOT_MCP_REMOTE_MODE=true`: This ensures that the MCP server is operating
   in remote mode, with local file system access disabled.
 * `PENPOT_MCP_SERVER_LISTEN_ADDRESS` and `PENPOT_MCP_PLUGIN_SERVER_LISTEN_ADDRESS`:
   Set these according to your requirements for remote connectivity.
   To bind all interfaces, use `0.0.0.0` (use caution in untrusted networks).
 * `PENPOT_MCP_SERVER_ADDRESS=<your-address>`: This sets the hostname or IP address
   where the MCP server can be reached. The Penpot MCP Plugin uses this to construct
   the WebSocket URL as `ws://<your-address>:<port>` (default port: `4402`).

## Development

* The [contribution guidelines for Penpot](../CONTRIBUTING.md) apply
* Auto-formatting: Use `pnpm run fmt`
* Generating API type data: See [types-generator/README.md](types-generator/README.md)
* Packaging and publishing:
  - Create npm package: `bash scripts/pack` (sets version and then calls `npm pack`)
