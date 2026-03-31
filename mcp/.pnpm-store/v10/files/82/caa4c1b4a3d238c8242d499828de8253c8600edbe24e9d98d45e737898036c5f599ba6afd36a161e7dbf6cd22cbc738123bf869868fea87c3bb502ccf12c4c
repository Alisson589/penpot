import chalk from 'chalk';
import defer from 'p-defer';
import { createLogger, loadConfigFromFile, mergeConfig, preview } from 'vite';
import { createDebugger } from '../util/create-debugger.js';
import pluginServe from './serve.js';

const isWatchMode = process.argv.includes("--watch") || process.argv.includes("-w");
const plugin = ({ reload = true, config, plugins } = {}) => {
  let enabled = false;
  let logger = createLogger("silent");
  let clearScreen = false;
  let mode = "preview";
  let configFile;
  let inlineConfig = {};
  let server;
  let error;
  let deferToBuild;
  let reloadDelay;
  let deferToRequests;
  let deferToRequestsDelay;
  let activeRequestCount = 0;
  const debug = createDebugger("live-preview");
  const sockets = /* @__PURE__ */ new Set();
  const plugin = {
    name: "live-preview-build",
    config(partialConfig, env) {
      if (env.command !== "build")
        return;
      if (!partialConfig.build?.watch && !isWatchMode && !env.mode.startsWith("preview"))
        return;
      enabled = true;
      return typeof config === "function" ? config(partialConfig, env) : config;
    },
    configResolved(resolvedConfig) {
      if (!enabled)
        return;
      if (Array.from(resolvedConfig.plugins).reverse().find((p) => p.name === plugin.name) !== plugin) {
        enabled = false;
        return;
      }
      debug?.("enabled.");
      logger = resolvedConfig.logger;
      clearScreen = resolvedConfig.clearScreen !== false;
      mode = resolvedConfig.mode;
      configFile = resolvedConfig.configFile;
      inlineConfig = {
        ...resolvedConfig.inlineConfig,
        // XXX: Inline (JavaScript API) plugins are unsafe to reuse in the
        // preview command. This is a current limitation of Vite.
        plugins: void 0
      };
      resolvedConfig.build.watch ??= {};
    },
    async buildStart() {
      if (!enabled)
        return;
      clearTimeout(reloadDelay);
      await deferToRequests?.promise;
      if (!deferToBuild) {
        deferToBuild = defer();
        debug?.("requests paused.");
        void deferToBuild.promise.then(() => debug?.("requests resumed."));
      }
      if (clearScreen) {
        logger.clearScreen("error");
      }
    },
    buildEnd(buildError) {
      if (!enabled)
        return;
      error = buildError;
    },
    async closeBundle() {
      if (!enabled)
        return;
      const buildPromise = deferToBuild?.promise;
      deferToBuild?.resolve();
      deferToBuild = void 0;
      await buildPromise;
      if (server) {
        if (reload) {
          console.log();
          server.config.logger.info(chalk.green("page-reload"), { timestamp: true });
        }
        if (reload) {
          clearTimeout(reloadDelay);
          reloadDelay = setTimeout(() => {
            debug?.(`sending page-reload to ${sockets.size} clients...`);
            sockets.forEach((socket) => {
              socket.send(JSON.stringify({ type: "page-reload" }));
              debug?.(`sent page-reload.`);
            });
          }, 1e3).unref();
        }
        return;
      }
      if (mode.startsWith("preview")) {
        logger.warn(chalk.yellow("[vite-live-preview] Using the --mode=preview* option is deprecated. Use the --watch option instead."));
      }
      const onConnect = (socket) => {
        sockets.add(socket);
        socket.on("close", () => sockets.delete(socket));
      };
      const onRequest = () => {
        clearTimeout(deferToRequestsDelay);
        activeRequestCount++;
        if (!deferToRequests) {
          deferToRequests = defer();
          debug?.("building paused.");
          void deferToRequests.promise.then(() => debug?.("building resumed."));
        }
        return () => {
          activeRequestCount = Math.max(0, activeRequestCount - 1);
          if (activeRequestCount === 0) {
            clearTimeout(deferToRequestsDelay);
            deferToRequestsDelay = setTimeout(() => {
              deferToRequests?.resolve();
              deferToRequests = void 0;
            }, 500).unref();
          }
        };
      };
      const getError = () => {
        return error;
      };
      const getBuildPromise = async () => {
        await deferToBuild?.promise;
      };
      let previewConfig = configFile ? await loadConfigFromFile(
        { command: "serve", mode, isPreview: true, isSsrBuild: false },
        configFile,
        inlineConfig.root,
        inlineConfig.logLevel
      ).then((result) => result?.config ?? {}) : {};
      previewConfig = mergeConfig(previewConfig, inlineConfig);
      previewConfig.configFile = false;
      previewConfig.clearScreen = false;
      previewConfig.plugins = [
        pluginServe({ onConnect, onRequest, getError, getBuildPromise }),
        ...previewConfig.plugins ?? [],
        ...plugins ?? []
      ];
      let restartCount = 0;
      const createPreviewServer = async () => {
        const isRestart = Boolean(server);
        if (isRestart) {
          ++restartCount;
        }
        server = await preview(previewConfig);
        server.config.logger.info(isRestart ? "server restarted." + (restartCount > 1 ? chalk.yellow(` (x${restartCount})`) : "") : chalk.green("preview server started"), { timestamp: true });
        if (!isRestart) {
          console.log();
          server.printUrls();
        }
        server.bindCLIShortcuts({
          print: !isRestart,
          customShortcuts: [
            {
              key: "r",
              description: "restart the server",
              action: async (self) => {
                await self.close();
                logger.clearScreen("error");
                await createPreviewServer();
              }
            },
            {
              key: "u",
              description: "show server url",
              action: (self) => {
                console.log();
                self.printUrls();
              }
            },
            {
              key: "c",
              description: "clear console",
              action: () => logger.clearScreen("error")
            }
          ]
        });
      };
      console.log();
      await createPreviewServer();
    }
  };
  return plugin;
};

export { plugin as default };
//# sourceMappingURL=build.js.map
