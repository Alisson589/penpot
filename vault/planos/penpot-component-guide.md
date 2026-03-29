# 📐 Penpot — Guia de Estruturação de Componentes

> Referência para criação correta de componentes no Penpot, incluindo regras, tipos, variantes e boas práticas para uso com MCP automatizado.

---

## 1. Conceitos Fundamentais

### O que é um Componente no Penpot?

Um **componente** é um padrão de design reutilizável que pode ser inserido em múltiplos lugares do projeto. Ao atualizar o **componente principal (main component)**, todas as instâncias (cópias) são atualizadas automaticamente.

- **Main Component**: O componente original. Identificado por um ícone de **diamante duplo** no canvas e no painel de Layers. É armazenado no painel de Assets.
- **Instance (cópia)**: Uma cópia do main component usada no canvas. Pode ter **overrides** (sobrescritas) locais de texto, cor e conteúdo.
- **Override**: Alteração local feita em uma instância sem modificar o main component. Pode ser resetado com "Reset overrides".

### Atalho para criar componente

```
Ctrl/Cmd + K → cria um componente a partir da seleção
```

---

## 2. Regras de Criação de Componentes

### ✅ Regras Obrigatórias

1. **Todo componente deve ser criado a partir de um frame ou grupo nomeado.**  
   Não crie componentes de shapes soltos sem agrupá-los primeiro.

2. **Nomeie com hierarquia usando `/`.**  
   Exemplo: `Buttons/Primary/Default`, `Forms/Input/Text`.  
   O Penpot organiza automaticamente em pastas no painel de Assets.

3. **Use Flex Layout ou Grid Layout internamente.**  
   Componentes sem layout ficam estáticos e não respondem bem a overrides de conteúdo.

4. **Defina o tamanho do componente corretamente:**
   - `Fixed`: tamanho fixo, não responsivo
   - `Hug`: ajusta ao conteúdo (ideal para botões e tags)
   - `Fill`: preenche o container pai (usar em itens dentro de layouts)

5. **Nunca deixe textos, cores ou estilos hardcoded.**  
   Use Design Tokens ou estilos compartilhados para cores e tipografia.

6. **Todo main component deve ficar em uma página dedicada** (ex: `_Components`, `_Library`), separado das telas de design.

7. **Anote seus componentes.**  
   Use a função de **Annotation** (anotação) do Penpot para documentar como o componente deve ser usado.

### ❌ Erros Comuns a Evitar

- Criar muitos componentes quase idênticos sem usar variantes
- Nomear por aparência ("button-blue") em vez de propósito ("button-primary")
- Não usar Auto Layout, criando componentes que quebram quando o texto muda
- Aninhar muitas camadas sem nomenclatura clara, dificultando overrides
- Usar cores e tipografias diretas em vez de tokens/estilos

---

## 3. Tipos de Componentes no Penpot

### 3.1 Componente Simples (Base Component)

Componente sem variantes. Um único estado/aparência.

**Quando usar:** Ícones, divisores, avatares sem estado, logos.

```
Estrutura:
ComponentName/
├── Frame (Flex/Grid Layout)
│   ├── Icon
│   └── Label
```

### 3.2 Componente com Variantes (Variant Component)

Agrupa múltiplas versões do mesmo componente sob **propriedades e valores**.

**Quando usar:** Botões (primary/secondary/disabled), inputs (default/error/focus), badges, chips, alertas.

**Como funciona:**
- Cada variante é um main component separado, mas agrupado visualmente com uma borda roxa
- Cada variante tem **Property: Value** (ex: `State: Hover`, `Size: Large`)
- Selecionando uma instância no canvas, o painel Design mostra os menus de seleção de variante

**Estrutura de propriedades recomendada (ordem de hierarquia):**
1. **Type/Purpose** → `primary`, `secondary`, `ghost`
2. **Size** → `small`, `medium`, `large`
3. **State** → `default`, `hover`, `active`, `focus`, `disabled`
4. **Modifiers booleanos** → `icon: true/false`, `loading: true/false`

