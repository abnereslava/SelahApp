# Tarefas: Rascunho Automático e Recuperação de Registro

## Visão geral

Implementação em 7 tarefas, seguindo a ordem do plan.md: primeiro a infraestrutura
compartilhada (util de rascunho, toast, coordenador), depois a fiação em cada módulo
(registros e bênçãos) e, por fim, atualização de cache e revisão.

## Tarefa 1 — Infra de rascunho e toast (script.js + style.css)

Status: Concluída

### Objetivo
Criar `window.SelahDraft` (save/load/clear com escopo por uid e JSON seguro) e
`window.showToast(msg)` com estilo `.selah-toast`.

### Arquivos afetados
- `script.js`, `style.css`

### Critério de conclusão
`window.SelahDraft` e `window.showToast` disponíveis globalmente; toast aparece e
some sozinho.

### Teste manual
No console: `window.SelahDraft.save('registros',{hasContent:true,title:'x'})` e
`window.SelahDraft.load('registros')` retornam o objeto. `window.showToast('oi')`
mostra o aviso.

## Tarefa 2 — Coordenador de recuperação + flush global (script.js)

Status: Concluída

### Objetivo
Após login, escolher módulo com rascunho mais recente (com `hasContent` e na
whitelist) e direcionar a rota; adicionar listeners globais
`visibilitychange`/`pagehide` que chamam `window._flushDraft?.()`.

### Arquivos afetados
- `script.js`

### Critério de conclusão
`window._restorePendingModule` definido corretamente no login; flush disparado ao
ocultar a página.

### Teste manual
Com um rascunho salvo manualmente, recarregar → rota vai para o módulo do rascunho.

## Tarefa 3 — Auto-save e limpeza em registros.js

Status: Concluída

### Objetivo
`collectDraft`, `saveDraftDebounced`, listeners (form input/change + Quill
text-change dos editores livre e orientados), flush, e limpeza em submit OK / fechar
/ cancelar. Remover `selah_draft_livre`.

### Arquivos afetados
- `modules/registros.js`

### Critério de conclusão
Editar campos salva rascunho; salvar/fechar/cancelar limpa.

### Teste manual
Preencher e inspecionar `localStorage`; salvar/fechar e confirmar remoção.

## Tarefa 4 — Recuperação automática em registros.js

Status: Concluída

### Objetivo
No fim do `init`, se `window._restorePendingModule === 'registros'`, aplicar o
rascunho (`applyDraft`), abrir overlay e mostrar toast.

### Arquivos afetados
- `modules/registros.js`

### Critério de conclusão
Após fechar a aba com rascunho, reabrir restaura o overlay com os campos.

### Teste manual
Fluxo 1 da estratégia de teste do plan.md.

## Tarefa 5 — Auto-save e limpeza em bencaos.js

Status: Concluída

### Objetivo
Equivalente à Tarefa 3 para bênçãos (title, date, tags, description). Remover
`selah_draft_bencaos`.

### Arquivos afetados
- `modules/bencaos.js`

### Critério de conclusão
Igual à Tarefa 3, para bênçãos.

### Teste manual
Fluxo 4 (1–3) da estratégia de teste.

## Tarefa 6 — Recuperação automática em bencaos.js

Status: Concluída

### Objetivo
Equivalente à Tarefa 4 para bênçãos.

### Arquivos afetados
- `modules/bencaos.js`

### Critério de conclusão
Reabrir com rascunho de bênção restaura o overlay.

### Teste manual
Fluxo 4 da estratégia de teste.

## Tarefa 7 — Bump de cache e revisão

Status: Concluída

### Objetivo
Atualizar `CACHE_NAME` em `sw.js` e escrever `review.md`.

### Arquivos afetados
- `sw.js`, `specs/rascunho-automatico/review.md`

### Critério de conclusão
SW versão nova; review.md comparando implementação x spec.

### Teste manual
Hard refresh aplica novo SW; revisão registrada.
