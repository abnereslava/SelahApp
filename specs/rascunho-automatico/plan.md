# Plano Técnico: Rascunho Automático e Recuperação de Registro

## 1. Resumo da solução

Criar um utilitário global de rascunho (`window.SelahDraft`) em `script.js` que
persiste/lê/limpa rascunhos em `localStorage`, com chave isolada por `uid` e por
módulo, guardando um timestamp (`savedAt`) e um marcador `hasContent`.

Cada módulo (registros, bencaos) passa a:
- coletar o estado completo do formulário (`collectDraft`),
- salvar de forma contínua com debounce (~800ms) enquanto o overlay de **criação**
  estiver aberto e **não** for edição,
- aplicar um rascunho recuperado ao formulário (`applyDraft`),
- limpar o rascunho ao salvar com sucesso e ao fechar/cancelar intencionalmente.

Em `script.js`, após o login, um coordenador decide qual módulo possui o rascunho
mais recente com conteúdo e, se houver, direciona a rota inicial para esse módulo;
o módulo, ao inicializar, restaura o rascunho, reabre o overlay e mostra um toast.

Salvamentos críticos são garantidos por listeners globais de `visibilitychange`
(→ hidden) e `pagehide`, que disparam um "flush" no módulo ativo.

## 2. Dependências

- `localStorage` (já usado no projeto).
- `auth.currentUser.uid` (Firebase Auth) para escopo por usuário.
- Quill (eventos `text-change`) já presente.
- Infra de overlay/`_overlayCloseStack` existente.

## 3. Arquivos afetados

- `script.js`
  - Novo `window.SelahDraft` (get/set/remove + uid scoping + JSON seguro).
  - Novo `window.showToast(msg)` (toast leve).
  - Coordenador de recuperação na rota inicial pós-login.
  - Listeners globais `visibilitychange`/`pagehide` → flush do módulo ativo
    (guardados por flag para não duplicar).
- `style.css`
  - Estilos do toast (`.selah-toast`).
- `modules/registros.js`
  - `collectDraft`, `applyDraft`, `saveDraftDebounced`, fiação de listeners,
    restauração ao fim do `init`, limpeza nos pontos de saída/sucesso.
  - Remoção do uso de `selah_draft_livre`.
- `modules/bencaos.js`
  - Equivalente ao de registros.
  - Remoção do uso de `selah_draft_bencaos`.
- `sw.js`
  - Bump de versão de cache.
- `specs/rascunho-automatico/review.md`
  - Revisão final.

## 4. Estrutura de dados

`localStorage`:
- `selah_draft_v2_registros_<uid>`
- `selah_draft_v2_bencaos_<uid>`

Valor (JSON), Registros:
```
{
  savedAt: ISOString,
  hasContent: boolean,
  title, date, continuationOf, continuationSearch, mainPassage, recordType,
  author: [...], relatedPassages, keywords: [...],
  recordFormat: "livre"|"orientado",
  content: { texto } | { questions: [{q,a}] },
  actions: [...], links: [...]
}
```
Valor (JSON), Bênçãos:
```
{ savedAt, hasContent, title, date, tags: [...], description }
```

## 5. Regras de segurança e permissões

- Escopo por `uid`: cada usuário só lê/escreve o próprio rascunho.
- Nada é enviado à nuvem; permanece local ao dispositivo.
- Restauração só para módulos presentes em `currentUserFeatures`.
- Falhas de `localStorage` (cota/modo privado) são engolidas em try/catch.

## 6. Fluxos técnicos

- **Salvar**: input/change no form + `text-change` do Quill → `saveDraftDebounced`
  → monta objeto → `SelahDraft.save(mod, data)`. Guarda: só se overlay aberto e
  `editId` vazio.
- **Flush crítico**: `visibilitychange`(hidden)/`pagehide` em `script.js` chamam
  `window._flushDraft?.()` (setado pelo módulo ativo quando overlay aberto).
- **Recuperar**: pós-login, coordenador escolhe módulo; rota vai para ele; no fim
  do `init`, se `window._restorePendingModule === mod`, aplica e abre + toast.
- **Limpar**: submit OK, fechar (X/voltar), cancelar → `SelahDraft.clear(mod)`.

## 7. Impactos no sistema existente

- Substitui o rascunho parcial atual (`selah_draft_livre`/`selah_draft_bencaos`).
  Comportamento muda: fechar intencionalmente passa a limpar o rascunho (antes o
  texto do editor reaparecia ao reabrir). Alinhado à decisão confirmada.
- `init()` roda a cada navegação para a aba; listeners globais precisam de guarda.

## 8. Riscos técnicos

- Duplicação de listeners globais se não houver flag de guarda → mitigado com
  `window._draftGlobalBound`.
- Restauração indevida em navegação normal → mitigado limpando
  `window._restorePendingModule` após o primeiro uso.
- Overlay reaberto sobre um app recém-carregado pode confundir → mitigado pelo
  toast explicativo e pelo descarte fácil (fechar).
- `applyDraft` precisa respeitar a inicialização assíncrona dos editores Quill e
  do TagManager (que só existem após o primeiro fetch). Restaurar após render/init.

## 9. Estratégia de teste

Testes manuais (mobile e desktop):
1. Novo registro com vários campos → matar a aba → reabrir → overlay restaurado.
2. Salvar com sucesso → reabrir app → sem restauração.
3. Fechar no X/voltar → reabrir app → sem restauração.
4. Bênção idem (1–3).
5. Editar registro existente → matar aba → reabrir → sem restauração de edição.
6. Rascunho vazio → reabrir → sem reabertura automática.
7. Dois rascunhos (registro + bênção) → restaura o mais recente.
8. Modo privado/localStorage indisponível → criação continua funcionando.

## 10. Ordem recomendada de implementação

1. Infra em `script.js` (`SelahDraft`, `showToast`) + CSS do toast.
2. Coordenador de recuperação + flush global em `script.js`.
3. `registros.js`: auto-save + limpeza.
4. `registros.js`: recuperação no `init`.
5. `bencaos.js`: auto-save + limpeza.
6. `bencaos.js`: recuperação no `init`.
7. Bump do `sw.js` + `review.md`.
