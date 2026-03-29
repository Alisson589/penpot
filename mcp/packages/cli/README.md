# Penpot CLI (MCP)

CLI fina para orquestrar o MCP do Penpot na ordem segura.

## Pré-requisitos
- MCP rodando: `http://localhost:4401/mcp`
- Plugin Penpot conectado (manifest: `http://localhost:4400/manifest.json`)
- Node 18+ (já no container `penpot-devenv-main`)

## Instalação (no container)
```bash
cd /home/penpot/penpot/mcp
pnpm install
pnpm run build
```

## Uso
```bash
penpot-cli --server-url http://localhost:4401/mcp [--user-token TOKEN] [--json] <comando>
```

### Comandos principais
- `preflight` — checa conexão, plugin e setup do arquivo.
- `create-screen -n <nome> [-d mobile,tablet,desktop] [-y]`
  - cria/reusa `Screens/<nome>` e shell padrão (coluna, padding 24, gap 16, body section).
- `create-component -n <nome> [-c <categoria>]`
  - cria shell em `_Components` no (0,0); layout é o que o MCP definir.
- `publish-components` — promove shells elegíveis de `_Components` para a library local.
- `place-component --component <nome> --screen <Screens/...> [--target-shape-id <id>]`
  - sem `target-shape-id`, usa o primeiro board da página de screen.
- `tokens plan` / `tokens setup` — planeja e aplica sistema de tokens.
- `lint [--page-id <id>]` — valida `_Components`, composição de screen e padrões inseguros.
- `export flutter [--shape-id <id>] [--page-id <id>]` — exporta árvore + gera Dart.

### Ordem recomendada
1. `penpot-cli preflight`
2. Tokens: `penpot-cli tokens plan` → `penpot-cli tokens setup`
3. Componentes: `create-component` (um por vez) → `publish-components`
4. Screen: `create-screen` → `place-component`
5. `lint`
6. `export flutter`

## Notas
- Trabalhe um componente por vez em `_Components` e só depois vá para a screen.
- `place-component` agora aceita `--target-shape-id`; se omisso, cai no primeiro board da página.
- `create-screen` envia um shell padrão; se quiser um shell custom, use o MCP direto com `create_screen_shell`.
- `create-component` agora exige catálogo de tokens preenchido; se vazio, falha e pede para rodar `tokens plan/setup`.
