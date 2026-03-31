# Penpot MCP CLI — Guia rápido para agentes

## Conectar
- MCP server: `http://localhost:4401/mcp` (padrão do `bootstrap-local-stack.sh`).
- Plugin Penpot: precisa estar aberto e conectado ao MCP.
- CLI usa HTTP streamable; para multi-user, passe `--user-token <token>`.

## Instalar e buildar (no container `penpot-devenv-main`)
```bash
cd /home/penpot/penpot/mcp/packages/cli
pnpm install
pnpm run build
```
O binário fica em `dist/index.js` e é exposto como `penpot-cli`.

## Uso básico
```bash
penpot-cli --server-url http://localhost:4401/mcp [--user-token TOKEN] <comando> [opções]
```
- `--json` para saída em JSON.

### Comandos
- `preflight` — checa conexão, plugin e setup do arquivo.
- `create-screen -n <nome> [-d mobile,tablet,desktop]` — cria/reusa página `Screens/<nome>` e frames (fluxo antigo, use assemble-screen de preferência).
- `assemble-screen -n <nome> -d <device> --components "C1,C2"` — monta uma board de tela na página `_Components` com os componentes dentro, escapando de bugs cross-page.
- `create-component -n <nome> [-c <categoria>]` — cria shell em `_Components` (posição (0,0), respeita layout passado pelo MCP).
- `publish-components` — promove shells elegíveis de `_Components` para a biblioteca local.
- `place-component --component <nome> --screen <Screens/...> [--target-shape-id <id>]` — instancia componente em uma board existente.
- `tokens plan` — planeja sistema e sugere nomes.
- `tokens setup` — normaliza/persiste tokens planejados.
- `lint [--page-id <id>]` — roda validações (layout de `_Components`, composição de screen, padrões inseguros).
- `export flutter [--shape-id <id>] [--page-id <id>]` — exporta para árvore Flutter e gera Dart.

## Ordem recomendada
1) `penpot-cli preflight`
2) `penpot-cli create-component` (um de cada vez) → `penpot-cli publish-components`
3) `penpot-cli assemble-screen` -> Peça ao utilizador para mover a board gerada de `_Components` para `Screens/*` manualmente e deletar a de origem.
4) `penpot-cli lint`
5) `penpot-cli export flutter`

## Notas
- Trabalhe um componente por vez em `_Components` antes de ir para a screen.
- Não use `execute_code` como caminho principal; a CLI já orquestra as tools seguras.
- Se precisar de outra URL/porta, use `--server-url`.
