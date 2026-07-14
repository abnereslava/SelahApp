# Plano Técnico: Tema de Fundo Dinâmico

## 1. Resumo da solução

Introduzir uma camada de fundo global fixa (imagem Unsplash) com uma sobreposição de cor (overlay) cuja tonalidade e opacidade variam conforme a faixa de horário local. Tornar translúcidas as superfícies de listagem/menu usando `background` com alpha + `backdrop-filter: blur()`, mantendo as superfícies de leitura e escrita com fundo legível. Remover o dark mode não utilizado. Cachear a imagem no service worker.

Abordagem em camadas (do fundo para a frente):
1. **Imagem de fundo** — pseudo-elemento fixo em `body::before` (ou um `.app-bg` dedicado), `position: fixed; inset: 0; background-image: url(...); background-size: cover; z-index: -2;`.
2. **Overlay de cor por horário** — `body::after` (ou `.app-bg-overlay`), `position: fixed; inset: 0; z-index: -1;` com `background` controlado por uma variável CSS `--tod-overlay` definida via JS conforme a hora.
3. **Conteúdo** — permanece acima; janelas translúcidas usam alpha+blur; janelas de leitura/escrita usam fundo mais opaco.

O horário é lido em JS (`new Date().getHours()`), mapeado para uma das faixas, e a faixa é aplicada setando `document.documentElement.dataset.tod = 'dia'|'tarde'|'noite'` (para hooks CSS) e/ou a variável `--tod-overlay`. Reavaliação em `visibilitychange`/`focus` e por um `setInterval` leve (ex.: a cada 10 min).

## 2. Dependências

- Nenhuma biblioteca nova. Usa apenas CSS (`backdrop-filter`, pseudo-elementos, variáveis) e JS vanilla já presente em `script.js`.
- Service worker (`sw.js`) para cache da imagem (host externo `images.unsplash.com`).
- A imagem é externa; o SW hoje ignora cross-origin no fetch handler — será preciso adicioná-la ao `urlsToCache` no `install` (cache explícito) ou tratar via runtime cache específico.

## 3. Arquivos afetados

- `style.css` — **principal**. Adicionar camadas de fundo (`body::before`/`::after` ou classes dedicadas), variáveis de overlay por horário, ajustar superfícies para translucidez (sidebar, `.record-card`, `.stats-card`, `.data-container`/filtros, `.fab-sheet`, `.mobile-floating-toolbar`, `.modal-content`), garantir opacidade nas superfícies de leitura/escrita (`.reading-scroll`/`.reading-body`, `.ql-editor`, `.create-overlay`). **Remover** o bloco `[data-theme="dark"]` e referências.
- `script.js` — adicionar módulo utilitário `applyTimeOfDayTheme()` que calcula a faixa de horário e a aplica; registrar listeners (`visibilitychange`, `focus`) e um `setInterval`. Chamar no boot.
- `index.html` — bump de cache-busting (`style.css?v=`, `script.js?v=`); possivelmente `<meta name="theme-color">` dinâmico por horário [Sugestão, opcional].
- `sw.js` — bump `CACHE_NAME`; adicionar a URL da imagem ao cache (install) com fallback; garantir que a resposta da imagem (cross-origin/opaca) seja tratada.
- `manifest.json` — sem mudanças previstas.

## 4. Estrutura de dados

- Nenhuma coleção/campo no Firestore. Estado apenas em memória/DOM:
  - `document.documentElement.dataset.tod` = `'dia' | 'tarde' | 'noite'`.
  - Constante JS com as faixas: `[{ id:'dia', from:6, to:16 }, { id:'tarde', from:17, to:19 }, { id:'noite', ... }]` e cores correspondentes (ou cores 100% no CSS via `[data-tod=...]`).

## 5. Regras de segurança e permissões

- Sem impacto em auth/Firestore. Nenhuma leitura/escrita de dados do usuário.
- Imagem externa: sem dados sensíveis. Cache é apenas do asset visual.

## 6. Fluxos técnicos

1. Boot do app (após render inicial) → `applyTimeOfDayTheme()` lê a hora, escolhe faixa, seta `data-tod` no `<html>`.
2. CSS reage a `[data-tod="tarde"]` / `[data-tod="noite"]` alterando o `background` do overlay fixo.
3. `visibilitychange`/`focus` e `setInterval(10min)` → reexecuta `applyTimeOfDayTheme()`; se a faixa mudou, o CSS atualiza automaticamente.
4. SW no `install` tenta cachear a imagem; no `fetch`, serve do cache quando offline.

## 7. Impactos no sistema existente

- Visual global: todas as telas ganham o fundo. Superfícies passam a ter alpha/blur — pode exigir ajustes finos de contraste (bordas, sombras).
- Remoção do dark mode: como não está em uso, impacto funcional nulo; reduz CSS.
- Leitura/escrita: precisa manter contraste — risco controlado mantendo essas superfícies opacas.

## 8. Riscos técnicos

- **Contraste/legibilidade** em cartões translúcidos sobre imagem clara/escura — mitigar com alpha suficiente + blur + sombra de texto quando necessário.
- **Desempenho de `backdrop-filter`** em mobile antigo — usar em número controlado de superfícies; ter fallback (`@supports not (backdrop-filter)` → alpha maior).
- **Cache cross-origin da imagem** — resposta opaca não pode ser inspecionada; usar `cache.add` com cuidado e não quebrar o SW se falhar (try/catch).
- **Transição de faixa** — garantir reavaliação sem recarregar.
- **theme-color/status bar** — pode destoar do novo fundo (ajuste opcional).

## 9. Estratégia de teste (manual)

- Abrir em desktop e mobile: confirmar fundo fixo e translucidez das listas.
- Forçar horários (mockar `Date`/ajustar relógio ou expor helper temporário) para ver filtro dia/tarde/noite.
- Abrir leitura de um registro longo e o formulário de criação: confirmar legibilidade.
- Testar offline (DevTools → Offline) após um acesso online: fundo deve persistir ou cair no fallback sem quebrar.
- Regressão: criar/editar/ler/excluir registro e bênção, filtros, sorteio, favoritos.

## 10. Ordem recomendada de implementação

1. Remover dark mode do `style.css` (limpeza de base).
2. Adicionar camadas de fundo (imagem + overlay) e variáveis por horário no CSS.
3. Adicionar `applyTimeOfDayTheme()` + listeners no `script.js`.
4. Tornar translúcidas as superfícies de listagem/menu e blindar as de leitura/escrita.
5. Cache da imagem no `sw.js` + fallback.
6. Bump de versões (sw/css/js/import) e teste manual.
