# Tarefas: Navegação por Swipe com Animação entre Abas

## Visão geral

Implementar em 5 tarefas sequenciais: primeiro a infra CSS de animação, depois a refatoração do roteador existente, depois o detector de swipe, o skeleton de carregamento e por fim a vibração háptica.

---

## Tarefa 1 — CSS de animação de slide e skeleton loader

Status: Pendente

### Objetivo

Criar todas as classes CSS necessárias para as animações de transição entre abas (slide-in e slide-out), snap-back e skeleton loader. Nenhuma lógica JS nesta tarefa.

### Arquivos afetados

- `style.css` — adicionar bloco de classes de animação ao final do arquivo (dentro de `@media (max-width: 768px)`)

### Dependências

Nenhuma.

### Critério de conclusão

As classes `.slide-exit-left`, `.slide-exit-right`, `.slide-enter-left`, `.slide-enter-right`, `.snap-back` e `.swipe-skeleton` existem no CSS e produzem os efeitos esperados quando aplicadas manualmente via DevTools.

### Teste manual

Abrir o app no browser, abrir DevTools, selecionar o `#mainContent` e aplicar as classes manualmente para verificar os efeitos visuais.

### Observações

- As animações devem usar `transform: translateX()` com `transition` de ~250ms e easing `cubic-bezier(0.4, 0, 0.2, 1)`.
- Snap-back deve ter ~150ms com `cubic-bezier(0.34, 1.56, 0.64, 1)` (leve bounce).
- Skeleton: barras pulsando com `@keyframes skeleton-pulse` (opacity 0.4 → 0.8 → 0.4).
- Aplicar apenas dentro de `@media (max-width: 768px)` para não afetar desktop.

---

## Tarefa 2 — Refatorar handleRouteChange para suportar animação direcional

Status: Pendente

### Objetivo

Modificar a função `handleRouteChange` em `script.js` para aceitar um parâmetro opcional de direção (`'left'` | `'right'` | `null`). Quando a direção for fornecida, aplicar as classes CSS de slide ao container de conteúdo antes e depois de carregar o módulo.

### Arquivos afetados

- `script.js` — modificar `handleRouteChange` e o listener de `hashchange`

### Dependências

Tarefa 1 concluída (classes CSS disponíveis).

### Critério de conclusão

Clicar nos itens da bottom nav (que não são swipe) ainda funciona normalmente. Ao chamar `handleRouteChange` com direção `'left'` programaticamente, o conteúdo atual sai pela esquerda e o novo entra pela direita com animação visível.

### Teste manual

No console do browser, executar `window.location.hash = '#oracoes'` e verificar que a navegação ainda funciona sem animação. Depois chamar internamente com direção para testar a animação.

### Observações

- A navegação por clique na bottom nav e sidebar deve continuar sem animação (direção `null`) ou com direção calculada pela posição do item na lista — decidir na implementação qual é mais natural.
- `isAnimating` deve bloquear novas navegações enquanto a transição está em andamento (~250ms).

---

## Tarefa 3 — Detector de swipe (touch events)

Status: Pendente

### Objetivo

Implementar a lógica de detecção de gesto de swipe horizontal no container de conteúdo principal. O conteúdo deve acompanhar o dedo em tempo real durante o arraste e, ao soltar, decidir se navega ou retorna.

### Arquivos afetados

- `script.js` — adicionar função `initSwipeNavigation()` chamada após autenticação

### Dependências

Tarefa 2 concluída.

### Critério de conclusão

- Arrastar para a esquerda na aba "Registros" navega para a próxima aba com animação.
- Arrastar para a direita na aba "Registros" (primeira aba) não navega e retorna com snap-back.
- Arraste insuficiente (< 30% da largura) retorna com snap-back.
- Scroll vertical dentro da aba não dispara swipe.

### Teste manual

Testar no celular físico ou no DevTools com modo mobile ativado:
1. Swipe esquerda completo → aba muda.
2. Swipe esquerda curto → snap-back.
3. Scroll vertical → sem interferência.
4. Tentar selecionar texto no editor → sem interferência.

### Observações

- Verificar `event.target.closest('.ql-editor, .autocomplete-list')` para ignorar swipe dentro desses elementos.
- Verificar ângulo: `Math.abs(deltaX) < Math.abs(deltaY) * 1.5` → gesto vertical, ignorar.
- Usar `requestAnimationFrame` para aplicar `translateX` durante o `touchmove`.
- `passive: false` no listener de `touchmove` pode ser necessário para iOS.
- Resistência leve nas bordas (primeira/última aba): limitar o translate a `deltaX * 0.3` quando não há aba no sentido do swipe.

---

## Tarefa 4 — Placeholder skeleton durante carregamento de módulo

Status: Pendente

### Objetivo

Exibir o skeleton loader no container destino enquanto o módulo da aba ainda está sendo importado via `import()` dinâmico (primeira visita à aba via swipe).

### Arquivos afetados

- `script.js` — integrar skeleton ao fluxo de carregamento em `handleRouteChange`

### Dependências

Tarefas 1, 2 e 3 concluídas.

### Critério de conclusão

Na primeira vez que uma aba é acessada via swipe, um skeleton de barras pulsando aparece no container destino durante o carregamento do módulo. Nas visitas subsequentes (módulo já em cache), o skeleton não aparece (ou aparece por menos de 100ms e é imperceptível).

### Teste manual

Forçar um delay artificial no carregamento (ou simular conexão lenta no DevTools) e verificar que o skeleton aparece.

### Observações

- Manter um Map/Set de módulos já carregados para evitar mostrar skeleton em revisitas.

---

## Tarefa 5 — Vibração háptica ao confirmar troca de aba

Status: Pendente

### Objetivo

Adicionar `navigator.vibrate(20)` ao momento em que a troca de aba é confirmada (swipe bem-sucedido), com verificação de suporte à API.

### Arquivos afetados

- `script.js` — uma linha na função de confirmação de swipe

### Dependências

Tarefa 3 concluída.

### Critério de conclusão

Em dispositivos Android com Chrome que suportam `navigator.vibrate`, uma vibração curta (20ms) é sentida ao completar o swipe. Em iOS ou browsers sem suporte, nada acontece (sem erro).

### Teste manual

Testar no celular físico Android com Chrome. Em iOS, verificar no console que não há erros.

### Observações

- Sempre verificar `if (navigator.vibrate)` antes de chamar.
- Duração de 20ms é sutil e não intrusiva.
