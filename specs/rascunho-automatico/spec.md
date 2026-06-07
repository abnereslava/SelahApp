# Especificação: Rascunho Automático e Recuperação de Registro

## 1. Objetivo

Garantir que um registro em andamento (Registro de Leitura ou Bênção) não seja
perdido caso o aplicativo seja fechado inesperadamente (aba encerrada, recarregamento,
queda do navegador, swipe-away no mobile). O conteúdo deve ser salvo automaticamente
enquanto o usuário escreve e, na próxima abertura do app, o mesmo registro deve ser
recuperado e reaberto automaticamente para que o usuário continue de onde parou.

## 2. Contexto

Hoje o app já salva parcialmente um rascunho do corpo do editor (Quill) em
`localStorage`:

- `selah_draft_livre` (Registros, formato livre) — `modules/registros.js`
- `selah_draft_bencaos` (Bênçãos) — `modules/bencaos.js`

Limitações atuais:

- Salva **apenas** o HTML do editor de texto livre; não salva título, data, capítulo,
  tipo de registro, autores, palavras-chave, passagens relacionadas, perguntas
  orientadas, ações/links.
- Não há recuperação automática: o rascunho do editor só reaparece quando o usuário
  abre manualmente o overlay de criação.
- As chaves não são separadas por usuário (uid), podendo misturar rascunhos entre
  contas no mesmo dispositivo.

Esta funcionalidade amplia o comportamento existente para cobrir o registro completo
e adicionar a reabertura automática.

## 3. Usuários envolvidos

- Usuário autenticado (perfil `user` ou `admin`) que cria Registros e/ou Bênçãos.

## 4. Funcionamento esperado

1. Enquanto o usuário preenche um **novo** registro (overlay de criação aberto), o
   conteúdo de todos os campos é salvo automaticamente no `localStorage`, de forma
   contínua (debounce) e também nos momentos críticos: ao app ir para segundo plano
   (`visibilitychange` → hidden) e ao descarregar a página (`pagehide`).
2. Se o app for fechado inesperadamente, o rascunho permanece salvo.
3. Na próxima abertura do app (após login), se houver um rascunho com conteúdo
   relevante, o overlay de criação correspondente é **reaberto automaticamente** com
   todos os campos preenchidos, permitindo continuar a edição.
4. Ao salvar o registro com sucesso, o rascunho é descartado.
5. Ao cancelar/fechar o registro intencionalmente, o rascunho é descartado
   (ver [Pendente] em Dúvidas).

## 5. Fluxo principal

1. Usuário toca no FAB → escolhe "Registro" (ou "Bênção") → overlay de criação abre.
2. Usuário digita título, seleciona capítulo, escreve no editor, etc.
3. A cada alteração (com debounce ~800ms) o rascunho completo é persistido.
4. O app é encerrado inesperadamente.
5. Usuário reabre o app e faz login.
6. O sistema detecta o rascunho, reabre o overlay com os dados restaurados e exibe
   um aviso discreto ("Rascunho recuperado").
7. Usuário conclui e salva → rascunho é apagado.

## 6. Regras de negócio

- A recuperação automática vale **somente para registros novos** (sem `editId`).
  Edições de registros já existentes **não** são auto-salvas/recuperadas, para evitar
  conflito com a versão já persistida na nuvem. [Sugestão]
- O rascunho só é considerado "com conteúdo relevante" (e portanto recuperável) se
  pelo menos um campo significativo estiver preenchido: título, capítulo, corpo do
  editor não vazio, ou alguma pergunta orientada respondida. [Inferência]
- Existe no máximo **um** rascunho por módulo (Registros / Bênçãos) por usuário.
- Se houver rascunhos de ambos os módulos, a reabertura automática prioriza o mais
  recente (por timestamp). [Sugestão]
- Os dados do rascunho são separados por `uid` do usuário autenticado.

## 7. Permissões

- Cada usuário só acessa o próprio rascunho (escopo por `uid` + armazenamento local
  no dispositivo). Não há compartilhamento nem gravação na nuvem; tudo permanece em
  `localStorage` do navegador. [Inferência]

## 8. Dados necessários

Estrutura proposta do rascunho (por módulo), serializada em JSON no `localStorage`:

Chave: `selah_draft_v2_registros_<uid>` e `selah_draft_v2_bencaos_<uid>`

Conteúdo (Registros):
- `savedAt` (ISO timestamp)
- `title`
- `date`
- `continuationOf` / `continuationSearch`
- `mainPassage`
- `recordType`
- `author` (array)
- `relatedPassages`
- `keywords` (array)
- `recordFormat` ("livre" | "orientado")
- `content` (`{ texto }` ou `{ questions: [{q,a}] }`)
- `actions` (array)
- `links` (array)

Conteúdo (Bênçãos):
- `savedAt`, `title`, `date`, `tags` (array), `description` (HTML do editor)

## 9. Estados e mensagens

- **Salvando rascunho**: silencioso (sem indicador visual intrusivo). [Sugestão]
- **Rascunho recuperado**: aviso discreto/toast "Rascunho recuperado" ao reabrir.
  [Sugestão]
- **Sem rascunho**: comportamento normal, nada acontece.

## 10. Casos extremos

- `localStorage` cheio ou indisponível (modo privado): salvar deve falhar
  silenciosamente, sem quebrar o app.
- Rascunho de uma versão antiga/estrutura incompatível: deve ser ignorado/descartado
  sem erro.
- Usuário troca de conta no mesmo dispositivo: cada conta vê apenas o próprio rascunho.
- Funcionalidade desabilitada para o usuário (ex.: não tem `registros`): não recuperar
  rascunho daquele módulo.
- Migração: rascunhos antigos (`selah_draft_livre` / `selah_draft_bencaos`) — ver
  [Pendente].

## 11. Critérios de aceite

- [ ] Ao preencher um novo registro e encerrar a aba abruptamente, ao reabrir o app o
      overlay reabre com todos os campos restaurados.
- [ ] O mesmo vale para Bênçãos.
- [ ] Salvar com sucesso apaga o rascunho (não reaparece na próxima abertura).
- [ ] Edição de registro existente não dispara auto-save nem recuperação.
- [ ] Rascunho vazio/sem conteúdo relevante não dispara reabertura automática.
- [ ] Rascunhos são isolados por usuário.
- [ ] Falha de `localStorage` não quebra o fluxo de criação.

## 12. Decisões (confirmadas pelo usuário)

- **Fechar intencionalmente descarta o rascunho.** Ao tocar em "Voltar"/X ou
  "Cancelar Edição", o rascunho é apagado (assume-se abandono). A recuperação só
  ocorre quando o fechamento for inesperado (aba encerrada, recarregamento, crash,
  swipe-away).
- **Aplica-se a Registros e Bênçãos.**
- **Recuperação: reabrir automaticamente + toast discreto** "Rascunho recuperado"
  (sem diálogo de confirmação).
- **Apenas registros novos.** Edição de registros existentes não dispara auto-save
  nem recuperação.
- Os rascunhos antigos (`selah_draft_livre`/`selah_draft_bencaos`) serão
  descontinuados; passa-se a usar o formato estruturado novo.
