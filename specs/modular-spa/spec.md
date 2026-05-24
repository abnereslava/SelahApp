# Especificação Funcional - Selah Modular SPA & Diário de Bênçãos

Esta especificação descreve a transição do aplicativo Selah para uma arquitetura **Single Page Application (SPA) modular**, eliminando arquivos HTML estáticos redundantes e adicionando a nova funcionalidade do **Diário de Bênçãos**.

---

## 1. Objetivos da Nova Arquitetura
1. **Unificação Visual e Performance:** Reduzir a latência de navegação ao eliminar o recarregamento físico de páginas HTML (`oracoes.html`, `igreja.html`).
2. **Modularização de Código:** Separar as funcionalidades de cada aba (Registros, Orações, Igreja e Bênçãos) em arquivos JavaScript independentes (Módulos ES6).
3. **Redução de Redundância:** Eliminar a duplicação de estruturas HTML e lógicas de sidebar/autenticação em múltiplos arquivos.
4. **Novo Recurso (Diário de Bênçãos):** Permitir o registro, consulta e filtragem de testemunhos e bênçãos recebidas, promovendo a gratidão e a memória da fidelidade de Deus.

---

## 2. Abordagem SPA (Single Page Application)
A navegação do aplicativo será feita inteiramente dentro de `index.html`. O arquivo `index.html` servirá como a **casca (shell)** da aplicação, contendo a barra lateral (`sidebar`) e a barra de cabeçalho (`app-header`).

### Mecanismo de Troca de Abas (Dynamic Session Rendering)
- O conteúdo central da página será delimitado por um container geral: `<div id="spaContent"></div>`.
- Ao clicar em uma aba na sidebar, um roteador em JavaScript interceptará o clique, atualizará a classe `active` no menu lateral e carregará o respectivo módulo JS.
- Cada aba terá um módulo JS associado em um diretório de módulos:
  - `modules/registros.js` (Aba de Devocionais)
  - `modules/oracoes.js` (Aba de Pedidos de Oração)
  - `modules/igreja.js` (Aba de Atividades da Igreja)
  - `modules/bencaos.js` (Aba do Diário de Bênçãos)
- Cada módulo exporá uma função `render()` que retornará o HTML dinâmico da tela e ligará os escutadores de eventos necessários (como cliques de salvar, formulários, etc.).

---

## 3. O Novo "Diário de Bênçãos"
O Diário de Bênçãos será uma seção premium focada no registro de orações respondidas e testemunhos de milagres ou providências.

### Requisitos Funcionais do Diário de Bênçãos:
1. **Cadastro de Bênçãos:**
   - **Título da Bênção:** Identificador curto da gratidão.
   - **Data do Acontecimento:** Data em que a bênção foi recebida (padrão: hoje).
   - **Relato/Texto:** Descrição rica do acontecimento (usando Quill Editor para formatação de texto rico).
   - **Palavras-chave/Tags:** Tags rápidas para catalogar a bênção (ex: `Financeiro`, `Saúde`, `Família`).
2. **Visualização em Timeline/Feed:**
   - Exibir os registros em ordem cronológica reversa (mais recentes primeiro).
   - Layout premium com cartões flutuantes, efeito de hover suave e transições animadas.
   - Ícone identificador de "Mão de Gratidão" ou "Coração/Estrela".
3. **Filtros e Busca Inteligente:**
   - Campo de busca rápida por texto (título, relato ou tag).
   - Filtro por período de datas (Data Inicial e Data Final).
   - Filtro rápido por tags pré-existentes.
4. **Armazenamento e Segurança (Firestore):**
   - Salvo em uma coleção dedicada: `blessings`.
   - Cada documento conterá: `userId` (para segurança), `title`, `date`, `description` (texto rico), `tags` (array de strings) e `createdAt`/`updatedAt`.
   - Regras de segurança no Firestore garantindo que apenas o criador possa ler e escrever em suas bênçãos.

---

## 4. Estrutura de Arquivos Final do Projeto

```text
├── index.html            # Shell único da aplicação (SPA)
├── admin.html            # Painel Administrativo Standalone (Isolado)
├── style.css             # Design System centralizado (CSS unificado)
├── script.js             # Roteador central, inicialização Firebase e Auth
├── admin.js              # Lógica de controle do Hub Admin
├── sw.js                 # Service Worker (PWA)
└── modules/              # Nova pasta contendo as telas dinâmicas
    ├── registros.js      # Módulo Devocionais (Antigo index)
    ├── oracoes.js        # Módulo Pedidos de Oração
    ├── igreja.js         # Módulo Scale/Eventos da Igreja
    └── bencaos.js        # Módulo Diário de Bênçãos
```

---

## 5. Casos de Uso e Controle de Acessos
- **Whitelisting e Abas:** O sistema de permissões atual baseado no campo `features` do Firestore (`['registros', 'oracoes', 'igreja', 'bencaos']`) continuará ativo!
- **Ocultação e Rota Segura:**
  - O roteador em `script.js` lerá as permissões do usuário logado.
  - Se o usuário não tiver permissão para `'bencaos'`, a aba "Diário de Bênçãos" não aparecerá na sidebar.
  - Se ele tentar forçar o carregamento via estado do hash (ex: `index.html#bencaos`), o roteador o redirecionará para sua primeira aba permitida.
