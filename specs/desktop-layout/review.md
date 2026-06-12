# Revisão: Layout Desktop Otimizado

## 1. Status geral

Aprovado com ajustes (implementado conforme spec/plan/tasks; dois ajustes
pós-feedback aplicados — ver seção 11).

## 2. Resumo da implementação

No desktop (≥ 769px), todos os overlays do app passaram a ser exibidos como
**diálogos centrados com backdrop escuro**, em vez de telas cheias herdadas do
mobile. O mobile permanece inalterado (todas as mudanças vivem em
`@media (min-width: 769px)`).

- `style.css`:
  - `.overlay-dialog`: caixa de diálogo centrada com `border-radius`, `box-shadow`,
    `max-height: 88vh` e scroll interno. Larguras por tipo: create ~700px, leitura
    ~760px, analytics ~900px, passage picker ~480px.
  - `.reading-overlay`/`.create-overlay` viram backdrops (`flex` centralizado,
    fundo `rgba(0,0,0,.68)`).
  - Animações `dialogIn`/`dialogOut` (scale + opacity).
  - `.reading-bottom-bar` sobe para o topo do diálogo via `order: -1`.
  - Quill: floating toolbar mobile ocultada; toolbar nativa (snow) exibida no
    desktop.
  - Estilos do dropdown do FAB desktop (`.desktop-fab-dropdown`).
- `modules/registros.js`: wrappers `.overlay-dialog` nos 4 overlays (create,
  leitura, analytics, passage picker) + handlers de clique no backdrop.
- `modules/bencaos.js`: wrappers `.overlay-dialog` nos 3 overlays (create,
  leitura, analytics) + handlers de backdrop.
- `index.html` + `script.js`: dropdown do FAB desktop (Novo Registro / Nova
  Bênção) substituindo o drawer mobile; fecha ao clicar fora.
- `sw.js`: cache `v21`.

## 3. Critérios de aceite

- [x] Create overlay de Registros no desktop é dialog centrado (~700px).
- [x] Create overlay de Bênçãos no desktop é dialog centrado (~700px).
- [x] Reading overlay de Registros no desktop é dialog centrado (~760px).
- [x] Reading overlay de Bênçãos no desktop é dialog centrado (~760px).
- [x] Analytics overlay no desktop é dialog centrado (~900px).
- [x] Passage picker no desktop é dialog centrado (~480px).
- [x] Clicar no backdrop fecha o overlay (com confirmação de rascunho quando aplicável).
- [x] Pressionar Escape fecha o overlay ativo (handler já existente mantido).
- [x] FAB desktop abre menu flutuante, não o drawer mobile.
- [x] Mobile (≤ 768px) continua funcionando como antes.
- [x] Auto-save e draft recovery funcionam normalmente no desktop.
- [x] Quill funciona dentro do dialog desktop (toolbar snow).

## 4. Tarefas concluídas

Tarefas 1 a 5 (ver tasks.md) — todas concluídas.

## 5. Testes realizados

- `node --check` em `script.js`, `modules/registros.js`, `modules/bencaos.js`: OK.
- Verificação de pareamento dos wrappers `.overlay-dialog` (7 overlays, abre/fecha).
- Validação visual pelo usuário (com ajuste de centralização — ver seção 11).

## 6. Problemas encontrados

- Ajuste necessário na centralização do create overlay: regra antiga do desktop
  (`left:50%; right:auto; top:60px`) sobrescrevia o novo layout flex. Corrigido.

## 7. Alterações fora do escopo

- Nenhuma além das previstas.

## 8. Pendências

- [Sugestão / não confirmada] Navegação por teclado (Tab/Enter/setas) no passage
  picker do desktop — não solicitada explicitamente; aguardando decisão.

## 9. Recomendações

- Avaliar, no futuro, foco automático no primeiro campo do create overlay ao abrir
  no desktop (pequeno ganho de UX com teclado).

## 10. Conclusão

Funcionalidade pronta e em uso. Mobile preservado.

## 11. Addendum (ajustes pós-feedback)

- **Centralização do create overlay:** zeradas as propriedades de posicionamento
  antigas do desktop para o backdrop flex centralizar corretamente o diálogo.
- **Abertura de "Nova Bênção"/"Novo Registro" fora da aba correspondente:**
  `openCreateOverlay` passou a verificar se o elemento do overlay existe no DOM;
  se não existir (usuário em outra aba), navega para a aba e abre o overlay via
  `_pendingCreateOverlay`.
