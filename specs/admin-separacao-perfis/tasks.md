# Tarefas: Separacao de Perfis e Ajustes do Hub Admin

## Visao geral

A implementacao deve ser feita em etapas pequenas: primeiro separar os fluxos de login por perfil, depois remover a navegacao cruzada, preparar a whitelist para regras seguras por e-mail, em seguida evoluir o modelo de convite para tipos de perfil, reorganizar lista/permissoes e por fim atualizar documentacao.

## Tarefa 1 - Separar destino de login por perfil

Status: Concluida

### Objetivo

Garantir que administradores sejam enviados ao Hub Admin e usuarios comuns ao app, sem uso de `?mode=app`.

### Arquivos afetados

* `script.js`
* `admin.js`

### Dependencias

Nenhuma.

### Criterio de conclusao

* Master acessa `admin.html` automaticamente.
* Documento com `role=admin` acessa `admin.html`.
* Documento com `role=user` ou sem `role` acessa o app comum.
* `index.html?mode=app` nao mantem admin na area comum.

### Teste manual

Logar como master, usuario comum e um e-mail com `role=admin`, verificando o redirecionamento de cada perfil.

### Observacoes

Preservar fallback para documentos antigos sem `role`.

## Tarefa 2 - Remover botoes de transicao entre areas

Status: Concluida

### Objetivo

Remover o botao "Voltar ao App" do Hub Admin e impedir que o app comum injete o botao "Painel Admin".

### Arquivos afetados

* `admin.html`
* `script.js`

### Dependencias

Tarefa 1.

### Criterio de conclusao

* `admin.html` nao possui link "Voltar ao App".
* `script.js` nao cria `btnGoToAdmin`.
* Admin nao visualiza comando de entrada no app comum.
* Usuario comum nao visualiza comando de entrada no admin.

### Teste manual

Abrir Hub Admin e app comum com perfis diferentes e conferir que nao ha botoes de transicao entre areas.

### Observacoes

Manter o botao "Sair" no Hub Admin.

## Tarefa 3 - Preparar whitelist para IDs por e-mail

Status: Concluida

### Objetivo

Alterar a base tecnica do Hub Admin para que novos documentos de `whitelisted_emails` usem o e-mail normalizado como ID do documento, permitindo regras Firebase com `get()` direto por e-mail.

### Arquivos afetados

* `admin.js`

### Dependencias

Tarefas 1 e 2.

### Criterio de conclusao

* Novos convites usam `doc(db, "whitelisted_emails", emailNormalizado)` em vez de ID aleatorio.
* A verificacao de duplicidade considera documentos novos por ID e documentos legados por campo `email`.
* A listagem continua exibindo documentos antigos com ID aleatorio.
* A exclusao/edicao continua funcionando para documentos antigos e novos.

### Teste manual

Criar um convite novo e confirmar no Firebase que o ID do documento e o e-mail normalizado. Confirmar que convites antigos ainda aparecem na lista.

### Observacoes

Esta tarefa nao migra automaticamente documentos antigos. A migracao pode ser manual no Firebase ou tratada em tarefa futura, se necessario.

## Tarefa 4 - Permitir convite por tipo de perfil

Status: Concluida

### Objetivo

Adicionar no formulario de convite a escolha entre usuario comum e administrador, salvando o campo de perfil no Firestore.

### Arquivos afetados

* `admin.html`
* `admin.js`

### Dependencias

Tarefa 3.

### Criterio de conclusao

* O formulario possui controle de tipo de perfil.
* Convites de usuario comum sao salvos com `role=user`.
* Convites de administrador sao salvos com `role=admin`.
* Duplicidade e e-mail invalido continuam bloqueados.

### Teste manual

Criar um convite de usuario comum e um convite de administrador, verificando a renderizacao na lista e os dados salvos.

### Observacoes

Administradores convidados tem os mesmos poderes do master, exceto excluir/desabilitar o master. A criacao/remocao de outros administradores por admin convidado depende de habilitacao do master.

## Tarefa 5 - Adicionar filtro por tipo de perfil

