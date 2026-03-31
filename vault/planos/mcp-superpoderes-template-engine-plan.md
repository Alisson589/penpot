# Plano: MCP Template Engine & Superpoderes via Plugin API

> **Status:** Proposto — Aguardando Aprovação  
> **Data:** 2026-03-31  
> **Autor:** Alisson Silva  
> **Escopo:** `mcp/packages/plugin/src/` + `mcp/packages/server/src/`  
> **Premissa Central:** Zero invasão ao core Clojure/ClojureScript do Penpot. 100% na camada de Plugin (TypeScript no iframe).

---

## 1. Diagnóstico da Arquitetura Atual

### 1.1 Fluxo Existente

```
Agente LLM
   │  chamada MCP tool (JSON-RPC ou HTTP)
   ▼
PenpotMcpServer.ts  (Node.js, porta local)
   │  envia PluginTask via WebSocket
   ▼
PluginBridge.ts  (ponte WS ↔ iframe)
   │  postMessage
   ▼
Plugin Iframe (Penpot abre o plugin)
   │  TaskHandler.ts → ExecuteCodeTaskHandler.ts
   ▼
PenpotUtils.ts  ← TODA a lógica de canvas vive aqui
   │  penpot.createBoard(), penpot.createText(), etc.
   ▼
Canvas do Penpot (dados reais, bounding boxes corretos)
```

### 1.2 Problemas Identificados Hoje

| # | Problema | Impacto |
|---|----------|---------|
| P1 | O LLM tenta montar cada shape atômico manualmente via JSON | Tokens desperdiçados, erros de layout |
| P2 | Sem retorno de `bounds` após criação | Agente não sabe dimensões reais do que criou |
| P3 | Sem catálogo de "blocos prontos" (Templates) | Agente recria a roda a cada prompt |
| P4 | SKILL.md não documenta templates disponíveis | Agente desconhece atalhos |
| P5 | Sem mecanismo de callback/refinamento rico | Interação é fire-and-forget, sem retorno estruturado |
| P6 | Apenas 1 task handler (`ExecuteCodeTaskHandler`) | Falta separação de responsabilidades por domínio |

---

## 2. Arquitetura Proposta: Template Engine

### 2.1 Conceito Central

Em vez de o LLM descrever árvores JSON de shapes atômicos, ele invoca **macros de alto nível** que:
1. Executam nativamente no iframe (acesso ao DOM/Flexbox real)
2. Retornam um `ComponentResult` com `shapeId`, `bounds` exatos e `callbacksExposed`
3. Permitem ao Agente fazer refinamentos cirúrgicos ("mova o logo 8px para direita")

### 2.2 Interface de Dados Central

```typescript
// Em: mcp/packages/common/src/types/ComponentResult.ts (NOVO)
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComponentResult {
  shapeId: string;
  name: string;
  bounds: Bounds;
  childrenIds: string[];
  callbacksExposed: CallbackDescriptor[];
  metadata?: Record<string, unknown>;
}

export interface CallbackDescriptor {
  name: string;          // "updateLogo", "shiftRight"
  description: string;   // Descrição legível pelo LLM
  paramsSchema: object;  // JSON Schema dos parâmetros
}
```

---

## 3. Roadmap de Implementação

### FASE 0 — Fundação de Tipos (1-2 dias)

**Objetivo:** Criar as interfaces compartilhadas e garantir que plugin e server as conheçam.

**Tarefas:**
- [ ] Criar `mcp/packages/common/src/types/ComponentResult.ts`
- [ ] Criar `mcp/packages/common/src/types/TemplateParams.ts` (params de cada template)
- [ ] Atualizar `mcp/packages/common/src/index.ts` para re-exportar novos tipos
- [ ] Garantir que `mcp/packages/plugin` e `mcp/packages/server` importam de `@penpot-mcp/common`

**Resultado esperado:** TypeScript compila com os novos tipos disponíveis em ambos os pacotes.

---

### FASE 1 — Template Engine Core no Plugin (3-5 dias)

