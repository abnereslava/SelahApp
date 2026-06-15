# Tarefas: Sistema de Favoritos

## Visão geral

Implementação em 5 tarefas sequenciais para o módulo Registros, seguida de uma tarefa de paridade para Bênçãos, e uma tarefa final de bump de versão.

---

## Tarefa 1 — CSS: estrela no card, botão favoritar na leitura, indicador de filtro ativo

Status: Pendente

### Objetivo

Adicionar todos os estilos necessários para o sistema de favoritos: estrela no canto do card, botão de estrela na barra de leitura e indicador visual do botão "Limpar Filtros".

### Arquivos afetados

- `style.css`

### Dependências

Nenhuma.

### Critério de conclusão

- Classe `.card-fav-btn` existe e posiciona a estrela no canto superior direito do card
- Classe `.card-fav-btn.active` exibe estrela preenchida (cor dourada)
- Classe `.rc-btn-fav` estiliza o botão de favoritar na barra de ações da leitura
- Classe `.rc-btn-fav.active` exibe estado ativo (estrela preenchida)
- Classe `.btn-clear-filters` estiliza o botão "Limpar Filtros" (estilo secundário discreto)

### Teste manual

Inspecionar classes no DevTools confirmando estilos corretos sem quebrar layout dos cards.

### Observações

Usar `ph-star` com `fill` para estado ativo via `font-variation-settings` ou trocar para `ph-star-fill`. Phosphor Icons suporta `ph-star` (outline) e nenhuma variante fill diretamente via classe — usar `color: var(--accent-gold, #c9a84c)` no estado ativo + `content` do pseudo-elemento ou simplesmente a cor diferente é suficiente. Verificar qual abordagem é mais limpa.

---

## Tarefa 2 — Registros: filterState + botão "Limpar Filtros"

Status: Pendente

### Objetivo

Refatorar o `btnApplyFilters` para persistir o estado dos filtros num objeto `filterState`, e adicionar o botão "Limpar Filtros" que zera tudo e reaparece só quando há filtro ativo.

### Arquivos afetados

- `modules/registros.js`
- `index.html` (HTML do painel de filtros — adicionar botão "Limpar Filtros" e checkbox de favoritos)

### Dependências

Tarefa 1 (CSS do botão).

### Critério de conclusão

- `filterState` existe e é atualizado ao aplicar filtros
- Botão "Limpar Filtros" aparece abaixo do "Aplicar Filtros" quando `hasActiveFilter()` retorna true
- Clicar "Limpar Filtros" zera campos do DOM e `filterState`, re-renderiza feed completo
- `hasActiveFilter()` retorna true se qualquer campo de `filterState` não é vazio/false

### Teste manual

1. Abrir painel de filtros, preencher tipo = "Devocional", clicar Aplicar → botão "Limpar Filtros" aparece
2. Clicar "Limpar Filtros" → feed volta completo, botão some, campos zerados

### Observações

O checkbox "Apenas favoritos" já será inserido no HTML nesta tarefa (dentro do painel), mas sua lógica de filtro vai na Tarefa 4.

---

## Tarefa 3 — Registros: toggle favorito (Firestore + card + leitura + long-press)

Status: Pendente

### Objetivo

Implementar a função `toggleFavorito`, adicionar estrela nos cards via long-press e botão de estrela na overlay de leitura.

### Arquivos afetados

- `modules/registros.js`

### Dependências

Tarefa 1 (CSS), Tarefa 2 (filterState para atualização parcial do card).

### Critério de conclusão

- `toggleFavorito(id)` atualiza `{ favorito: !current }` no Firestore e no objeto local em `allRecords`
- Long-press (≥ 500 ms, movimento < 8 px) num card dispara `toggleFavorito`
- Estrela no card atualiza imediatamente (sem re-render do feed)
- Botão de estrela aparece na barra de ações da reading overlay
- Toque no botão de estrela chama `toggleFavorito` e atualiza ícone na leitura
- Vibração curta `navigator.vibrate?.(30)` ao alternar

### Teste manual

1. Segurar um card por 500 ms → estrela aparece no card, Firestore atualizado
2. Abrir a leitura do mesmo item → estrela no botão está preenchida
3. Tocar na estrela da leitura → desfavorita, card perde a estrela
4. Recarregar página → estrela persiste conforme Firestore

### Observações

Long-press usa `pointerdown` + `setTimeout(500)` + cancelamento em `pointerup`/`pointermove` (com threshold de 8 px). Adicionar `addEventListener` diretamente no feed usando delegação de eventos (um listener no `#devotionalsFeed`) para não precisar re-bind após `renderFeed`.

---