```
Button/
├── [Type=Primary, Size=Medium, State=Default, Icon=False]
├── [Type=Primary, Size=Medium, State=Hover, Icon=False]
├── [Type=Primary, Size=Medium, State=Disabled, Icon=False]
├── [Type=Primary, Size=Medium, State=Default, Icon=True]
├── [Type=Secondary, Size=Medium, State=Default, Icon=False]
...
```

### 3.3 Componente Aninhado (Nested Component)

Componentes compostos por outros componentes internamente.

**Quando usar:** Cards (que contêm Button + Avatar + Tag), Navigation bars, Modais, Forms.

**Regras de aninhamento:**
- Use **Swap Instance** para trocar componentes filhos dentro do pai
- Nomeie as camadas internas com nomes que correspondam aos slots esperados
- Evite aninhar mais de 3 níveis para não perder rastreabilidade de overrides

```
Card/
├── Frame (Flex Column, Hug)
│   ├── Image (component: Image/Placeholder)
│   ├── Content/
│   │   ├── Title (Text, token: text-heading-sm)
│   │   └── Description (Text, token: text-body-md)
│   └── Actions/
│       ├── Button/Primary/Medium (instance)
│       └── Button/Ghost/Medium (instance)
```

### 3.4 Componente de Layout (Layout/Structure Component)

Componente que serve como estrutura/container sem conteúdo fixo.

**Quando usar:** Grid containers, Section wrappers, Card skeletons.

- Use **Grid Layout** para layouts de 2D (ex: bento grids)
- Use **Flex Layout** para layouts lineares (linhas ou colunas)
- Defina tamanhos de colunas com `fr` (fração) para responsividade

```
Layout/Grid-2col/
├── Grid Frame (Grid Layout, 2 cols 1fr 1fr, gap 16)
│   ├── Slot A (Fill)
│   └── Slot B (Fill)
```

### 3.5 Componente de Estado/Feedback

Componentes que representam estados de sistema: loading, error, success, empty.

**Quando usar:** Alerts, Toasts, Empty states, Skeleton loaders.

```
Alert/
├── [Type=Error, Icon=True]
├── [Type=Success, Icon=True]
├── [Type=Warning, Icon=True]
├── [Type=Info, Icon=True]
```

---

## 4. Convenção de Nomenclatura

### Formato de nome:

```
Categoria/Subcategoria/NomeComponente
```

### Exemplos práticos:

| Errado ❌ | Correto ✅ |
|---|---|
| `button-blue` | `Buttons/Primary/Default` |
| `card novo` | `Cards/Product/Default` |
| `input-2` | `Forms/Input/Text/Default` |
| `modal v3` | `Overlays/Modal/Confirmation` |
| `icon home` | `Icons/Navigation/Home` |

### Propriedades de variantes:

| Propriedade | Valores exemplo |
|---|---|
| `Type` | `primary`, `secondary`, `ghost`, `danger` |
| `Size` | `xs`, `sm`, `md`, `lg`, `xl` |
| `State` | `default`, `hover`, `active`, `focus`, `disabled`, `loading` |
| `Theme` | `light`, `dark` |
| `Icon` | `true`, `false` |
| `Shape` | `rounded`, `square`, `pill` |

---

## 5. Estrutura de Layers Dentro de um Componente

Nomeie todas as camadas de forma semântica para que overrides funcionem corretamente nas instâncias.

```
[Component Frame]
├── Background (Rectangle)
├── Icon (Instance de componente de ícone)
├── Label (Text — nome semântico, não "Text 1")
├── Badge (Instance — visível condicionalmente)
└── State Overlay (Rectangle com opacity para hover/active)
```

**Regras de camadas:**
- Não renomeie camadas nas instâncias se quiser preservar overrides ao trocar variante
- Camadas com o mesmo nome entre variantes mantêm overrides de texto ao trocar
- Use grupos ou frames nomeados, nunca deixe shapes sem nome

