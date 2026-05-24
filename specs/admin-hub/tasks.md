# Tarefas: Hub de Administrador (Whitelist)

Este documento divide o plano de implementação do Hub de Administração em tarefas pequenas, sequenciais e testáveis.

---

## Visão geral

O desenvolvimento se concentrará em criar a interface isolada do painel de administração (`admin.html`), aplicar a proteção estrita de rota, programar a verificação de convites no login do aplicativo e finalizar com a interface de gerenciamento de e-mails.

---

## Tarefa 1 — Estrutura Visual da Página `admin.html`

Status: Pendente

### Objetivo
Criar o arquivo `admin.html` herdando todo o design system (CSS, variáveis e fontes) do Selah, estruturando a casca do painel administrativo.

### Arquivos afetados
*   [NEW] [admin.html](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/admin.html)

### Dependências
Nenhuma.

### Critério de conclusão
*   Arquivo `admin.html` criado.
*   Presença de um botão para retornar para `index.html`.
*   Formulário de cadastro contendo input de texto de e-mail e botão "Convidar".
*   Container para listagem dinâmica de e-mails convidados e campo de busca rápida.
*   Design responsivo alinhado com o visual chocolate/creme do Selah.

### Teste manual
1.  Abrir a URL direta `/admin.html` no navegador.
2.  Verificar se a estrutura visual carrega de forma idêntica e premium, combinando com o design original do dashboard de devocionais.

---

## Tarefa 2 — Proteção de Rota e Injeção do Link na Sidebar

Status: Pendente

### Objetivo
Desenvolver o script `admin.js` para garantir que apenas `abner.eslava@gmail.com` possa permanecer na página, e atualizar o script principal para exibir o link da sidebar apenas para ele.

### Arquivos afetados
*   [NEW] [admin.js](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/admin.js)
*   [script.js](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/script.js)
*   [index.html](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/index.html)
*   [oracoes.html](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/oracoes.html)
*   [igreja.html](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/igreja.html)

### Dependências
Tarefa 1 concluída.

### Critério de conclusão
*   Ao abrir `admin.html`, o script `admin.js` escuta `onAuthStateChanged`. Se o e-mail não for `abner.eslava@gmail.com`, limpa o DOM e chama `window.location.href = 'index.html'`.
*   No script de `index.html`, `oracoes.html` e `igreja.html`, se o usuário logado for `abner.eslava@gmail.com`, injetar dinamicamente um link na sidebar: **"Painel Admin"** apontando para `admin.html`.

### Teste manual
1.  Logar com uma conta comum ou acessar deslogado e digitar `/admin.html` na URL. Deve redirecionar instantaneamente para `index.html`.
2.  Logar com `abner.eslava@gmail.com` e verificar se a opção "Painel Admin" aparece visível e acessível na barra lateral de todas as páginas.

---

## Tarefa 3 — Validação de Whitelist no Login

Status: Pendente

### Objetivo
Implementar na rotina de login do Selah a verificação obrigatória na base de dados do Firestore antes de liberar o Dashboard.

### Arquivos afetados
*   [script.js](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/script.js)

### Dependências
Tarefa 2 concluída.

### Critério de conclusão
*   Durante a autenticação do Google, se o e-mail for `abner.eslava@gmail.com`, liberar o acesso imediatamente.
*   Se for outro e-mail, realizar uma consulta Firestore buscando pelo e-mail na coleção `whitelisted_emails`.
*   Se o documento existir, liberar o acesso normalmente.
*   Se o documento não existir, chamar `signOut(auth)`, manter a tela de login aberta e exibir o modal de alerta personalizado: *"Acesso recusado. Este e-mail não consta na lista de convidados autorizados. Entre em contato com o administrador."*

### Teste manual
1.  Tentar logar com uma conta do Google não convidada. Verificar se o sistema barra o login e exibe a mensagem de recusa.
2.  Adicionar manualmente no Firestore um e-mail teste na coleção `whitelisted_emails` e tentar logar com essa conta. O login deve funcionar com sucesso.

---

## Tarefa 4 — Gerenciamento de Convites (CRUD)

Status: Pendente

### Objetivo
Concluir a lógica de inserção, listagem, filtragem rápida e revogação de e-mails convidados diretamente pela página de administração.

### Arquivos afetados
*   [admin.js](file:///d:/PROJETOS/PROGRAMACAO/Abner/SelahApp/admin.js)

### Dependências
Tarefa 3 concluída.

### Critério de conclusão
*   Lógica para listar todos os documentos da coleção `whitelisted_emails` em tempo real ou sob demanda ao abrir a página.
*   Função de "Convidar": valida se o input é um e-mail válido, verifica duplicatas no Firestore, e adiciona o documento com e-mail em minúsculas.
*   Função de busca: input de pesquisa filtra os e-mails exibidos na lista dinamicamente por texto parcial.
*   Função de "Revogar": clicar no ícone de lixeira, exibir modal de confirmação personalizada, e deletar o e-mail correspondente do Firestore, atualizando a visualização.
*   O sistema impede a exclusão do e-mail do próprio administrador (`abner.eslava@gmail.com`).

### Teste manual
1.  Na tela administrativa, adicionar um e-mail com letras maiúsculas e minúsculas (Ex: `TesteConvidado@gmail.com`). Confirmar se foi gravado em minúsculas.
2.  Tentar convidar o mesmo e-mail novamente. Deve barrar por duplicidade.
3.  Pesquisar por parte do e-mail no campo de busca e confirmar a filtragem correta.
4.  Excluir o e-mail adicionado e verificar se a remoção se reflete no Firestore instantaneamente.
