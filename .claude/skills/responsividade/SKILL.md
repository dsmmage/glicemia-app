---
description: Audita e corrige a responsividade do app para os principais tamanhos de tela (mobile, tablet, desktop)
---

Use a ferramenta Glob para encontrar todos os arquivos `**/*.tsx` dentro de `src/`, excluindo `node_modules`. Em seguida, use a ferramenta Read para ler cada arquivo encontrado. Depois de ler todos os arquivos, analise e **corrija** os problemas de responsividade encontrados diretamente no código, aplicando as correções com a ferramenta Edit.

## Breakpoints de referência (Tailwind)

| Prefixo | Largura mínima | Dispositivo típico         |
|---------|---------------|----------------------------|
| (base)  | 0px           | Mobile pequeno (320–375px) |
| `sm:`   | 640px         | Mobile grande / landscape  |
| `md:`   | 768px         | Tablet                     |
| `lg:`   | 1024px        | Desktop pequeno            |
| `xl:`   | 1280px        | Desktop                    |

## O que verificar e corrigir

### Layout e estrutura
- Containers sem `max-w-*` + `mx-auto` que podem estourar em telas largas
- `flex` sem `flex-wrap` quando os filhos podem não caber em uma linha
- Grids com colunas fixas (`grid-cols-4`) sem versão menor para mobile (`grid-cols-2`)
- Elementos com `fixed` ou `absolute` sem considerar safe areas em mobile (`pb-safe`, `env(safe-area-inset-*)`)
- Sidebars ou elementos `hidden md:flex` — verificar se o conteúdo mobile é igualmente funcional

### Textos
- Tamanhos de fonte grandes (`text-3xl` ou mais) sem redução em mobile (ex: `text-xl md:text-3xl`)
- Textos que podem truncar sem `truncate` ou `break-words` em containers estreitos
- Uso de `whitespace-nowrap` em textos longos sem fallback responsivo

### Botões e elementos interativos
- Botões com área de toque menor que 44×44px em mobile (altura `py-2` ou menos sem compensação)
- Botões lado a lado sem `flex-wrap` ou versão em coluna para telas pequenas
- Inputs com `text-sm` ou menor em mobile (causa zoom automático no iOS — mínimo `text-base` = 16px)

### Imagens e ícones
- Imagens sem `w-full` ou dimensões responsivas
- Ícones com tamanho fixo muito pequeno em mobile

### Navegação
- Menus ou tabs horizontais sem scroll horizontal (`overflow-x-auto`) quando há muitos itens
- Bottom nav com itens que podem não caber em telas de 320px

### Espaçamentos
- `px-*` ou `py-*` muito grandes em mobile que comprimem o conteúdo
- `gap-*` em grids que podem ser reduzidos em mobile

## Como corrigir

Para cada problema encontrado:
1. Aplique a correção diretamente no arquivo com a ferramenta Edit
2. Use classes responsivas do Tailwind no padrão `base:md:lg:` (mobile-first)
3. Prefira adicionar o modificador de breakpoint à classe existente em vez de duplicar elementos

## Formato do relatório

Após aplicar todas as correções, apresente:
- **Arquivo e linha** (link clicável) de cada problema encontrado
- **Descrição** do problema
- **Correção aplicada** (antes → depois)

Ao final, mostre um resumo com total de correções por categoria.

Se nenhum problema for encontrado em uma categoria, não a liste.
