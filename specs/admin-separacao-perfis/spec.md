# Especificacao: Separacao de Perfis e Ajustes do Hub Admin

## 1. Objetivo

Melhorar o Hub Admin do Selah para que administradores e usuarios convidados tenham areas separadas, sem botoes de transicao entre elas, e para que a gestao de convites fique mais organizada em telas desktop e mobile.

Esta funcionalidade tambem deve permitir convidar novos administradores, filtrar a lista por tipo de perfil e substituir a exibicao permanente de todas as permissoes por um resumo com acesso a uma area propria de configuracao.

## 2. Contexto

O sistema atual usa Firebase Authentication com Google Sign-In e Firestore. A colecao `whitelisted_emails` controla os e-mails autorizados e o campo `features` define quais abas do aplicativo comum o usuario pode acessar.

Hoje o administrador master `abner.eslava@gmail.com` e redirecionado para `admin.html`, mas ainda existe um fluxo alternativo `index.html?mode=app` que permite acessar a area de usuario. No app comum, quando o admin esta logado, o script injeta um botao "Painel Admin". No Hub Admin, existe um botao "Voltar ao App". Esses caminhos criam transito entre areas que devem ser isoladas.

O Hub Admin tambem renderiza todas as permissoes diretamente na lista de e-mails, causando excesso visual. Alem disso, o formulario atual convida apenas usuarios comuns e a lista nao possui filtro por tipo de perfil.

## 3. Usuarios envolvidos

* Administrador Master: conta principal `abner.eslava@gmail.com`, com acesso permanente ao Hub Admin.
* Administrador Convidado: novo perfil administrativo convidado por um administrador autorizado. Deve acessar o Hub Admin, nao a area comum do aplicativo.
* Usuario Convidado: perfil comum convidado para usar as areas do aplicativo conforme permissoes de abas.
* Usuario Nao Autorizado: conta Google sem convite valido, bloqueada no login.

## 4. Funcionamento esperado

Ao autenticar, o sistema deve identificar o tipo de perfil associado ao e-mail:

* Administradores devem ser direcionados ao Hub Admin (`admin.html`).
* Usuarios convidados comuns devem ser direcionados ao app (`index.html`).
* Usuarios nao autorizados devem ser deslogados e receber mensagem de acesso recusado.

O Hub Admin nao deve exibir "Voltar ao App". A area comum nao deve exibir "Painel Admin". O parametro `?mode=app` nao deve permitir que administradores acessem a area comum.

No Hub Admin, a largura util em desktop deve ser melhor aproveitada, reduzindo a sensacao de painel estreito em telas largas.

Na lista de e-mails, a coluna de permissoes deve exibir apenas um resumo do estado:

* "Padrao": quando as permissoes forem iguais ao conjunto padrao do perfil.
* "Customizadas": quando houver alteracao manual em relacao ao padrao.

Cada linha deve oferecer um botao para abrir/configurar permissoes daquela conta, em vez de expor todos os chips diretamente na tabela.

O formulario de convite deve permitir escolher o tipo de perfil a convidar: usuario comum ou administrador. A lista deve possuir filtro por tipo de perfil, incluindo pelo menos todos, administradores e usuarios.

## 5. Fluxo principal

1. Uma pessoa acessa o Selah e clica em "Entrar com o Google".
2. O sistema verifica o e-mail autenticado.
3. Se for administrador master ou administrador convidado, o navegador abre `admin.html`.
4. Se for usuario convidado comum, o navegador permanece/abre `index.html` e carrega apenas as abas permitidas.
5. Se nao houver convite valido, o sistema executa logout e exibe a mensagem de acesso recusado.
6. No Hub Admin, o administrador visualiza formulario de convite, busca, filtro por perfil e lista de e-mails.
7. Ao convidar um e-mail, o administrador escolhe o tipo de perfil e, quando aplicavel, as permissoes de abas.
8. Ao consultar a lista, o administrador ve o tipo do perfil e o status das permissoes sem os chips ocupando a tabela.
9. Ao clicar no botao de configuracao de permissoes de uma linha, o sistema abre a area/modal de configuracao para aquele perfil.
10. Ao salvar permissoes customizadas, a lista passa a indicar "Customizadas"; se as permissoes forem restauradas ao padrao, indica "Padrao".

## 6. Regras de negocio

* Administradores nao devem acessar a area de usuario por botoes internos, parametro de URL ou redirecionamento permissivo.
* Usuarios comuns nao devem acessar o Hub Admin por botoes internos nem por URL direta.
* O e-mail do administrador master continua com acesso administrativo permanente.
* Novos administradores podem ser convidados pelo Hub Admin.
* Administradores convidados possuem os mesmos poderes do master, exceto que nao podem excluir ou desabilitar o perfil do master.
* Administradores convidados nao podem convidar ou remover outros administradores, a menos que o master habilite essa capacidade.
* Administradores convidados podem alterar permissoes de usuarios comuns.
* Usuarios comuns devem continuar usando `features` para controle de abas.
* Administradores devem ter perfil administrativo no dado de convite, separado do conceito de permissoes de abas do app comum.
* A lista nao deve exibir todos os chips de permissoes por padrao.
* O estado "Padrao" deve representar permissoes iguais ao conjunto padrao do perfil.
* O estado "Customizadas" deve representar diferenca entre permissoes atuais e o conjunto padrao do perfil.
* [Inferencia] Para usuarios comuns, o padrao atual parece ser acesso a todas as abas disponiveis: `registros`, `oracoes`, `igreja`, `bencaos`.
* [Inferencia] Para administradores, permissoes de abas do app comum deixam de ser relevantes se o isolamento de areas for aplicado.
* E-mails duplicados continuam proibidos de forma case-insensitive.

