# penpot-cli — Guia de Teste

## Pré-requisitos

1. A stack Penpot deve estar rodando via Docker (portas 4400-4403 expostas)
2. O plugin MCP deve estar conectado no browser Penpot
3. Node.js v22+ disponível no host

## Localização da CLI

```bash
# Caminho absoluto do binário compilado:
/home/sebas/app/penpot/penpot/mcp/packages/cli/dist/index.js

# Alias recomendado (adicionar ao .bashrc/.zshrc):
alias penpot-cli="node /home/sebas/app/penpot/penpot/mcp/packages/cli/dist/index.js"
```

## Configuração Padrão

A CLI conecta automaticamente em `http://localhost:4401/mcp` (o MCP server rodando via Docker).
Nenhuma configuração extra é necessária para uso local.

Para customizar, crie um arquivo `.penpot-cli.json` no diretório de trabalho:

```json
{
  "serverUrl": "http://localhost:4401/mcp",
  "userToken": null,
  "outputFormat": "human"
}
```

## Rebuild (se alterar o código)

```bash
cd /home/sebas/app/penpot/penpot/mcp/packages/cli
npm run build
```

## Comandos Disponíveis

### Diagnóstico / Startup

```bash
# Verifica conexão e estado do projeto (3 tools em sequência)
penpot-cli preflight

# Versão JSON (para scripts/CI)
penpot-cli preflight --json
```

### Lint / Validação

```bash
# Roda 3 checks: layout de _Components, composição de tela, padrões inseguros
penpot-cli lint

# Lint de página específica
penpot-cli lint --page-id <id>
```

### Criar Tela

```bash
# Cria uma tela com confirmação interativa (mostra plano e pede y/n)
penpot-cli create-screen --name Dashboard --devices mobile,desktop

# Pular confirmação
penpot-cli create-screen --name Home --devices mobile -y
```

### Criar Componente

```bash
penpot-cli create-component --name CardMembro
penpot-cli create-component --name BotaoAcao --category Buttons
```

### Publicar Componentes

```bash
penpot-cli publish-components
```

### Colocar Componente em Tela

```bash
penpot-cli place-component --component CardMembro --screen Dashboard
```

### Tokens

```bash
# Planejar sistema de tokens
penpot-cli tokens plan

# Aplicar setup de tokens
penpot-cli tokens setup
```

### Exportar para Flutter

```bash
penpot-cli export flutter
penpot-cli export flutter --page-id <id>
penpot-cli export flutter --shape-id <id>
```

## Flags Globais

| Flag | Descrição |
|------|-----------|
| `--json` | Output JSON puro em vez de human-readable |
| `--server-url <url>` | URL do MCP server (default: `http://localhost:4401/mcp`) |
| `--user-token <token>` | Token para modo multi-user |
| `-V, --version` | Mostra versão |
| `-h, --help` | Mostra ajuda |

## Arquitetura

```
penpot-cli  ──HTTP──▶  MCP Server (:4401)  ──WebSocket──▶  Plugin Penpot ──▶  Penpot App
  (host)                (Docker)                            (Browser)
```

A CLI é um **cliente MCP** — ela NÃO sobe server. O server já roda via Docker.
Cada comando da CLI orquestra 1-4 ferramentas MCP na ordem correta.

## Resolução de Problemas

### "Failed to connect to MCP server"
- Verificar se o Docker está rodando: `docker ps | grep penpot`
- Verificar se a porta está acessível: `curl -s http://localhost:4401/mcp`

### "No Penpot plugin instances are currently connected"
- Abrir o Penpot no browser
- Carregar o plugin MCP (URL: `http://localhost:4400/manifest.json`)
- Clicar "Connect to MCP server" no plugin

### "Task timed out"
- O plugin precisa estar com a UI aberta (não minimizada)
- Verificar console do browser por erros do plugin