**Objetivo:** Criar a infraestrutura de templates no `PenpotUtils.ts` e separar em módulos.

#### 1.1 Refatoração do PenpotUtils.ts

O arquivo atual tem 181KB — é grande demais para um único arquivo. Proposta de divisão:

```
mcp/packages/plugin/src/
├── PenpotUtils.ts          ← mantém API pública (facade)
├── core/
│   ├── ShapeFactory.ts     ← createBoard, createText, createRect (atual)
│   ├── StyleUtils.ts       ← fills, strokes, shadows, blur
│   └── LayoutUtils.ts      ← flex, grid, auto-layout helpers
├── templates/
│   ├── TemplateEngine.ts   ← dispatcher central de templates (NOVO)
│   ├── HeaderTemplate.ts   ← template de header com callbacks (NOVO)
│   ├── CardTemplate.ts     ← template de card/tile (NOVO)
│   ├── NavTemplate.ts      ← template de navegação lateral (NOVO)
│   └── FormTemplate.ts     ← template de formulário genérico (NOVO)
└── task-handlers/
    ├── ExecuteCodeTaskHandler.ts  ← atual
    └── TemplateTaskHandler.ts     ← NOVO: invoca TemplateEngine
```

#### 1.2 TemplateEngine.ts — Dispatcher

```typescript
// mcp/packages/plugin/src/templates/TemplateEngine.ts
import { ComponentResult } from '@penpot-mcp/common';
import { HeaderTemplate } from './HeaderTemplate';
import { CardTemplate } from './CardTemplate';

export type TemplateName = 'header-generic' | 'card-default' | 'nav-sidebar' | 'form-generic';

export class TemplateEngine {
  static async create(name: TemplateName, params: unknown): Promise<ComponentResult> {
    switch (name) {
      case 'header-generic': return HeaderTemplate.create(params as HeaderParams);
      case 'card-default':   return CardTemplate.create(params as CardParams);
      // ...
      default: throw new Error(`Template desconhecido: ${name}`);
    }
  }

  static catalog(): TemplateDescriptor[] {
    return [
      { name: 'header-generic', description: 'Header horizontal com logo, título e área de ações', paramsSchema: HeaderTemplate.schema },
      { name: 'card-default',   description: 'Card com imagem, título, descrição e CTA', paramsSchema: CardTemplate.schema },
    ];
  }
}
```

#### 1.3 Exemplo Completo: HeaderTemplate.ts (PoC)

```typescript
// mcp/packages/plugin/src/templates/HeaderTemplate.ts
export interface HeaderParams {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  height?: number;            // default: 80
  backgroundColor?: string;  // default: '#FFFFFF'
}

export class HeaderTemplate {
  static schema = { /* JSON Schema aqui */ };

  static async create(params: HeaderParams): Promise<ComponentResult> {
    const height = params.height ?? 80;
    const bg = params.backgroundColor ?? '#FFFFFF';

    // Board container
    const container = penpot.createBoard();
    container.name = 'Header / Generic';
    container.resize(1440, height);
    container.fills = [{ fillType: 'solid', fillColor: bg, fillOpacity: 1 }];

    // Habilita auto-layout horizontal
    container.addFlexLayout();
    const layout = container.getFlexLayout()!;
    layout.dir = 'row';
    layout.alignItems = 'center';
    layout.justifyContent = 'space-between';
    layout.horizontalPadding = 24;

    // Logo placeholder
    const logo = penpot.createRect();
    logo.name = 'Logo';
    logo.resize(120, 40);

    // Título
    const titleShape = penpot.createText(params.title);
    titleShape.name = 'Title';

    container.appendChild(logo);
    container.appendChild(titleShape);

    // Bounding box REAL (calculado pelo browser, não por nós)
    const bounds = container.bounds;

    return {
      shapeId: container.id,
      name: container.name,
      bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      childrenIds: [logo.id, titleShape.id],
      callbacksExposed: [
        { name: 'updateTitle',   description: 'Atualiza o texto do título', paramsSchema: { title: 'string' } },
        { name: 'updateHeight',  description: 'Altera a altura do header em px', paramsSchema: { height: 'number' } },
        { name: 'updateBgColor', description: 'Troca a cor de fundo', paramsSchema: { color: 'string' } },
      ],
      metadata: { templateName: 'header-generic', version: '1.0.0' },
    };
  }
}
```

