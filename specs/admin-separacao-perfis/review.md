# Revisao: Separacao de Perfis e Ajustes do Hub Admin

## 1. Status geral

Aprovado com ajustes

## 2. Resumo da implementacao

Foram implementadas as Tarefas 1 a 9 da especificacao:

* `script.js` separa o destino por perfil, redirecionando administradores para `admin.html` e mantendo usuarios comuns no app.
* `admin.js` libera o Hub Admin para master e `role=admin`, preservando documentos antigos sem `role` como usuarios comuns.
* `admin.html` nao exibe "Voltar ao App" e `script.js` nao cria mais "Painel Admin".
* Novos convites em `whitelisted_emails` usam ID deterministico por e-mail normalizado.
* O convite permite escolher `role=user` ou `role=admin`.
* A lista possui busca, filtro por perfil, resumo de permissoes e botao "Configurar".
* O modal de permissoes permite editar `features` de usuarios comuns e informa que permissoes de abas nao se aplicam a admins.
* O layout desktop do Hub Admin foi ampliado para `max-width: 1320px`, com formulario de convite em faixa horizontal acima da lista, tabela em largura total, colunas fixas e protecao contra overflow de e-mails longos.
* `docs/sistema-atual.md` foi atualizado com a separacao entre app comum e Hub Admin.

## 3. Criterios de aceite

* [x] Em desktop, o Hub Admin usa melhor a largura disponivel sem parecer limitado a uma coluna estreita.
* [x] O botao "Voltar ao App" e removido do Hub Admin.
* [x] O botao "Painel Admin" deixa de ser criado/exibido na area comum.
* [x] Administradores autenticados sao direcionados ao Hub Admin e nao conseguem permanecer na area comum via `?mode=app`.
* [x] Usuarios comuns autenticados sao direcionados ao app comum e nao conseguem abrir o Hub Admin por URL direta.
* [x] O formulario do Hub Admin permite escolher entre convite de usuario comum e administrador.
* [x] A lista de e-mails possui filtro por tipo de perfil.
* [x] A lista mostra status resumido de permissao como "Padrao" ou "Customizadas".
* [x] As permissoes deixam de floodar a tabela/lista principal.
* [x] Existe botao/acao para abrir a configuracao de permissoes de uma conta.
* [x] Alterar permissoes atualiza o status exibido na lista.
* [x] Documentos antigos sem `role` continuam funcionando como usuarios comuns.
* [x] Novos convites passam a usar ID de documento igual ao e-mail normalizado.

## 4. Tarefas concluidas

* [x] Tarefa 1 - Separar destino de login por perfil.
* [x] Tarefa 2 - Remover botoes de transicao entre areas.
* [x] Tarefa 3 - Preparar whitelist para IDs por e-mail.
* [x] Tarefa 4 - Permitir convite por tipo de perfil.
* [x] Tarefa 5 - Adicionar filtro por tipo de perfil.
* [x] Tarefa 6 - Resumir permissoes na lista.
* [x] Tarefa 7 - Criar area de configuracao de permissoes.
* [x] Tarefa 8 - Melhorar uso de espaco no desktop.
* [x] Tarefa 9 - Atualizar documentacao e revisar.

## 5. Testes realizados

* `Get-Content -Raw -Path script.js | node --input-type=module --check`
* `Get-Content -Raw -Path admin.js | node --input-type=module --check`
* `rg` para confirmar ausencia de `Voltar ao App`, `btnGoToAdmin`, `index.html?mode=app`, `modeApp` e blocos mortos `if (false)`.
* `Select-String` para confirmar presenca de `inviteRole`, `role=user/admin`, `profileFilter`, `renderPermissionSummary` e `permissionConfigModal`.
* Revisao estatica de `admin.html` para confirmar container desktop ampliado, formulario horizontal acima da lista, fallback abaixo de 1180px e layout mobile abaixo de 768px.
* Revisao de `docs/sistema-atual.md` para confirmar que o comportamento atual nao promete funcionalidade ausente.

## 6. Problemas encontrados

* Nao foi possivel validar login real contra Firebase nesta etapa sem executar o app em navegador autenticado.
* As regras do Firestore precisam ser atualizadas antes de liberar administradores convidados com poderes reais de gestao. A documentacao antiga em `specs/admin-hub/plan.md` restringe escrita em `whitelisted_emails` ao e-mail master, o que bloquearia admins convidados.

## 7. Alteracoes fora do escopo

Nenhuma alteracao fora do escopo das Tarefas 1 a 9 foi implementada.

## 8. Pendencias

* Validar manualmente no navegador autenticado os fluxos de login e bloqueio por perfil.
* Revisar regras de seguranca do Firestore para suportar administradores convidados com `role=admin`.

## 9. Recomendacoes

Antes de liberar administradores convidados em producao, atualizar e testar as regras do Firestore para refletir o novo modelo de permissao administrativa.

## 10. Conclusao

A funcionalidade pode ser considerada implementada no front-end e documentada. O status permanece "Aprovado com ajustes" por depender de validacao manual em navegador autenticado e revisao das regras Firestore fora do escopo desta rodada.