## 7. Permissoes

* Administrador Master:
  * Pode acessar o Hub Admin.
  * Pode convidar usuarios comuns.
  * Pode convidar administradores.
  * Pode alterar permissoes de usuarios comuns.
  * Pode remover convites que nao sejam o proprio master.
* Administrador Convidado:
  * Pode acessar o Hub Admin.
  * Possui os mesmos poderes do master, exceto excluir ou desabilitar o perfil do master.
  * Pode alterar permissoes de usuarios comuns.
  * Nao pode convidar/remover outros administradores, a menos que o master habilite essa capacidade.
* Usuario Convidado:
  * Pode acessar somente o app comum.
  * Pode visualizar apenas as abas autorizadas.
  * Nao pode acessar o Hub Admin.
* Usuario Nao Autorizado:
  * Nao pode acessar nenhuma area autenticada.

## 8. Dados necessarios

Colecao `whitelisted_emails`:

* ID do documento: e-mail normalizado em minusculas, para permitir validacao direta nas regras do Firestore.
* `email`: e-mail normalizado em minusculas.
* `addedAt`: data/hora do convite.
* `features`: array de abas autorizadas para usuarios comuns.
* `role` ou campo equivalente: tipo do perfil, como `user` ou `admin`.
* Status "Padrao" ou "Customizadas" deve ser calculado a partir de `features`, sem salvar campo extra no Firestore.
* [Sugestao] `createdBy`: e-mail ou UID do administrador que criou o convite.
* [Sugestao] `updatedAt`: data/hora da ultima alteracao de permissao.

Dados derivados em tela:

* Tipo de perfil exibido na lista.
* Status de permissao: "Padrao" ou "Customizadas".
* Resultado combinado de busca por e-mail e filtro por perfil.

## 9. Estados e mensagens

* Carregando lista de convites.
* Lista vazia.
* Busca sem resultados.
* Filtro sem resultados.
* Convite salvo com sucesso.
* E-mail ja convidado.
* E-mail invalido.
* Perfil nao selecionado.
* Permissoes salvas com sucesso.
* Erro ao salvar permissoes.
* Acesso recusado para usuario comum tentando abrir `admin.html`.
* Redirecionamento automatico de administrador tentando abrir `index.html`.

## 10. Casos extremos

* Administrador acessa `index.html?mode=app`: deve ser redirecionado ao Hub Admin.
* Usuario comum digita `admin.html`: deve ser bloqueado e redirecionado ao app/login sem renderizar dados administrativos.
* Documento antigo em `whitelisted_emails` sem `role`: deve receber tratamento compativel com usuario comum.
* Documento antigo em `whitelisted_emails` com ID aleatorio: deve continuar legivel no front-end ate ser migrado ou recriado com ID baseado no e-mail.
* Documento antigo sem `features`: deve manter fallback de permissoes padrao sem quebrar login.
* Lista com muitos convidados: a tabela deve permanecer legivel e a configuracao de permissoes deve ficar fora da linha principal.
* Administrador tenta convidar o proprio e-mail master: deve ser bloqueado ou tratado como ja existente.
* Administrador tenta remover o master: deve ser bloqueado.
* Permissoes vazias para usuario comum: o sistema deve bloquear o salvamento.

## 11. Criterios de aceite

* Em desktop, o Hub Admin usa melhor a largura disponivel sem parecer limitado a uma coluna estreita.
* O botao "Voltar ao App" e removido do Hub Admin.
* O botao "Painel Admin" deixa de ser criado/exibido na area comum.
* Administradores autenticados sao direcionados ao Hub Admin e nao conseguem permanecer na area comum via `?mode=app`.
* Usuarios comuns autenticados sao direcionados ao app comum e nao conseguem abrir o Hub Admin por URL direta.
* O formulario do Hub Admin permite escolher entre convite de usuario comum e administrador.
* A lista de e-mails possui filtro por tipo de perfil.
* A lista mostra status resumido de permissao como "Padrao" ou "Customizadas".
* As permissoes deixam de floodar a tabela/lista principal.
* Existe botao/acao para abrir a configuracao de permissoes de uma conta.
* Alterar permissoes atualiza o status exibido na lista.
* Documentos antigos sem `role` continuam funcionando como usuarios comuns.
* Novos convites passam a usar ID de documento igual ao e-mail normalizado.

## 12. Duvidas pendentes

* Permissoes de abas devem existir para administradores ou administradores ficam totalmente fora do app comum?
* Como o master habilitara a capacidade de um admin convidado convidar/remover outros administradores?
* Como sera feita a migracao dos documentos antigos da whitelist com IDs aleatorios no Firebase existente?