---

### FASE 2 — Novo Task Handler no Plugin (1-2 dias)

**Objetivo:** Criar `TemplateTaskHandler.ts` para processar tasks do tipo `create-template`.

```typescript
// mcp/packages/plugin/src/task-handlers/TemplateTaskHandler.ts
export class TemplateTaskHandler {
  async handle(task: PluginTask): Promise<TaskResult> {
    const { templateName, params } = task.payload;
    const result = await TemplateEngine.create(templateName, params);
    return { success: true, data: result };
  }
}
```

- Registrar o novo handler no `TaskHandler.ts` (dispatcher principal)
- Adicionar tipo de task `'create-template'` no enum `PluginTaskType` em `common`

---

### FASE 3 — Novas MCP Tools no Server (2-3 dias)

**Objetivo:** Expor as tools `create_template`, `list_templates` e `invoke_template_callback` no `PenpotMcpServer.ts`.

#### Tool: `list_templates`
```json
{
  "name": "list_templates",
  "description": "Lista todos os templates de componentes disponíveis no MCP com seus parâmetros aceitos."
}
```

#### Tool: `create_template`
```json
{
  "name": "create_template",
  "description": "Cria um componente complexo pré-fabricado no canvas do Penpot. Retorna shapeId, bounds exatos e callbacks disponíveis para refinamento.",
  "inputSchema": {
    "templateName": "string (obrigatório)",
    "params": "object (específico do template)",
    "pageId": "string (opcional)",
    "position": "{ x: number, y: number } (opcional)"
  }
}
```

#### Tool: `invoke_template_callback`
```json
{
  "name": "invoke_template_callback",
  "description": "Invoca um callback de refinamento em um componente criado pelo create_template.",
  "inputSchema": {
    "shapeId": "string (obrigatório)",
    "callbackName": "string (obrigatório)",
    "callbackParams": "object (opcional)"
  }
}
```

---

### FASE 4 — Atualização do SKILL.md (1 dia)

**Objetivo:** Instruir o Agente a priorizar templates em vez de construção atômica.

Seção a adicionar no `SKILL.md`:

```markdown
## Template Engine (USE SEMPRE QUE POSSÍVEL)

Antes de criar shapes manualmente, verifique se existe um template adequado:
1. Use `list_templates` para ver o catálogo disponível
2. Use `create_template` com o template mais próximo ao que precisa
3. Use `invoke_template_callback` para ajustes pós-criação

Vantagens:
- O template retorna `bounds` exatos → sem sobreposições
- Menos tokens gastos → maior velocidade e precisão
- Componentes consistentes com auto-layout nativo do Penpot

Só construa shapes atômicos se NENHUM template satisfizer o requisito.
```

---

### FASE 5 — Catálogo Inicial de Templates (5-8 dias)

Ordem de prioridade baseada em uso em archviz e UI/UX:

| Prioridade | Template | Callbacks Expostos |
|-----------|----------|--------------------|
| 🔴 P1 | `header-generic` | updateTitle, updateHeight, updateBgColor, addActionButton |
| 🔴 P1 | `card-default` | updateImage, updateTitle, updateCTA, setVariant(horizontal/vertical) |
| 🟡 P2 | `nav-sidebar` | addItem, removeItem, setActiveItem, updateWidth |
| 🟡 P2 | `hero-section` | updateHeadline, updateCTA, updateBackground, setLayout |
| 🟢 P3 | `form-generic` | addField, removeField, setSubmitLabel |
| 🟢 P3 | `table-data` | setColumns, setRows, updateCell, setStyle |
| 🔵 P4 | `modal-dialog` | setTitle, setContent, addAction, setSize |
| 🔵 P4 | `breadcrumb` | setItems, setStyle |

