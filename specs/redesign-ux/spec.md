# Especificação: Redesign Visual e Otimização de UX

## 1. Objetivo
Modernizar a interface do aplicativo Selah, unificando a identidade estética com o Hub de Administração, otimizando drasticamente a usabilidade (UX) e garantindo compatibilidade e responsividade móvel de alto padrão (Mobile-First).

## 2. Contexto
Esta especificação afeta todas as abas funcionais do aplicativo central (`index.html` com seus módulos dinâmicos) e a interface administrativa separada (`admin.html`), elevando a qualidade do design e usabilidade do ecossistema Selah.

## 3. Usuários envolvidos
*   **Membro Convidado:** Usuário regular que interage com as abas de devocionais (Registros) e Diário de Bênçãos no celular ou desktop.
*   **Administrador Master (`abner.eslava@gmail.com`):** Utiliza o Hub Administrativo (`admin.html`) para gerenciar acessos e permissões de convidados.

## 4. Funcionamento esperado
*   **Design System Unificado:** O app de leitura e o hub de administração passam a compartilhar um tema terroso dourado escuro ("Glassmorphism"), com elementos transparentes desfocados, cantos confortáveis (`16px`) e sombras profundas.
*   **Navegação Mobile Híbrida:** A barra lateral de navegação é desativada em telas menores (<= 768px). Em seu lugar, surge uma barra horizontal de navegação inferior (Bottom Nav) inspirada nos aplicativos PWA mais modernos, eliminando a gaveta deslizante antiga que sofria com falhas e conflitos de gestos.
*   **Barra do Editor Fixa (Docked Editor):** O editor Quill do celular não exibe mais a barra de ferramentas flutuante que atrapalhava a seleção de texto. Ao invés disso, a barra de ferramentas fica fixada no rodapé da página assim que o editor recebe foco, desaparecendo automaticamente no blur.
*   **Hub do Administrador Responsivo:** A tabela de usuários e o formulário de convites na tela de admin são redesenhados. Em celulares, a tabela colapsa automaticamente em uma lista de cartões (cards) premium e legíveis, onde o administrador pode ligar/desligar permissões e excluir convidados sem esforço de rolagem lateral.

## 5. Fluxo principal
1.  **Acesso ao Hub (Administrador):** O administrador abre a página `admin.html` em qualquer dispositivo, visualizando o formulário e a lista de convidados em um layout totalmente fluido e esteticamente refinado.
2.  **Modificação de Permissões:** O administrador clica no chip de permissão de um convidado na lista (estilizada em cartões no celular ou tabela no desktop); a alteração é gravada instantaneamente e o visual do chip (borda dourada ou opaco) se ajusta reativamente.
3.  **Navegação SPA (Convidado):** O convidado navega pelas abas permitidas utilizando a Sidebar (desktop) ou a Bottom Nav (mobile) de forma ultra fluida, com animações suaves de transição.
4.  **Edição Rica no Celular (Convidado):** Ao tocar para escrever um devocional ou uma bênção, a barra de formatação Quill surge fixada no rodapé, permitindo formatar textos confortavelmente.

## 6. Regras de negócio
*   **Visual Consistente:** As variáveis do tema (fontes, cores e cantos) devem ser idênticas entre o painel do administrador e o app central.
*   **Acessibilidade Móvel:** Nenhum formulário ou tabela pode ultrapassar as bordas laterais do viewport do smartphone.
*   **Preservação da Responsividade:** A Bottom Nav deve exibir apenas as abas presentes no array de `features` do usuário logado.

## 7. Permissões
*   **Administrador Master:** Acesso total à interface do Hub (`admin.html`) para convidar, alterar permissões dinamicamente e remover convidados.
*   **Membro Convidado:** Acesso às abas do app de acordo com suas permissões, com interface moderna e responsiva adaptada.

## 8. Dados necessários
*   **whitelisted_emails:** Documentos contendo `email`, `addedAt` e o array `features` de permissões.
*   **devotionals & blessings:** Registros individuais lidos e expostos em timelines animadas.

## 9. Estados e mensagens
*   **Carregamento:** Indicador de loading central (`ph-spinner` animado) com vidro fosco ao transicionar entre as abas na SPA.
*   **Modificação de Permissão:** Feedback visual imediato nos chips da lista administrativa de convidados.

## 10. Casos extremos
*   **Dispositivos com entalhe (Notch):** O rodapé do editor fixo e a Bottom Nav devem prever margens seguras inferiores (`safe-area-inset-bottom`) para não colidirem com os botões virtuais do sistema operacional.
*   **Tabelas administrativamente longas:** A lista de convidados no desktop deve utilizar rolagem otimizada para não quebrar a estrutura.

## 11. Critérios de aceite
- [ ] A Sidebar não é exibida em telas menores que `768px`, sendo substituída pela Bottom Navigation Bar.
- [ ] A tabela de convidados no Hub de Administração (`admin.html`) se transforma em cartões verticais dinâmicos em telas menores que `768px`.
- [ ] A toolbar do Quill no celular se fixa estaticamente na base da tela acima do bottom-nav/teclado e não flutua mais.
- [ ] O visual de ambas as interfaces compartilha os mesmos padrões visuais HSL, Playfair Display e Glassmorphism.

## 12. Dúvidas pendentes
*   Nenhuma pendência identificada no escopo funcional.
