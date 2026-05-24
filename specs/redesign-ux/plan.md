# Plano Técnico: Redesign Visual e Otimização de UX

## 1. Resumo da solução
Atualizaremos a folha de estilos centralizada `style.css` e os arquivos principais (`index.html`, `script.js`, `admin.html` e `admin.js`) para suportar um novo design system HSL com propriedades premium de glassmorphism. O menu lateral deslizante do mobile será substituído por uma barra de navegação inferior fixa (`.mobile-bottom-nav`) e o Hub de Administração (`admin.html`) será redesenhado com cartões colapsáveis em telas móveis para total legibilidade. O editor Quill no celular usará uma toolbar acoplada na base da tela (`bottom`).

## 2. Dependências
*   **Phosphor Icons:** Utilizado para ícones da barra de navegação inferior.
*   **Firebase SDK (Auth e Firestore):** Usado para ler as abas ativas do convidado e persistir permissões no hub administrativo.
*   **Quill Editor:** A toolbar do editor móvel sofrerá modificações baseadas em atalhos de foco e blur.

## 3. Arquivos afetados
*   **`style.css`:** Contém todas as declarações de design tokens, redefinições da sidebar, criação da bottom-nav, regras de cartões do admin mobile e estilização da doca do editor.
*   **`index.html`:** Inclusão da marcação limpa do contêiner da `.mobile-bottom-nav`.
*   **`script.js`:** Ajuste no roteador SPA para marcar como ativo os links tanto na sidebar quanto na bottom-nav móvel.
*   **`admin.html`:** Ajustes de marcação para suportar o design unificado e o container flexível de lista responsiva.
*   **`admin.js`:** Ajuste na renderização de convidados no celular (geração dinâmica de cartões em vez de colunas de tabela longas).
*   **`modules/registros.js` e `modules/bencaos.js`:** Ajustes nos eventos de seleção do Quill para exibir a barra fixa do rodapé.

## 4. Estrutura de dados
*   Não há alteração nas tabelas ou coleções do Firestore. O campo `features` (array de strings) continuará norteando as permissões das abas na bottom-nav móvel e sidebar desktop.

## 5. Regras de segurança e permissões
*   O controle de segurança baseado nas permissões do Firestore continuará ativo. A bottom-nav móvel obedecerá estritamente as regras vigentes do Firestore.

## 6. Fluxos técnicos
*   **Carregamento SPA no Mobile:**
    1. Usuário abre a aplicação no smartphone.
    2. O roteador SPA lê `features` e exibe os ícones permitidos na bottom-nav.
    3. Usuário clica em uma das opções; a mudança de hash atualiza a aba e o ícone correspondente na bottom-nav recebe a classe `.active`.
*   **Visualização Administrativa no Mobile:**
    1. O administrador abre `admin.html` em tela móvel.
    2. A tabela clássica é ocultada (`display: none`) e ativamos a visualização em lista de cartões (`.admin-mobile-list`).
    3. Cada cartão expõe os chips dinâmicos dourados e o botão de remoção para controle ágil.

## 7. Impactos no sistema existente
*   Substituição total do menu móvel deslizante antigo (redução de cerca de 100 linhas de manipulações de toque em JavaScript em `script.js`).
*   Migração de estilos inline obsoletos do Hub do Administrador para classes unificadas no `style.css`.

## 8. Riscos técnicos
*   **Teclado virtual do smartphone cobrindo a Doca do Editor:** A barra de formatação precisa ficar acoplada exatamente acima da viewport visível. Utilizaremos propriedades CSS modernas e seguras para tratar a altura variável da tela quando o teclado for exibido.

## 9. Estratégia de teste
*   **Testes Manuais:** Testar a responsividade emulando dispositivos móveis (Nexus, iPhone, iPads) no Chrome DevTools e Safari Responsive Viewport.
*   **Testes de Permissão:** Alterar as permissões de uma conta de teste no admin e confirmar se a bottom-nav do celular esconde e protege os hashes em tempo real.

## 10. Ordem recomendada de implementação
1.  **Refatoração do CSS Global (`style.css`):** Implementar as novas variáveis HSL, paletas terrosas e tipografias Playfair.
2.  **Bottom Nav e Roteamento Móvel:** Adicionar a bottom-nav no `index.html` e fazer a integração reativa de hashes e permissões no `script.js`.
3.  **Redesign Completo do Hub Administrativo:** Unificar os estilos de `admin.html` com o CSS central e programar em `admin.js` a renderização flexível de cartões responsivos para mobile.
4.  **Ajuste das Toolbars Quill:** Modificar `registros.js` e `bencaos.js` para usar a barra inferior fixa.
