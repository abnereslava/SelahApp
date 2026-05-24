# Especificação: Login com Google

Este documento define os requisitos de produto e negócios para a substituição do sistema antigo de login (E-mail/Senha) pela autenticação via Google no aplicativo **Selah**.

---

## 1. Objetivo

Substituir o formulário tradicional de login (e-mail e senha) por um botão de autenticação simplificado utilizando a conta do Google (Firebase Google Authentication). O objetivo é aumentar a segurança, agilizar o acesso no dispositivo móvel e preparar o terreno para o controle de acesso via whitelist.

---

## 2. Contexto

Atualmente, o login do Selah (`index.html`) é composto por campos clássicos de e-mail e senha vinculados ao Firebase Auth. O novo fluxo substitui completamente essa interface, utilizando o provedor Google Auth. Ele trabalhará em conjunto com a funcionalidade de **Hub de Administrador (Whitelist)** para barrar acessos não autorizados.

---

## 3. Usuários envolvidos

*   **Administrador:** Acessa o sistema autenticando-se com sua conta Google configurada como master (`abner.eslava@gmail.com`).
*   **Usuários Convidados:** Acessam o sistema autenticando-se com suas contas Google, desde que previamente cadastrados na whitelist pelo Administrador.
*   **Usuários Não Autorizados:** Pessoas que tentam logar com uma conta Google cujo e-mail não esteja na lista de convidados; devem ser barradas imediatamente.

---

## 4. Funcionamento esperado

1.  A tela de login exibirá um card limpo contendo a identidade visual do Selah e um único botão proeminente: **"Entrar com o Google"**.
2.  Ao clicar no botão, a interface iniciará a autenticação via pop-up padrão do Google (`signInWithPopup`).
3.  Após a autenticação de sucesso com o Google, o sistema receberá o e-mail correspondente.
4.  Antes de conceder acesso ao Dashboard, o aplicativo verificará se o e-mail em questão está cadastrado na coleção de **Convidados** no Firestore (ou se ele é o Administrador Master).
5.  *Se estiver autorizado:* O dashboard é exibido normalmente.
    *   **Ferramenta de Migração Temporária:** Em vez de migração automática no login, o administrador master (`abner.eslava@gmail.com`) poderá acionar uma migração manual e única de seus registros históricos de devocionais e bênçãos por meio de uma ferramenta visual e temporária integrada no rodapé do painel administrativo (`admin.html`).
6.  *Se não estiver autorizado:* O usuário é deslogado silenciosamente do Firebase Auth e uma mensagem de erro clara é exibida na tela de login.

---

## 5. Fluxo principal

1.  O usuário entra no aplicativo e vê a tela de login.
2.  O usuário clica em **"Entrar com o Google"**.
3.  O fluxo de autenticação do Firebase por pop-up é acionado (`signInWithPopup`).
4.  O Google valida as credenciais e retorna o objeto `User` contendo o e-mail.
5.  O sistema executa a checagem de autorização:
    *   Verifica se o e-mail corresponde ao e-mail do Administrador Master (`abner.eslava@gmail.com`).
    *   Verifica se o e-mail existe na coleção `whitelisted_emails` no Firestore.
6.  Sendo aprovado, a interface atualiza o estado para logado e libera o Dashboard.
7.  Por fim, renderiza o dashboard principal (`#dashboardContainer`).

---

## 6. Regras de negócio

1.  **Exclusividade de Método:** O login tradicional por e-mail e senha será totalmente desativado e removido do front-end.
2.  **Validação Case-Insensitive:** A checagem de e-mails autorizados na whitelist deve ignorar diferenças entre maiúsculas e minúsculas.
3.  **Persistência de Sessão:** A sessão do usuário Google deve ser persistente (mecanismo padrão do Firebase Auth), evitando que ele precise fazer login a cada abertura no celular (PWA).

---

## 7. Permissões

*   Qualquer pessoa pode clicar no botão e tentar se autenticar pelo Google.
*   Somente usuários cujo e-mail conste na base de dados de convidados aprovados (ou administrador) terão permissão de leitura/escrita no Firestore.

---

## 8. Dados necessários

*   **Firebase Auth User Object:** Necessário ler as propriedades `email`, `uid` e `displayName`.
*   **Coleção de Whitelist (Firestore):** Necessário realizar uma consulta de leitura para checar a existência do e-mail digitado.

---

## 9. Estados e mensagens

*   **Estado de Carregamento (Loading):** Durante a autenticação, exibir um texto de carregamento no botão ("Autenticando...") para evitar cliques duplos.
*   **Mensagem de Acesso Negado:** Se o e-mail não estiver na whitelist, exibir: *"Acesso recusado. Este e-mail não consta na lista de convidados autorizados. Entre em contato com o administrador."*
*   **Mensagem de Erro de Conexão:** Em caso de falha de rede: *"Erro ao conectar com o serviço do Google."*

---

## 10. Casos extremos e limitações de Popup

> [!WARNING]
> **Ponto de Atenção: Bloqueio de Pop-ups Mobile**
> A decisão oficial é utilizar o método por pop-up (`signInWithPopup`). Note que em navegadores móveis específicos (especialmente Safari em iOS e navegadores integrados de PWA standalone em tela cheia), pop-ups são comumente bloqueados de forma agressiva pelo sistema operacional por padrão. Esta limitação deve ficar sob acompanhamento futuro do usuário caso seja necessária a migração para métodos de redirecionamento.

*   **Usuário cancela o login do Google:** O usuário cancela a autenticação fechando a janela de pop-up do Google. O sistema captura a exceção (`auth/popup-closed-by-user`) e retorna o botão para o estado ativo com aviso.
*   **Usuário já logado é removido da whitelist:** Se o administrador remover um e-mail com o usuário atualmente logado, este deve ser deslogado na próxima vez que recarregar o app ou tentar realizar uma consulta/escrita.

---

## 11. Critérios de aceite

*   Formulário de e-mail/senha completamente removido do HTML.
*   Botão "Entrar com o Google" centralizado e estilizado com o padrão visual do Selah.
*   Tentativas de login com e-mails ausentes na whitelist são estritamente barradas, exibindo o aviso na tela de login.
*   Contas válidas navegam para o painel principal, exibindo a saudação personalizada com base no nome do Google.
*   Painel do Administrador possui ferramenta manual temporária para migrar devocionais e bênçãos do UID legado para o novo Google UID.

---

## 12. Dúvidas pendentes

*   *Nenhuma dúvida pendente. Decisão de manter login por popup oficializada pelo usuário.*
