# Revisão: Tema de Fundo Dinâmico

## 1. Status geral

Aprovado com ajustes (pendente de validação visual do usuário em produção com a imagem real carregada).

## 2. Resumo da implementação

- Adicionadas duas camadas de fundo fixas em `index.html` (`.app-bg` com a imagem Unsplash + `.app-bg-overlay` com o filtro de cor), atrás de todo o conteúdo.
- Em `style.css`: variáveis centralizadas de fundo/vidro (`--app-bg-image`, `--tod-overlay`, `--glass-bg`, `--glass-bg-strong`, `--reading-surface`, `--glass-blur`); overlays por horário via `:root[data-tod="dia|tarde|noite"]`; fallback `@supports` sem `backdrop-filter`.
- Superfícies de listagem/menu tornadas translúcidas (sidebar, `.data-container`, `.record-card`, `.stats-card`, `.modal`, `.fab-sheet`, `.mobile-floating-toolbar`, barra mobile e `.login-card`).
- Superfícies de leitura/escrita mantidas legíveis com vidro forte (`--reading-surface` 0.94) + blur no mobile; no desktop permanecem opacas (comportamento pré-existente de dialog).
- Removido o bloco `[data-theme="dark"]` (dark mode não utilizado).
- `script.js`: `applyTimeOfDayTheme()` calcula a faixa pela hora local, seta `data-tod` e ajusta o `<meta theme-color>`; reavaliação em `visibilitychange`/`focus` e a cada 10 min.
- `sw.js`: cache da imagem de fundo no install (try/catch) e fetch cache-first para `images.unsplash.com`; bump para v42.

## 3. Critérios de aceite

- [x] Imagem como fundo fixo em toda a aplicação (camadas presentes; validado via Playwright — estrutura e `background-image` corretos).
- [x] Janelas de listagem/menu translúcidas (glass + blur aplicados).
- [x] Leitura e formulário permanecem legíveis (vidro forte 0.94 + blur no mobile; opaco no desktop).
- [x] Filtro alaranjado ao entardecer e escuro à noite (overlays validados via Playwright para dia/tarde/noite).
- [x] Filtro corresponde à hora local e reavalia em foco/intervalo (`applyTimeOfDayTheme`).
- [x] Sem imagem (offline/sem cache), app utilizável com fallback de cor sólida (`--bg-color` em `.app-bg`/`body`).
- [ ] Sem regressão nos fluxos existentes — a validar manualmente em produção (auth do Firebase indisponível no sandbox de teste).

## 4. Tarefas concluídas

- Tarefa 1 — Remover dark mode. Concluída.
- Tarefa 2 — Camadas de fundo + variáveis por horário. Concluída.
- Tarefa 3 — Lógica de horário em JS. Concluída.
- Tarefa 4 — Janelas translúcidas (blindando leitura/escrita). Concluída.
- Tarefa 5 — Cache da imagem no SW + bump de versões. Concluída.

## 5. Testes realizados

- Playwright (chromium headless, viewport 390×780): confirmadas as camadas `.app-bg`/`.app-bg-overlay`, o `background-image` correto e os três overlays (`dia`/`tarde`/`noite`) com as cores esperadas; login card translúcido e legível nos três filtros.
- `node --check` em `script.js` e `sw.js` (OK). Contagem de chaves do `style.css` balanceada (568/568).
- Observação: fontes/Quill/Firebase/Unsplash são bloqueados pela rede do sandbox; por isso a imagem real não aparece nos screenshots e o `data-tod` não foi setado no teste (o módulo depende do Firebase). Em produção esses recursos carregam normalmente.

## 6. Problemas encontrados

- A lógica `applyTimeOfDayTheme()` está no fim de `script.js`, que importa o Firebase no topo; se o Firebase falhar ao carregar, o `data-tod` não é setado (cai no overlay padrão "dia" via CSS). Aceitável, pois o app inteiro depende do Firebase de qualquer forma.
- Desktop: durante leitura/escrita o backdrop escuro pré-existente (`rgba(0,0,0,0.68)`) escurece o fundo; a imagem aparece plenamente nas listas, não nesses modais de desktop. Comportamento mantido para não regредir a legibilidade.

## 7. Alterações fora do escopo

- `.login-card` tornado translúcido e `.login-container` transparente para atender "todo o background seja esta imagem" também na tela de login. Dentro da intenção do pedido.
- Ajuste do `<meta theme-color>` por horário (melhoria sutil da barra do navegador). [Sugestão implementada.]

## 8. Pendências

- Validação visual final em produção (com a imagem real e Firebase ativos), em mobile e desktop.
- Conferir desempenho do `backdrop-filter` em aparelhos mais fracos.

## 9. Recomendações

- Se o usuário quiser a imagem também de fundo nos modais de leitura/escrita no desktop, reduzir a opacidade do backdrop desktop (`.reading-overlay`/`.create-overlay` em `@media (min-width:769px)`).
- Ajustar limites de horário/intensidades em `TOD_BANDS` (script.js) e nas variáveis `:root[data-tod=...]` (style.css) conforme preferência.

## 10. Conclusão

Funcionalidade implementada conforme spec/plan/tasks e validada estruturalmente. Pronta para uso, pendente apenas de confirmação visual do usuário em produção.
