# Especificação: Hub de Administrador (Whitelist de Convites)

Este documento define os requisitos funcionais e as regras de negócio para a criação de um Painel de Controle Administrativo (Hub de Admin) para gerenciar quais usuários estão autorizados a fazer login no aplicativo **Selah**.

---

## 1. Objetivo

Criar uma área restrita de controle administrativo em uma página dedicada (`admin.html`) que permita ao administrador master convidar e gerenciar e-mails autorizados (Whitelist). Se um e-mail não constar nesta lista gerenciada pelo administrador, a aplicação deverá recusar o acesso do usuário no ato do login.

---

## 2. Contexto

A aplicação Selah está expandindo seu escopo. Para evitar o acesso descontrolado na infraestrutura do Firebase Firestore e manter o foco em um grupo fechado de pessoas, o acesso será controlado por convites. Esta especificação detalha como o administrador gerenciará essa lista diretamente pela interface do aplicativo de maneira simples e intuitiva através de uma página isolada (`admin.html`).

---

## 3. Usuários envolvidos

*   **Administrador Master:** Usuário detentor da conta Google master `abner.eslava@gmail.com`. Possui permissão exclusiva para acessar o Hub e ler/gravar na lista de convidados.
*   **Usuário Convidado:** Usuário comum cujo e-mail foi cadastrado pelo Administrador. Pode logar e utilizar todas as funções do app, mas não tem acesso ao painel de administração.
*   **Usuário Não Convidado:** Qualquer outra conta Google que tente se autenticar. Receberá o bloqueio de login e não poderá ler ou criar nenhum devocional.

---

## 4. Funcionamento esperado

1.  O sistema detecta no login se o e-mail do usuário autenticado via Google corresponde ao e-mail do **Administrador Master** (`abner.eslava@gmail.com`).
2.  *Se for o Administrador:* O sistema exibe um link adicional no menu lateral (Sidebar) chamado **"Painel Admin"** (ou ícone correspondente).
3.  Ao clicar neste link, o administrador é direcionado para a página dedicada **`admin.html`**.
4.  Ao acessar esta página, o administrador visualiza:
    *   Um cabeçalho clássico com link para retornar à tela de Registros (`index.html`).
    *   Um formulário simples para cadastrar um novo e-mail convidado.
    *   Uma listagem organizada em tabela ou lista de todos os e-mails atualmente convidados.
    *   Um controle de busca rápida para pesquisar e-mails cadastrados.
    *   Um botão de exclusão ("Revogar Acesso") ao lado de cada e-mail.
5.  Ao cadastrar um e-mail, este é gravado na coleção `whitelisted_emails` no Firestore.
6.  Ao excluir um e-mail da lista, o registro correspondente é deletado no Firestore.
7.  *Se for um usuário comum:* O link do painel de administração fica completamente oculto da interface. Caso um usuário comum tente forçar a URL direta `admin.html`, o script da página deve interceptar o acesso, bloqueá-lo e redirecioná-lo para `index.html`.

---

## 5. Fluxo principal

### A. Fluxo de Validação no Login (Todos os Usuários)
1.  O usuário faz login com a conta Google.
2.  O sistema intercepta o e-mail retornado.
3.  O sistema consulta a coleção `whitelisted_emails` no Firestore procurando um documento correspondente ao e-mail logado.
4.  *Se o e-mail corresponder a `abner.eslava@gmail.com` OR existir na coleção:* Concede o acesso e libera o Dashboard.
5.  *Se não existir:* Exibe mensagem de erro na tela de login, desloga silenciosamente a conta no Firebase Auth e impede a abertura do painel.

### B. Fluxo de Operação do Administrador (No Hub de Admin - `admin.html`)
1.  O administrador clica no item "Painel Admin" no menu lateral.
2.  O navegador redireciona o usuário para `admin.html`.
3.  A interface do painel é renderizada.
4.  **Inserção:** O administrador insere o e-mail do novo convidado no campo de texto e clica em "Convidar".
    *   O sistema valida se o formato do e-mail é válido.
    *   O sistema insere o documento no Firestore em letras minúsculas (case-insensitive).
    *   O e-mail é adicionado à lista exibida em tela.
