# Plano Técnico: Layout Desktop Otimizado

## 1. Resumo da solução

Decisões tomadas para as dúvidas pendentes do spec.md:
- **Bottom-bar no desktop**: vira barra de ações no **topo** do dialog (mais convencional para diálogos de leitura, mais simples de implementar via `order: -1` CSS).
- **Animação de fechamento**: sim — `scale(1) opacity(1)` → `scale(0.96) opacity(0)`, 150ms.
- **Quill no desktop**: ocultar a floating toolbar mobile; usar a toolbar nativa snow do Quill, já disponível mas oculta por CSS.

### Abordagem técnica

Introduzir um `<div class="overlay-dialog">` como wrapper intermediário dentro de cada overlay existente. No desktop (≥769px):
- O overlay externo (`.reading-overlay`, `.create-overlay`) vira o backdrop: `position:fixed; inset:0; background:rgba(0,0,0,0.65); display:flex; align-items:center; justify-content:center`.
- O `.overlay-dialog` interno é a janela centrada com `border-radius:16px`, dimensões fixas por tipo, `max-height:90vh`, scroll interno, `box-shadow` premium.
- Clicar no backdrop (o overlay externo fora do `.overlay-dialog`) fecha com a lógica existente de confirmação.
- CSS `order:-1` no `.reading-bottom-bar` dentro do dialog move a barra de ações para o topo.

Para o **create overlay**, a transição mobile (slide-up `translateY`) é substituída no desktop por `opacity + visibility`.

## 2. Dependências

- CSS: `@media (min-width: 769px)` — sem novas bibliotecas.
- JS: handlers existentes de `_overlayCloseStack`, `_requestCloseRegistros`, `_requestCloseBencaos`.
- Quill snow toolbar: já existe no HTML mas oculta por `.ql-toolbar { display:none }`.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `style.css` | Adicionar estilos `.overlay-dialog`, backdrop, animações e Quill desktop |
| `modules/registros.js` | Adicionar `<div class="overlay-dialog">` em 4 overlays + backdrop click handlers |
| `modules/bencaos.js` | Adicionar `<div class="overlay-dialog">` em 3 overlays + backdrop click handlers |
| `index.html` | Adicionar HTML do dropdown do desktop-fab |
| `script.js` | Lógica do dropdown desktop-fab (abrir/fechar) |
| `sw.js` | Bump de versão do cache |

## 4. Estrutura de dados

Sem alterações no Firestore. Apenas mudanças de apresentação.

## 5. Regras de segurança e permissões

Sem impacto.

## 6. Fluxos técnicos

### Create overlay desktop
1. Usuário clica no desktop-fab → dropdown aparece → clica em "Novo Registro"
2. `.create-overlay` passa de `opacity:0; pointer-events:none` para `opacity:1; pointer-events:auto`
3. `.overlay-dialog` anima entrada (dialogIn)
4. Clicar fora do dialog → chama `window._requestCloseRegistros()` (com confirmação de rascunho)
5. Fechar → `opacity:0` no backdrop, sem `.open`

### Reading overlay desktop
1. Usuário clica em um card → reading overlay criado dinamicamente
2. O `.reading-overlay` é backdrop, `.overlay-dialog` anima entrada
3. `.reading-bottom-bar` (ações) aparece no topo via `order:-1`
4. Clicar fora do `.overlay-dialog` → chama `close()`
5. Fechar → `.closing` no overlay → `.overlay-dialog` anima saída → removido do DOM

### Analytics / Passage picker
- Mesma lógica: backdrop + dialog + backdrop click fecha

## 7. Impactos no sistema existente

- Mobile: zero impacto — todas as mudanças são dentro de `@media (min-width: 769px)`.
- Auto-save e draft recovery: sem impacto — a lógica de `SelahDraft` não muda.
- `_overlayCloseStack`: continua funcionando — os handlers `close` são os mesmos.
- Quill: a `.ql-toolbar.ql-snow` (nativa) é exibida no desktop; a floating toolbar mobile é oculta.

## 8. Riscos técnicos

- **Quill dentro do dialog**: o container do Quill tem `height` fixo; dentro do `.overlay-dialog` com `max-height:90vh`, o scroll interno deve funcionar. Risco baixo.
- **Chart.js no dialog**: os gráficos são `responsive:true`, então devem se adaptar à largura do `.overlay-dialog`. Risco baixo.
- **Backdrop click vs. clique no conteúdo**: o handler de backdrop click verifica `e.target === overlay` para evitar fechar ao clicar dentro do dialog.

## 9. Estratégia de teste

- Abrir/fechar cada overlay no desktop (≥1024px): criar registro, ler registro, analytics, passage picker.
- Verificar que mobile (simulado em 375px) está idêntico ao anterior.
- Verificar backdrop click + confirmação de rascunho.
- Verificar Escape fecha o overlay ativo.
- Verificar FAB dropdown no desktop.

## 10. Ordem recomendada de implementação

1. CSS: `.overlay-dialog` base + animações + backdrop + Quill desktop
2. `registros.js`: adicionar wrappers `.overlay-dialog` nos 4 overlays + backdrop handlers
3. `bencaos.js`: adicionar wrappers `.overlay-dialog` nos 3 overlays + backdrop handlers
4. `index.html` + `script.js`: dropdown desktop-fab
5. `sw.js`: bump de versão