## Tarefa 4 — Registros: filtro "Apenas favoritos"

Status: Pendente

### Objetivo

Incluir o campo `favorites` do `filterState` na lógica de filtragem, conectando o checkbox "Apenas favoritos" ao `applyFilterToArray`.

### Arquivos afetados

- `modules/registros.js`

### Dependências

Tarefa 2 (filterState), Tarefa 3 (campo `favorito` nos objetos locais).

### Critério de conclusão

- Checkbox "Apenas favoritos" no painel de filtros funciona corretamente
- Ao aplicar com "Apenas favoritos" marcado, só aparecem cards com `favorito === true`
- Filtro combina com os demais (tipo, keyword, datas, autor)
- `filterState.favorites` é persistido e respeitado no "Limpar Filtros"

### Teste manual

1. Favoritar 2 registros
2. Abrir filtros → marcar "Apenas favoritos" → Aplicar → somente os 2 aparecem
3. Desfavoritar um enquanto o filtro está ativo → card some imediatamente
4. Limpar filtros → feed completo volta

### Observações

`applyFilterToArray` deve ser uma função extraída (em vez do bloco inline existente no `btnApplyFilters.onclick`) para poder ser reutilizada no getShufflePool (Tarefa 5).

---

## Tarefa 5 — Registros: sorteio respeitando filtros

Status: Pendente

### Objetivo

Ajustar `btnRandom` e `readingShuffleBtn` para respeitar os filtros ativos via `getShufflePool`.

### Arquivos afetados

- `modules/registros.js`

### Dependências

Tarefa 4 (filterState + applyFilterToArray completo).

### Critério de conclusão

- `getShufflePool(excludeId?)` aplica `filterState` sobre `allRecords` e exclui ID informado
- Quando filtros ativos, `btnRandom` sorteia da pool filtrada (aleatório simples)
- Quando sem filtros, `btnRandom` mantém lógica de randomSeed do Firestore
- `readingShuffleBtn` usa `getShufflePool(r.id)` em vez de `allRecords.filter`
- Pool vazia → alerta "Nenhum item disponível com os filtros atuais."

### Teste manual

1. Favoritar 3 registros, ativar "Apenas favoritos", sortear → apenas favoritos aparecem
2. Sem filtros, sortear → comportamento original (randomSeed)
3. Dentro da leitura com filtro de favoritos → Aleatório respeita filtro

### Observações

A lógica de randomSeed do Firestore só faz sentido sem filtros, pois índices compostos seriam necessários para combinar `randomSeed` + `favorito`. Com filtros, usar pool local é correto e suficiente.

---

## Tarefa 6 — Bênçãos: paridade completa

Status: Pendente

### Objetivo

Aplicar todas as mudanças das Tarefas 2–5 no módulo `bencaos.js`, adaptando IDs e nomes de variáveis.

### Arquivos afetados

- `modules/bencaos.js`

### Dependências

Tarefa 5 (todas as tarefas anteriores concluídas em registros).

### Critério de conclusão

- `toggleFavoritoBlessing(id)` funciona (coleção `blessings`)
- Long-press em cards de bênçãos alterna favorito
- Estrela aparece nos cards de bênçãos favoritas
- Botão de estrela na reading overlay de bênçãos funciona
- Filtro "Apenas favoritas" no painel de bênçãos funciona
- Botão "Limpar Filtros" funciona no painel de bênçãos
- Sorteio de bênçãos respeita filtros ativos (incluindo favoritas)
- `readingShuffleBencaos` usa pool filtrada

### Teste manual

Repetir os mesmos testes manuais das Tarefas 3, 4 e 5, mas no módulo Bênçãos.

### Observações

A estrutura de bencaos.js é mais simples (sem randomSeed). O sorteio de bênçãos já usa `allBlessings` diretamente, portanto a mudança para pool filtrada é mais simples.

---

## Tarefa 7 — Bump de versão

Status: Pendente

### Objetivo

Incrementar versões do cache do Service Worker e dos query strings dos arquivos JS/CSS para garantir que os usuários recebam a versão atualizada.

### Arquivos afetados

- `sw.js` (CACHE_NAME)
- `index.html` (`style.css?v=`, `script.js?v=`)
- `modules/registros.js` (import dos módulos `?v=` interno, se houver)
- `modules/bencaos.js` (idem)

### Dependências

Tarefa 6 (todas as implementações concluídas).

### Critério de conclusão

- `CACHE_NAME` incrementado para `selah-pwa-spa-v37`
- Versões de CSS e JS incrementadas de forma consistente

### Teste manual

Abrir o app após limpar Service Worker → novos assets são carregados.

### Observações

Nenhum.
