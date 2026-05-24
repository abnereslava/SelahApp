# Documentação: Sistema Atual — Selah

Este documento descreve o estado atual do aplicativo **Selah** (Gestão de Devocionais e Vida Cristã), detalhando a estrutura do sistema, os fluxos do usuário e as funcionalidades implementadas até o momento.

---

## 1. Visão Geral do Aplicativo

O **Selah** é um Progressive Web App (PWA) projetado para gerenciar diferentes áreas da vida cristã. No momento atual, o foco principal de desenvolvimento está no módulo de **Registros de Devocionais / Leituras**, oferecendo ferramentas para anotações livres ou orientadas, categorização inteligente, trilhas de continuidade e relatórios estatísticos.

O sistema opera de forma integrada com o **Firebase (Authentication e Firestore)** no modelo Client-Side, possuindo suporte offline básico através de Service Worker.

---

## 2. Estrutura de Diretórios e Arquivos

O projeto possui uma estrutura simples e focada no front-end puro (HTML5, Vanilla CSS e Javascript ES6):

```text
/
├── index.html            # Tela principal (Login, Dashboard de Registros, Formulários e Estatísticas)
├── oracoes.html          # Placeholder para a aba de Orações
├── igreja.html           # Placeholder para a aba de Igreja
├── style.css             # Folha de estilos unificada (design responsivo, temas e transições)
├── .temp_style.css       # [Não confirmado] Arquivo de estilos temporário ou backup antigo
├── script.js             # Lógica de negócio, integração Firebase, manipulação de DOM e gráficos
├── sw.js                 # Service Worker do PWA (estratégia Network-First com fallback para cache)
├── manifest.json         # Configuração de manifesto PWA
├── icon-192.png          # Ícone de inicialização PWA (192x192)
├── icon-512.png          # Ícone de inicialização PWA (512x512)
├── info.txt              # [Não confirmado] Arquivo de informações em branco
│
├── /docs/                # Documentação técnica e verdade atual do sistema
│   ├── AGENTS.md         # Diretrizes do fluxo de Specification-Driven Development (SDD)
│   ├── sistema-atual.md  # (Este arquivo) Visão geral do sistema
│   ├── arquitetura.md    # Detalhamento de arquitetura, banco de dados e stack técnica
│   └── /modulos/
│       ├── registros.md  # Especificação técnica do módulo ativo de devocionais
│       ├── oracoes.md    # [Não especificado] Spec em branco para módulo de Orações
│       └── igreja.md     # [Não especificado] Spec em branco para módulo de Igreja
│
├── /dev/                 # Materiais de suporte e notas do desenvolvedor
│   ├── diario.md         # Diário de bordo com histórico de feedback e metas futuras
│   └── glossario-sdd.md  # Resumo rápido do fluxo de documentação SDD
│
└── /specs/               # Diretório reservado para futuras especificações de novas features
```

---

## 3. Estado de Desenvolvimento das Abas (Módulos)

| Módulo/Aba | Arquivo Principal | Status Atual | Descrição |
| :--- | :--- | :--- | :--- |
| **Registros** | `index.html` / `script.js` | **100% Implementado** | Gestão de anotações (livre e orientada), trilhas, tags, links/ações, filtros e estatísticas com gráficos. |
| **Orações** | `oracoes.html` | **Página de Rascunho / Blank Spec** | Apenas tela placeholder estática indicando desenvolvimento futuro. Sem lógica de negócio definida. |
| **Igreja** | `igreja.html` | **Página de Rascunho / Blank Spec** | Apenas tela placeholder estática indicando desenvolvimento futuro. Sem lógica de negócio definida. |

---

## 4. Fluxos Globais do Usuário

### A. Fluxo de Autenticação
1. Ao acessar a aplicação, o sistema escuta o estado da autenticação via `onAuthStateChanged` do Firebase.
2. Se o usuário **não estiver autenticado**, a interface colapsa o dashboard e exibe em tela cheia o formulário de login (`#loginContainer`), contendo unicamente o botão de autenticação do Google.
3. O usuário clica em **"Entrar com o Google"**, abrindo a janela de pop-up padrão do Firebase Auth (`signInWithPopup`).
4. Após o sucesso do login com o Google, o e-mail do usuário é verificado contra a base de dados de convidados aprovados no Firestore (ou é validado como o Administrador Master).
5. Sendo autorizado, o painel principal (`#dashboardContainer`) é exibido e a saudação personalizada é preenchida no topo da tela. Se for recusado, o sistema executa o `signOut` e exibe uma mensagem de recusa.
6. O botão "Sair" desloga o usuário utilizando `signOut` e limpa o estado.

### B. Fluxo de Navegação e Bottom Navigation Bar
* **Em Computadores (Desktop):** A sidebar fica visível à esquerda e pode ser recolhida/expandida através de um botão de toggle (`#btnToggleSidebar`), que desloca o conteúdo principal de forma fluida.
* **Em Dispositivos Móveis (Mobile):** A sidebar lateral é ocultada de forma completa. Em seu lugar, a barra inferior `.mobile-bottom-nav` permite alternar entre as abas autorizadas do Progressive Web App (PWA) de forma nativa e tátil.

---

## 5. Riscos e Observações do Sistema Atual

* **[Atenção / Risco de Usabilidade] Autenticação via Pop-up no Mobile:** O login Google oficial utiliza o método por pop-up (`signInWithPopup`). Em determinados navegadores móveis (como o Safari no iOS ou navegadores dentro de PWAs em tela cheia), pop-ups são bloqueados agressivamente pelo sistema operacional por padrão. Deve-se observar futuramente a migração para métodos de redirecionamento se houver queixas de usabilidade em celulares.
* **[Risco Técnico] Chaves de API do Firebase expostas:** As credenciais públicas do Firebase estão diretamente escritas em `script.js` (linhas 5-12). Embora as chaves de API do Firebase sejam seguras para exposição pública, é crítico que existam regras de segurança rigorosas no Firestore para evitar acessos ou escritas maliciosas por terceiros.
* **[Limitação PWA] Ausência de Cache Dinâmico para Recursos do Firebase:** O Service worker (`sw.js`) cacheia apenas os recursos essenciais do front-end (`index.html`, `style.css`, `script.js`). O aplicativo precisa de conexão com a rede no momento da inicialização para buscar as bibliotecas JS externas (Firebase, Phosphor Icons, Quill, Chart.js) via CDN e para carregar os registros da nuvem.
