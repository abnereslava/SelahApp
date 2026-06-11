# Tarefas: Layout Desktop Otimizado

## Visão geral

Cinco tarefas sequenciais: CSS → registros.js → bencaos.js → FAB dropdown → cache bump.

---

## Tarefa 1 — CSS: overlay-dialog + backdrop + animações + Quill desktop

Status: Pendente

### Objetivo

Adicionar ao `style.css` todas as regras desktop (≥769px) que transformam os overlays em diálogos centrados com backdrop, incluindo animações e suporte ao Quill snow no desktop.

### Arquivos afetados

- `style.css`

### Dependências

Nenhuma.

### Critério de conclusão

- Classes `.overlay-dialog` com estilos de dialog centrado definidas para desktop.
- `@keyframes dialogIn` e `dialogOut` definidos.
- `.create-overlay` no desktop usa `opacity + visibility` em vez de `translateY`.
- `.reading-bottom-bar` dentro do dialog tem `order:-1` no desktop.
- `.ql-toolbar.ql-snow` visível no desktop; `.mobile-floating-toolbar` oculto no desktop.
- Todas as mudanças dentro de `@media (min-width: 769px)`.

### Teste manual

Abrir o app no browser, inspecionar o CSS. Mesmo sem os wrappers JS ainda, verificar que as regras novas existem e não quebram o layout mobile (testar em 375px viewport).

### Observações

O `.create-overlay` no desktop atualmente usa `transform: translateX(-50%) translateY(...)`. Esse override deve ser completamente substituído. O `!important` pode ser necessário para sobrescrever regras inline de transição.

---

## Tarefa 2 — registros.js: wrappers overlay-dialog + backdrop handlers

Status: Pendente

### Objetivo

Adicionar `<div class="overlay-dialog">` dentro de cada overlay do módulo de registros (create, reading, analytics, passage picker) e adicionar handlers de backdrop click.

### Arquivos afetados

- `modules/registros.js`

### Dependências

Tarefa 1 concluída (CSS já deve existir para testar visualmente).

### Critério de conclusão

- Create overlay: conteúdo (header + scroll) envolto em `.overlay-dialog`.
- Reading overlay: `.reading-scroll` + `.reading-bottom-bar` envoltos em `.overlay-dialog`.
- Analytics overlay: `.reading-toolbar` + `.reading-scroll` envoltos em `.overlay-dialog`.
- Passage picker overlay: toolbar + search-row + content envoltos em `.overlay-dialog`.
- Cada overlay dinâmico tem handler `overlay.addEventListener('click', e => { if (e.target === overlay) close(); })`.
- Create overlay tem handler `createOverlayEl.addEventListener('click', e => { if (e.target === createOverlayEl) window._requestCloseRegistros(); })`.

### Teste manual

No desktop: criar registro, abrir leitura, abrir analytics, abrir passage picker. Cada um deve aparecer como dialog centrado. Clicar fora fecha (com confirmação se aplicável). No mobile (375px): tudo igual ao anterior.

### Observações

O create overlay é HTML estático em `container.innerHTML`. O wrapper `.overlay-dialog` deve envolver `.create-overlay-header` + `.create-overlay-scroll`. O `id` do overlay para o handler de backdrop é `createRegistrosOverlay`.

---

## Tarefa 3 — bencaos.js: wrappers overlay-dialog + backdrop handlers

Status: Pendente

### Objetivo

Mesmo padrão da Tarefa 2, aplicado ao módulo de bênçãos (create, reading, analytics).

### Arquivos afetados

- `modules/bencaos.js`

### Dependências

Tarefa 2 concluída.

### Critério de conclusão

- Create overlay: conteúdo envolto em `.overlay-dialog`.
- Reading overlay: `.reading-scroll` + `.reading-bottom-bar` envoltos em `.overlay-dialog`.
- Analytics overlay: `.reading-toolbar` + `.reading-scroll` envoltos em `.overlay-dialog`.
- Backdrop handlers adicionados.

### Teste manual

No desktop: criar bênção, abrir leitura de bênção, abrir analytics de bênções. Cada um como dialog centrado. Mobile inalterado.

---

## Tarefa 4 — FAB desktop: dropdown em vez do drawer mobile

Status: Pendente

### Objetivo

No desktop, o clique no `btnDesktopFab` abre um pequeno menu flutuante (dropdown) com opções "Novo Registro" e "Nova Bênção", em vez do drawer mobile (`fab-sheet`).

### Arquivos afetados

- `index.html` — adicionar HTML do dropdown `.desktop-fab-dropdown`
- `script.js` — lógica de abrir/fechar dropdown no desktop

### Dependências

Tarefa 3 concluída.

### Critério de conclusão

- No desktop (≥769px): clicar no FAB abre dropdown acima do botão com 1 ou 2 opções.
- Clicar em uma opção abre o overlay correspondente e fecha o dropdown.
- Clicar fora do dropdown fecha-o.
- No mobile (≤768px): comportamento existente (fab-sheet) inalterado.

### Teste manual

Desktop: clicar no FAB, verificar dropdown. Clicar em "Novo Registro". Mobile: clicar no FAB, verificar fab-sheet.

### Observações

Quando apenas uma feature está disponível (registros OU bencaos), `openFabSheet` já abre diretamente sem mostrar o sheet. Esse comportamento se mantém em ambos os breakpoints.

---

## Tarefa 5 — sw.js: bump de versão do cache

Status: Pendente

### Objetivo

Incrementar o `CACHE_NAME` para garantir que os browsers carreguem os novos assets.

### Arquivos afetados

- `sw.js`

### Dependências

Tarefas 1–4 concluídas.

### Critério de conclusão

- `CACHE_NAME` bumped de `v20` para `v21`.

### Teste manual

Hard reload no browser. Verificar no DevTools > Application > Cache Storage que o cache `v21` está ativo.