---

## 6. Design Tokens e Estilos

Vincule componentes a tokens para escalabilidade:

```
Cores:       color.button.primary.background → #0066FF
Tipografia:  text.label.medium → Inter 14px/500
Espaçamento: spacing.component.padding-x → 16px
Raio:        radius.button.default → 8px
```

**No Penpot:**
- Crie **Shared Libraries** para cores e tipografias
- Conecte a biblioteca de tokens à biblioteca de componentes
- Use **alias tokens**: `color.action.primary` → aponta para `color.brand.blue.500`

---

## 7. Organização do Arquivo/Biblioteca

### Estrutura de páginas recomendada:

```
📄 _Tokens          → Cores, tipografia, espaçamentos como estilos
📄 _Components      → Todos os main components organizados
📄 _Documentation   → Anotações, exemplos de uso, dos/don'ts
📄 Screens/Home     → Telas reais usando instâncias
📄 Screens/Profile  → ...
```

### Organização no Assets Panel:

```
Components/
├── 📁 Buttons/
│   ├── Primary
│   ├── Secondary
│   └── Ghost
├── 📁 Forms/
│   ├── Input/Text
│   ├── Input/Select
│   └── Checkbox
├── 📁 Cards/
│   ├── Product
│   └── Profile
└── 📁 Navigation/
    ├── Navbar
    └── Sidebar
```

---

## 8. Checklist para Criar um Componente Correto

Antes de marcar um componente como "pronto", verifique:

- [ ] Nome segue a hierarquia com `/` (ex: `Forms/Input/Default`)
- [ ] Frame principal usa **Flex ou Grid Layout**
- [ ] Tamanho definido como `Hug`, `Fill` ou `Fixed` com lógica
- [ ] Todas as camadas internas estão **nomeadas semanticamente**
- [ ] Cores e tipografias usam **estilos compartilhados ou tokens**
- [ ] Variantes criadas para todos os estados necessários
- [ ] Propriedades de variantes seguem a **hierarquia** (type → size → state → modifiers)
- [ ] Componente está na **página `_Components`**, não em telas de design
- [ ] Adicionada **Annotation** explicando o uso
- [ ] Testado com diferentes **conteúdos de texto** (texto curto e longo)
- [ ] Testado dentro de containers **Flex** e **Grid** para verificar comportamento responsivo

---

## 9. Comportamentos Específicos do Penpot

### Overrides e Troca de Variante

- Ao **trocar de variante**, overrides de texto são **preservados** se a camada de texto tiver o **mesmo nome** entre as variantes
- Overrides de cor e fills **não são preservados** automaticamente ao trocar variante
- Use `Right-click → Reset overrides` para voltar ao estado original do main component

### Swap Instance

- Dentro de um componente aninhado, clique na instância filha → painel Design → ícone de swap
- Permite trocar um componente filho por outro do mesmo grupo de variantes ou de outro grupo

### Shared Libraries

- Para compartilhar componentes entre projetos, publique o arquivo como biblioteca: `Assets Panel → Publish Library`
- Outros arquivos podem conectar a biblioteca via `Assets Panel → Add shared library`
- Bibliotecas são compartilhadas **por equipe** (não globalmente entre equipes)

---

## 10. Referências

- [Tutorial: Creating and using component variants in Penpot](https://penpot.app/blog/tutorial-creating-and-using-component-variants-in-penpot/)
- [How to use component variants to scale your design system](https://penpot.app/blog/how-to-use-component-variants-to-scale-your-design-system/)
- [Design systems best practices with Penpot](https://penpot.app/blog/design-systems-best-practices-with-penpot/)
- [Build Design Systems With Penpot Components – Smashing Magazine](https://www.smashingmagazine.com/2024/07/build-design-systems-penpot-components/)
- [Penpot User Guide: Components](https://help.penpot.app/user-guide/components/)
- [Variant Examples Template – Penpot Hub](https://penpot.app/penpothub/libraries-templates/variant-examples)
