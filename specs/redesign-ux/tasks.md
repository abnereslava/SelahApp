# Tarefas: Redesign Visual e Otimização de UX

## Visão geral
Esta funcionalidade será implementada em quatro tarefas sequenciais. Iniciaremos redesenhando o design system central e a tipografia, passaremos para a barra inferior móvel (Bottom Nav), reestruturaremos o Hub de Administração para celulares e finalizaremos com o acoplamento da barra de ferramentas do Quill no rodapé móvel.

---

## Tarefa 1 — Refatoração das Variáveis CSS e Design System Central

Status: Concluída

### Objetivo
Modernizar a identidade visual unificada do Selah, aplicando variáveis terrosas HSL, fontes nobres e estrutura de cartões colapsáveis com filtros discretos.

### Arquivos afetados
*   `style.css` (Criação de variáveis `:root` e regras gerais).
*   `modules/registros.js` (Ocultação de filtros em acordeões).
*   `modules/bencaos.js` (Ocultação de filtros em acordeões).

### Dependências
Nenhuma.

### Critério de conclusão
*   Todos os botões, cabeçalhos, painéis e inputs exibem o novo tema terroso escuro dourado.
*   As fontes principais de títulos são exibidas em *Playfair Display* e o corpo de texto em *Inter* ou *Outfit*.
*   Os contêineres de filtros iniciam colapsados sob a timeline de feeds de registros e bênçãos.

### Teste manual
1. Abrir a aplicação e verificar se a paleta de cores mudou de tons escuros genéricos para a nova paleta HSL dourada terrosa com cantos arredondados suavizados.
2. Clicar nos acordeões de filtros e verificar a animação de colapso.

### Observações
Garantir que as cores e cantos arredondados sejam compartilhados de forma idêntica por todas as telas do ecossistema.

---

## Tarefa 2 — Implementação da Bottom Navigation Bar e Roteamento Móvel

Status: Concluída

### Objetivo
Substituir o menu lateral deslizante problemático no mobile por uma barra de navegação inferior estilo PWA moderno, integrando-a ao roteador SPA central.

### Arquivos afetados
*   `index.html` (Marcação da bottom nav).
*   `style.css` (Regras de ocultação de sidebar e exibição de bottom nav em telas <= 768px).
*   `script.js` (Roteamento dinâmico e destaque reativo de classes `.active` na bottom nav).

### Dependências
Tarefa 1 concluída.

### Critério de conclusão
*   A sidebar lateral clássica é ocultada em resoluções de tela <= 768px.
*   Uma barra de navegação no rodapé da página com os ícones permitidos pelo array `features` é exibida em telas móveis.
*   Mudar de aba clicando nos botões da barra inferior altera a hash e renderiza suavemente as telas correspondentes na SPA.

### Teste manual
1. Emular uma tela móvel no navegador (ex: iPhone 12 Pro).
2. Confirmar que a barra lateral sumiu e que a bottom nav com os ícones adequados surgiu no rodapé da página.
3. Clicar nas abas da bottom nav e atestar a transição e destaque da classe `.active`.

### Observações
Prever espaçamento no rodapé da página principal para impedir que a barra inferior móvel oculte conteúdos importantes.

---

## Tarefa 3 — Redesign e Responsividade do Hub Administrativo

Status: Concluída

### Objetivo
Redesenhar completamente a página do administrador (`admin.html` e `admin.js`), unificando sua identidade com as novas variáveis HSL e convertendo a tabela de convidados em uma lista de cartões elegantes em smartphones.

### Arquivos afetados
*   `admin.html` (Limpeza de marcações legadas e inclusão de contêiner responsivo).
*   `admin.js` (Raciocínio lógico para renderizar cartões dinâmicos sob telas <= 768px).
*   `style.css` (Regras de estilo de cartões administrativos mobile e unificação de cores).

### Dependências
Tarefa 2 concluída.

### Critério de conclusão
*   A página de administração compartilha a mesma paleta HSL terrosa e fontes do Selah.
*   A tabela clássica de convidados se converte automaticamente em uma lista vertical de cartões de convidados em smartphones, onde cada cartão exibe o e-mail, data, permissões táteis (chips dourados reativos) e ação de excluir.
*   Os formulários de convites não ultrapassam a largura de tela móvel.

### Teste manual
1. Abrir a página `admin.html` no desktop e verificar o layout unificado e tabela fluida.
2. Diminuir a tela para <= 768px e atestar que a tabela desapareceu, dando lugar a cartões organizados.
3. Testar o clique de ativação/desativação tátil de permissões nos cartões mobile.

### Observações
A exclusão e alteração de permissão instantânea por cliques nos chips devem continuar funcionando perfeitamente em telas móveis.

---

## Tarefa 4 — Acoplamento da Toolbar Quill na Base da Tela (Mobile Docked Editor)

Status: Concluída

### Objetivo
Fixar o painel `#mobileQuillToolbar` estaticamente na base da tela acima do teclado virtual em smartphones, eliminando cálculos flutuantes dinâmicos propensos a falhas de renderização.

### Arquivos afetados
*   `style.css` (Fixação estática absoluta na base e barra com scroll horizontal).
*   `modules/registros.js` (Ajustes de visibilidade e focagem Quill).
*   `modules/bencaos.js` (Ajustes de visibilidade e focagem Quill).

### Dependências
Tarefa 3 concluída.

### Critério de conclusão
*   A toolbar do Quill móvel permanece ancorada no rodapé da página.
*   Ela surge apenas quando um editor de texto (Livre ou Orientador) ganha foco e desaparece quando perde o foco.
*   As ferramentas de formatação são acessadas em uma única linha horizontal com scroll.

### Teste manual
1. Acessar o formulário de devocionais ou bênçãos no celular.
2. Tocar no editor de texto e certificar que a barra de ferramentas aparece fixada estaticamente no rodapé da tela.
3. Rolar horizontalmente as ferramentas de edição e testar as formatações.

### Observações
Garantir o espaçamento de segurança inferior (`safe-area-inset-bottom`) nos celulares para evitar choque visual com barras de navegação nativas.