5.  **Remoção:** O administrador clica no ícone de lixeira ao lado de um e-mail cadastrado.
    *   O sistema exibe uma caixa de confirmação.
    *   Após a confirmação, o documento é excluído do Firestore e atualiza a listagem.

---

## 6. Regras de negócio

1.  **Impedimento Estrito:** A whitelist é a chave de entrada. Nenhum dado do dashboard (como devocionais ou estatísticas) deve ser carregado ou consultado antes que a validação do e-mail na whitelist retorne positiva.
2.  **Unicidade de Registro:** Não podem existir e-mails duplicados na whitelist. O sistema deve rejeitar tentativas de adicionar um e-mail que já existe (case-insensitive).
3.  **Administrador Auto-Aprovado:** O e-mail do Administrador Master é declarado via código de forma fixa como `abner.eslava@gmail.com`, garantindo que ele sempre tenha acesso ao sistema, mesmo se a coleção de whitelist estiver vazia ou indisponível.
4.  **Proteção de Infraestrutura (Regras do Firestore):**
    *   Apenas requisições autenticadas com o UID correspondente ao e-mail `abner.eslava@gmail.com` podem realizar operações de Escrita (criar, atualizar, excluir) na coleção `whitelisted_emails`.
    *   Qualquer usuário autenticado com conta Google tem direito de ler apenas o seu próprio e-mail na whitelist para validar seu login.

---

## 7. Permissões

*   **Acesso ao Hub de Admin (`admin.html`):** Exclusivo do e-mail `abner.eslava@gmail.com`.
*   **Adicionar/Remover Convidados:** Exclusivo do e-mail `abner.eslava@gmail.com`.
*   **Ver a lista completa de convidados:** Exclusivo do e-mail `abner.eslava@gmail.com`.

---

## 8. Dados necessários

### Coleção no Firestore: `whitelisted_emails`
Cada documento representará um e-mail autorizado:
*   `id`: ID único gerado pelo Firestore (ou o próprio e-mail higienizado).
*   `email`: String do e-mail em minúsculas (Ex: `usuario@gmail.com`).
*   `addedAt`: Data e hora em que foi convidado (ISO String).

---

## 9. Estados e mensagens

*   **Mensagem de E-mail Inválido:** *"Por favor, insira um endereço de e-mail válido."*
*   **Mensagem de E-mail Já Cadastrado:** *"Este e-mail já está na lista de convidados."*
*   **Mensagem de Sucesso ao Adicionar:** *"E-mail convidado com sucesso!"*
*   **Aviso de Confirmação para Excluir:** *"Deseja realmente revogar o acesso deste usuário? Ele não conseguirá mais entrar no Selah."*

---

## 10. Casos extremos

*   **Administrador tenta excluir a si mesmo:** O sistema deve bloquear a exclusão se o e-mail digitado no formulário ou selecionado na lista for `abner.eslava@gmail.com`.
*   **Revogação de acesso em tempo real:** Se o administrador excluir o e-mail de um usuário que está com o app aberto naquele momento.
    *   *Tratamento proposto:* As regras de segurança do Firestore devem bloquear imediatamente qualquer tentativa de gravação de novos devocionais por parte daquele UID desautorizado. O app detectará o erro de permissão no Firestore e forçará o deslogamento imediato da tela do usuário.

---

## 11. Critérios de aceite

*   Link "Painel Admin" renderizado na sidebar apenas para o e-mail `abner.eslava@gmail.com`.
*   Telas e formulários de gerenciamento acessíveis apenas na página `admin.html` com proteção de rota contra usuários comuns.
*   Bloqueio estrito de inserção de formatos de e-mail incorretos ou duplicados.
*   Revogação de acessos funcionando instantaneamente (refletindo no Firestore).

---

## 12. Dúvidas pendentes

*   *Nenhuma dúvida pendente. Decisões técnicas acordadas com o usuário.*
