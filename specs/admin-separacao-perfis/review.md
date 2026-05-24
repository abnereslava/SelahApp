# Revisao: Separacao de Perfis e Ajustes do Hub Admin

## 1. Status geral

Em andamento

## 2. Resumo da implementacao

Foi implementada a Tarefa 1, separando o destino inicial por perfil no fluxo client-side:

* `script.js` agora reconhece `role=admin` em `whitelisted_emails` e redireciona administradores para `admin.html`.
* `script.js` trata documentos antigos sem `role` como `user`.
* `script.js` deixou de usar a excecao funcional de `?mode=app` para manter administradores no app comum.
* `admin.js` agora libera acesso ao Hub Admin para o master e para e-mails com documento `role=admin`.
* `admin.js` continua bloqueando usuarios comuns e usuarios sem permissao ao acessar `admin.html`.
* `admin.html` nao exibe mais o link "Voltar ao App".
* `script.js` nao cria mais o botao dinamico "Painel Admin".
* Foi registrada uma nova tarefa estrutural para preparar `whitelisted_emails` com ID deterministico por e-mail, necessaria para regras Firebase seguras com admins convidados.
* `admin.js` passou a gravar novos convites em `whitelisted_emails/{emailNormalizado}` usando `setDoc`.
* `admin.js` verifica duplicidade por documento deterministico, por consulta legada no campo `email` e pela lista carregada em memoria.
* `admin.html` passou a ter controle de tipo de perfil no convite: usuario ou admin.
* `admin.js` passou a salvar `role=user` ou `role=admin` nos novos convites.
* A listagem desktop/mobile passa a exibir badge de Admin quando o documento tem `role=admin`; documentos sem `role` continuam como convidados comuns.
* `admin.html` passou a ter filtro por perfil na area da lista: todos, admins e usuarios.
* `admin.js` passou a combinar busca por e-mail e filtro de perfil em memoria.
* O master virtual aparece nos filtros "Todos" e "Admins", mas fica oculto no filtro "Usuarios".
* A lista desktop/mobile passou a exibir resumo de permissoes como "Padrao" ou "Customizadas" em vez dos chips de todas as abas.
* Cada convidado passou a exibir um botao "Configurar" para abrir a configuracao dedicada.
* `admin.html` passou a ter modal dedicado para configuracao de permissoes por conta.
* `admin.js` passou a abrir o modal pelo botao "Configurar", preencher as permissoes atuais e salvar alteracoes em `features`.
* Ao salvar permissoes de usuario comum, a lista e recalculada em memoria e o status volta como "Padrao" ou "Customizadas" conforme as features.
* Para perfis admin, o modal informa que permissoes de abas nao se aplicam enquanto o admin estiver isolado no Hub Admin.

## 3. Criterios de aceite

* [ ] Em desktop, o Hub Admin usa melhor a largura disponivel sem parecer limitado a uma coluna estreita.
* [x] O botao "Voltar ao App" e removido do Hub Admin.
* [x] O botao "Painel Admin" deixa de ser criado/exibido na area comum.
* [x] Administradores autenticados sao direcionados ao Hub Admin e nao conseguem permanecer na area comum via `?mode=app`.
* [x] Usuarios comuns autenticados sao direcionados ao app comum e nao conseguem abrir o Hub Admin por URL direta.
* [x] Novos convites passam a usar ID de documento igual ao e-mail normalizado.
* [x] O formulario do Hub Admin permite escolher entre convite de usuario comum e administrador.
* [x] A lista de e-mails possui filtro por tipo de perfil.
* [x] A lista mostra status resumido de permissao como "Padrao" ou "Customizadas".
* [x] As permissoes deixam de floodar a tabela/lista principal.
* [x] Existe botao/acao para abrir a configuracao de permissoes de uma conta.
* [x] Alterar permissoes atualiza o status exibido na lista.
* [x] Documentos antigos sem `role` continuam funcionando como usuarios comuns.

## 4. Tarefas concluidas

* [x] Tarefa 1 - Separar destino de login por perfil.
* [x] Tarefa 2 - Remover botoes de transicao entre areas.
* [x] Tarefa 3 - Preparar whitelist para IDs por e-mail.
* [x] Tarefa 4 - Permitir convite por tipo de perfil.
* [x] Tarefa 5 - Adicionar filtro por tipo de perfil.
* [x] Tarefa 6 - Resumir permissoes na lista.
* [x] Tarefa 7 - Criar area de configuracao de permissoes.

## 5. Testes realizados

* `Get-Content -Raw -Path script.js | node --input-type=module --check`
* `Get-Content -Raw -Path admin.js | node --input-type=module --check`
* `rg` para confirmar ausencia de `modeApp`, `const urlParams` e blocos mortos `if (false)`.
* `rg` para confirmar ausencia de `Voltar ao App`, `btnGoToAdmin`, `index.html?mode=app`, `modeApp` e blocos mortos `if (false)`.
* `Get-Content -Raw -Path admin.js | node --input-type=module --check`
* `rg` para confirmar uso de `setDoc`/`getDoc` e ausencia de `addDoc` em `admin.js`.
* `Select-String` para confirmar presenca de `inviteRole`, `role=user/admin`, `role: role` e badges por tipo.
* `Select-String` para confirmar presenca de `profileFilter`, `applyInvitedFilters` e `getProfileRole`.
* `Select-String` para confirmar presenca de `renderPermissionSummary`, `Padrao`, `Customizadas` e `Configurar`.
* `Select-String` para confirmar presenca de `permissionConfigModal`, `savePermissionConfig`, `Configurar Permissoes` e mensagem de sucesso.

## 6. Problemas encontrados

* Nao foi possivel validar login real contra Firebase nesta etapa sem executar o app em navegador autenticado.
* As regras do Firestore precisam ser atualizadas antes de liberar administradores convidados com poderes reais de gestao. A documentacao antiga em `specs/admin-hub/plan.md` restringe escrita em `whitelisted_emails` ao e-mail master, o que bloquearia admins convidados.

## 7. Alteracoes fora do escopo

Nenhuma alteracao fora do escopo das Tarefas 1, 2, 3, 4, 5, 6 e 7 foi implementada.

## 8. Pendencias

* Tarefa 8: melhorar uso de espaco no desktop.
* Tarefa 9: atualizar documentacao final.

## 9. Recomendacoes

Antes de liberar administradores convidados em producao, revisar as regras de seguranca do Firestore para refletir o novo `role=admin`.

## 10. Conclusao

As Tarefas 1, 2, 3, 4, 5, 6 e 7 podem ser consideradas implementadas no front-end. A funcionalidade completa permanece em andamento, com a Tarefa 8 como proxima etapa.
