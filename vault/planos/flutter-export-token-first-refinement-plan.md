# Flutter Export + Token-First Refinement Plan

## Objetivo

Refinar o MCP para:

- criar UI no Penpot de forma segura e editável
- manter metadata suficiente para export
- gerar Dart mais limpo, sem transcrever o canvas de forma bruta
- obrigar um fluxo token-first para cores, spacing, radius e tipografia

Sem:

- reimplementar internals de layout do Penpot
- persistir no arquivo uma tree "tipo Flutter" que quebre a UI do editor

## Diagnóstico Atual

### O que já está bom

- base estável do MCP recuperada e saudável
- fluxo `library-first` já funciona
- `create_widget_tree` já cria containers melhores com `role` e `slot`
- tokens reais do Penpot já podem ser criados e lidos
- `export_to_flutter` já produz uma IR segura
- `generate_flutter_dart` já gera `.dart` inicial

### O que ainda está ruim

- o codegen Dart ainda transpila demais o canvas
- há `Padding`, `Container` e `width` redundantes
- falta colapsar padrões repetidos em widgets/helpers reutilizáveis
- tokens são aceitos, mas o fluxo ainda é muito `tool-first`
- o sistema de design ainda não é planejado antes da UI
- o export ainda usa poucos sinais semânticos do sistema de tokens

## Princípios

1. Penpot-first

- o MCP só deve usar operações que o Penpot sustenta bem
- layout e edição precisam continuar estáveis no editor

2. Token-first

- UI nova não deve nascer com valores hardcoded se existir intenção de token
- cor, spacing, radius, typography e sizing devem ser definidos antes da composição

3. Export-first metadata

- a tree Flutter não deve ser persistida no canvas
- o canvas guarda metadata segura
- o Flutter é reconstruído a partir de IR semântica

4. Library-first

- se existir componente real em library conectada, ele deve ser preferido
- composição manual deve ficar para shell, slots e fallback

## Fase 1: Limpeza do Codegen Flutter

### Meta

Gerar Dart mais legível, reutilizável e próximo de um widget real de app.

### Mudanças

- adicionar uma etapa de normalização antes do render
- remover nós vazios e wrappers neutros
- colapsar `Padding -> Container -> Column` quando não agregarem valor
- evitar widths fixos de canvas em demos/export
- trocar `Row` rígido por `Wrap` quando o nó for um cluster de cards
- consolidar helpers:
  - `_buildVariantCard`
  - `_buildFontWeightText`
  - `section shell`
  - `library toolbar cluster`

### Arquivos

- `mcp/packages/server/src/tools/GenerateFlutterDartTool.ts`

### Critério de aceite

- sem `Padding(0)`
- sem `SizedBox.shrink()` inútil no topo
- sem `Container(width: 760)` herdado só do canvas
- cards de variantes exportados como bloco coerente
- sections exportadas com hierarquia visual clara

## Fase 2: Token-First UX no MCP

### Meta

Parar de criar tokens de forma improvisada e passar a estruturar o sistema antes da UI.

### Mudanças

- introduzir uma tool de planejamento:
  - `plan_design_token_system`
- introduzir uma tool de setup:
  - `setup_design_token_system`
- introduzir uma tool de normalização auditável:
  - `normalize_design_token_payload`
- introduzir uma tool de sugestão:
  - `suggest_design_token_names`
- manter `upsert_design_token` como low-level

### Entradas esperadas

- nome do sistema
- metodologia:
  - `4pt`
  - `8pt`
  - `60/30/10`
  - `custom`
- convenção de nomes:
  - `semantic`
  - `scale`
  - `hybrid`
- estrutura de sets:
  - `core`
  - `semantic`
  - `component`
  - `theme`
- themes:
  - `light`
  - `dark`
  - outros

### Regras

- `shadow` continua explicitamente fora por enquanto
- `_Tokens` continua opcional e só documental
- fonte da verdade continua sendo `penpot.library.local.tokens`

### Arquivos

- `mcp/packages/plugin/src/PenpotUtils.ts`
- `mcp/packages/server/src/tools/UpsertDesignTokenTool.ts`
- novas tools em `mcp/packages/server/src/tools/`
- `mcp/packages/server/data/initial_instructions.md`

### Critério de aceite

- o agente consegue planejar o sistema antes de criar UI
- o MCP sugere nomes coerentes
- o input aceito pelo usuário é mais semântico e menos dependente do formato do Penpot
- a limitação atual de `theme.activeSets` via plugin API fica documentada e não bloqueia o roadmap

## Fase 3: Metadata de Sistema para Export

### Meta

Levar contexto suficiente do design system até o export Flutter.

### Mudanças

- persistir metadata mínima no `pluginData`:
  - `mcp.designSystem.name`
  - `mcp.designSystem.namingConvention`
  - `mcp.designSystem.scaleType`
  - `mcp.designSystem.theme`
  - `mcp.designSystem.set`
- enriquecer a IR de Flutter com:
  - contexto do sistema
  - refs resolvidas por token

### Arquivos

- `mcp/packages/common/src/types.ts`
- `mcp/packages/plugin/src/PenpotUtils.ts`
- `mcp/packages/server/src/tools/ExportToFlutterTool.ts`

### Critério de aceite

- o Dart exportado conhece melhor `core`, `semantic` e `theme`
- o codegen pode priorizar nomes semânticos reais dos tokens

## Fase 4: Aplicação de Tokens em Shapes

### Meta

Parar de deixar a aplicação de tokens implícita demais.

### Mudanças

- criar `apply_design_tokens_to_shape`
- criar `inspect_design_token_usage`
- warnings quando houver valor hardcoded em shape com equivalente tokenizado

### Critério de aceite

- o agente consegue aplicar tokens a propriedades corretas com uma tool dedicada
- o export avisa quando existe desacoplamento entre shape e token system

## Fase 5: Smokes de Fechamento

### Smoke A

- criar sistema de tokens
- criar board manual token-first
- exportar para Dart
- revisar resultado

### Smoke B

- usar libraries conectadas
- preencher slots com componentes reais
- aplicar tokens
- exportar para Dart

### Smoke C

- dashboard mais complexo
- sections
- toolbar
- cards
- lista lateral
- variantes
- export final para Flutter

## Ordem Recomendada

1. Fase 1: limpeza do codegen
2. Fase 2: token-first UX
3. Fase 3: metadata de sistema para export
4. Fase 4: aplicação/inspeção de tokens
5. Fase 5: smoke final de dashboard complexo

## Riscos

- se mexer demais na IR, volta o risco de acoplar export ao layout interno do Penpot
- se beautificar demais o Dart, pode perder fidelidade semântica do canvas
- se tokens forem tratados só no export e não na criação, a UI continua inconsistente
- o catálogo de themes/sets do Penpot pode exigir semântica adicional fora do que a plugin API expõe hoje; isso deve ser tratado como investigação isolada ou plugin dedicado, não como bloqueio da pipeline principal

## Decisões Já Fechadas

- não migrar o protocolo MCP para outro formato agora
- não usar `shadow` token via MCP por enquanto
- não usar `_Tokens` como fonte real
- não persistir tree Flutter no arquivo do Penpot
