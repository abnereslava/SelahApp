# Revisão: Rascunho Automático e Recuperação de Registro

## 1. Status geral

Aprovado (implementado conforme spec e plano).

## 2. Resumo da implementação

- `script.js`:
  - `window.SelahDraft` (save/load/clear) com chave por `uid` e por módulo,
    serialização JSON segura e `savedAt`.
  - `window.showToast(msg)` + estilo `.selah-toast` em `style.css`.
  - `pickDraftModuleToRestore()` e direcionamento da rota inicial pós-login.
  - `initDraftFlushHandlers()` com `visibilitychange`(hidden)/`pagehide` chamando
    `window._draftFlushers[*]` (um flush por módulo, guarda contra duplicação).
- `modules/registros.js`:
  - `collectDraft` / `applyDraft` / `saveDraftNow` / `saveDraftDebounced` (800ms).
  - Listeners de `input`/`change` no form + `text-change` do editor livre.
  - Restauração ao fim do `init` (após `fetchAll`), só se o módulo foi escolhido.
  - Limpeza do rascunho em `closeCreateRegistrosOverlay` (cobre X, voltar,
    cancelar e salvar).
  - Removido `selah_draft_livre`.
- `modules/bencaos.js`: equivalente, campos (title, date, tags, description).
  Removido `selah_draft_bencaos`.
- `sw.js`: cache `v18`.

## 3. Critérios de aceite

- [x] Encerrar a aba com novo registro preenchido e reabrir restaura o overlay.
- [x] Idem para Bênçãos.
- [x] Salvar com sucesso apaga o rascunho (limpeza em close, chamada no submit OK).
- [x] Edição de registro existente não dispara auto-save nem recuperação
      (guarda `editId`).
- [x] Rascunho sem conteúdo relevante não dispara reabertura (`hasContent`).
- [x] Rascunhos isolados por usuário (chave com `uid`).
- [x] Falha de `localStorage` não quebra o fluxo (try/catch em SelahDraft).

## 4. Tarefas concluídas

Tarefas 1 a 7 (ver tasks.md) — todas concluídas.

## 5. Testes realizados

- Verificação de sintaxe (`node --check`) nos três arquivos JS: OK.
- Verificação de ausência das chaves antigas (`selah_draft_livre`/`_bencaos`): OK.
- Verificação de declaração única dos helpers por módulo: OK.
- Testes manuais de comportamento no dispositivo: pendente de validação do usuário
  (fluxos 1–8 do plan.md).

## 6. Problemas encontrados

- Risco conhecido: navegar para outra aba pela bottom nav com o overlay de criação
  aberto destrói o overlay sem chamar `close`, então o rascunho persiste e será
  recuperado na próxima abertura. Considerado comportamento aceitável (mais seguro).

## 7. Alterações fora do escopo

- Nenhuma além das previstas. O toast (`showToast`) é infraestrutura nova prevista
  no plano e pode ser reutilizado por outras funcionalidades.

## 8. Pendências

- Validação manual final pelo usuário nos cenários reais (mobile, fechamento
  abrupto).

## 9. Recomendações

- Caso se deseje, futuramente, distinguir "fechar para abandonar" de "minimizar",
  poderia haver um botão explícito "Descartar rascunho". Não solicitado.

## 10. Conclusão

Funcionalidade pronta para uso, sujeita à validação manual nos cenários reais.

## 11. Addendum (ajustes pós-feedback)

- **Confirmação ao fechar/cancelar**: fechar o overlay de criação (X, "Cancelar
  Edição" ou botão Voltar do sistema) passa a pedir confirmação
  ("Descartar este registro?") quando há conteúdo não salvo. Isso evita perda
  acidental por gesto de voltar/recolher no mobile. Só descarta após confirmação.
- **Scroll da tela principal**: removido `overscroll-behavior-y: contain` de
  `html, body` (estava bloqueando o scroll da visualização principal em alguns
  dispositivos). A contenção permanece nos containers de scroll dos overlays
  (`.create-overlay-scroll`, `.reading-scroll`). A proteção contra perda de dados
  por recarregamento continua garantida pelo auto-save (flush em
  `pagehide`/`visibilitychange`) + recuperação na próxima abertura.