Status: Concluida

### Objetivo

Permitir filtrar a lista de e-mails por todos, administradores e usuarios.

### Arquivos afetados

* `admin.html`
* `admin.js`

### Dependencias

Tarefa 4.

### Criterio de conclusao

* Existe controle de filtro por tipo na area da lista.
* Busca por e-mail e filtro por tipo funcionam juntos.
* Master aparece como administrador.
* Documentos antigos sem `role` aparecem como usuarios.

### Teste manual

Alternar filtros com lista contendo master, usuario comum, admin convidado e documento antigo sem `role`.

### Observacoes

Evitar recarregar dados do Firestore a cada mudanca de filtro; filtrar em memoria quando possivel.

## Tarefa 6 - Resumir permissoes na lista

Status: Concluida

### Objetivo

Substituir os chips de permissoes visiveis em cada linha/cartao por status "Padrao" ou "Customizadas" e uma acao de configuracao.

### Arquivos afetados

* `admin.js`
* `admin.html`
* `style.css` se necessario

### Dependencias

Tarefa 5.

### Criterio de conclusao

* A tabela desktop nao exibe todos os chips de permissoes por linha.
* Os cards mobile tambem mostram resumo em vez de todos os chips.
* Cada item possui botao de configurar permissoes.
* O status reflete comparacao entre permissoes atuais e padrao.

### Teste manual

Abrir a lista no desktop e mobile, conferir que as permissoes nao floodam a tela e que o status exibido esta correto.

### Observacoes

Definir a comparacao de arrays de permissoes de forma independente da ordem dos itens.

## Tarefa 7 - Criar area de configuracao de permissoes

Status: Concluida

### Objetivo

Criar modal ou painel dedicado para editar permissoes de uma conta sem poluir a lista principal.

### Arquivos afetados

* `admin.html`
* `admin.js`
* `style.css` se necessario

### Dependencias

Tarefa 6.

### Criterio de conclusao

* Clicar em "Configurar" abre a area de permissao da conta selecionada.
* Alterar e salvar permissoes atualiza Firestore.
* A lista atualiza o status para "Padrao" ou "Customizadas".
* Erros de salvamento exibem mensagem clara.

### Teste manual

Alterar permissoes de um usuario comum, salvar, recarregar a pagina e confirmar persistencia e status correto.

### Observacoes

Para `role=admin`, a area pode exibir informacao de que permissoes de abas nao se aplicam enquanto a separacao de areas estiver ativa, salvo decisao diferente do usuario.

## Tarefa 8 - Melhorar uso de espaco no desktop

Status: Concluida

### Objetivo

Ajustar a largura e organizacao visual do Hub Admin para aproveitar melhor telas desktop.

### Arquivos afetados

* `admin.html`
* `style.css`

### Dependencias

Tarefa 6.

### Criterio de conclusao

* O container principal do Hub Admin usa largura maior em desktop.
* A lista fica mais legivel em telas largas.
* Nao ha overflow horizontal indesejado.
* Mobile permanece funcional.

### Teste manual

Testar em larguras aproximadas de 1366px, 1024px e 390px.

### Observacoes

Evitar refatoracao visual ampla fora do escopo.

## Tarefa 9 - Atualizar documentacao e revisar

Status: Concluida

### Objetivo

Documentar o novo comportamento do sistema atual e registrar revisao da funcionalidade.

### Arquivos afetados

* `docs/sistema-atual.md`
* `specs/admin-separacao-perfis/review.md`
* `specs/admin-separacao-perfis/tasks.md`

### Dependencias

Tarefas 1 a 8.

### Criterio de conclusao

* `docs/sistema-atual.md` descreve a separacao entre admin e usuario comum.
* `review.md` compara implementacao com spec, plano e tarefas.
* Tarefas implementadas estao marcadas corretamente.

### Teste manual

Ler a documentacao e confirmar que ela descreve o comportamento implementado, sem prometer funcionalidades ausentes.

### Observacoes

Esta tarefa deve ser feita somente depois da implementacao.