---

### FASE 6 — Integrações com Tecnologias Complementares

#### 6.1 Zod — Validação de Parâmetros dos Templates

**Pacote:** `zod`  
**Por quê:** Elimina validação manual, gera mensagens de erro legíveis pelo LLM e pode inferir tipos TypeScript diretamente.

```typescript
const HeaderParamsSchema = z.object({
  title: z.string().min(1),
  height: z.number().min(40).max(200).default(80),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
});
```

#### 6.2 Style Dictionary — Design Tokens

**Pacote:** `style-dictionary`  
**Por quê:** Templates deixam de hardcodar cores/tipografia. Uma única chamada `apply_token_theme` troca todo o visual.  
**Estrutura:** `mcp/packages/tokens/tokens.json` → compilado para TS/CSS/JSON.

#### 6.3 Playwright — Screenshots de Feedback Visual

**Pacote:** `@playwright/test` ou integração com `mcp/export/` já existente  
**Por quê:** Após `create_template`, o server captura um screenshot do viewport e o retorna no `ComponentResult`. O Agente consegue "ver" o que criou antes de sugerir refinamentos.

#### 6.4 TypeDoc — Documentação Auto-Gerada do Catálogo

**Pacote:** `typedoc`  
**Por quê:** Mantém a documentação de todos os templates sempre atualizada, sincronizada com o código TypeScript.

#### 6.5 Template Registry JSON Externo (Avançado)

- Mover catálogo para `mcp/resources/template-registry.json`
- `TemplateEngine` carrega dinamicamente sem recompilar
- Facilita contribuições externas (open source friendly)

---

## 4. Stack de Tecnologias Recomendadas

| Tecnologia | Propósito | Risco de Adoção |
|-----------|-----------|----------------|
| **Zod** | Validação de params | Baixo (zero deps, muito popular) |
| **Style Dictionary** | Design Tokens | Baixo (independente, amplamente usado) |
| **Playwright** | Screenshots de feedback | Médio (requer browser headless no server) |
| **Vitest** | Testes unitários | Baixo (compatível com Vite já usado) |
| **TypeDoc** | Documentação do catálogo | Baixo (só build-time) |

---

## 5. Critérios de Aceitação (Definition of Done)

- [ ] `list_templates` retorna ao menos 2 templates com schema completo
- [ ] `create_template` cria shape real no canvas com `bounds` corretos no retorno
- [ ] `invoke_template_callback` modifica shape existente sem recriar
- [ ] SKILL.md atualizado com seção de Template Engine
- [ ] Pelo menos 1 template com cobertura de teste > 80%
- [ ] **Zero alterações em arquivos fora de `mcp/`** (não invasão ao core Penpot)

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|----------|
| Plugin API sem suporte a `bounds` antes da inserção na página | Média | Inserir shape antes de ler bounds; usar `penpot.viewport.center()` se necessário |
| Templates quebrarem com updates da Plugin API | Baixa | Fixar versão nos types; criar smoke tests |
| LLM ignorar templates e construir atomicamente | Alta | Reforçar instrução no SKILL.md com exemplos negativos explícitos |
| Callbacks perdidos após recarga do plugin | Média | Armazenar mapa `shapeId → callbacks` em memória no TemplateEngine |

---

## 7. Próximo Passo Imediato (PoC)

> **Ação imediata:** Implementar `HeaderTemplate.ts` completo e validar no browser antes de avançar para as demais fases.

1. Criar `mcp/packages/plugin/src/templates/HeaderTemplate.ts`
2. Importá-lo no `PenpotUtils.ts` como método `createTemplateHeader()`
3. Testar via `ExecuteCodeTaskHandler` chamando `PenpotUtils.createTemplateHeader({ title: 'Test' })`
4. Verificar no console do browser o retorno de `bounds` e `shapeId`
5. Se validado → avançar para Fase 2 (TemplateTaskHandler + nova tool MCP)
