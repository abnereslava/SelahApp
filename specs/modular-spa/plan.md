# Plano de Implementação - Selah Modular SPA & Diário de Bênçãos

Este plano detalha as especificações técnicas, regras de banco de dados, fluxos de roteamento SPA e a estrutura interna dos módulos dinâmicos em Javascript.

---

## 1. Regras de Banco de Dados (Firestore)
Criaremos uma nova coleção chamada `blessings` no Firestore para armazenar os relatos de bênçãos de cada usuário.

### Estrutura do Documento (`blessings`):
- `userId`: **String** (UID do Firebase Auth do usuário criador)
- `title`: **String** (Título da bênção)
- `date`: **String** (Data no formato YYYY-MM-DD em que a bênção foi recebida)
- `description`: **String** (Relato formatado em HTML rico via Quill)
- `tags`: **Array of Strings** (Palavras-chave como `['saude', 'familia', 'financeiro']`)
- `createdAt`: **String** (ISO Date da gravação)
- `updatedAt`: **String** (ISO Date da última edição)

### Regras de Segurança (Firestore Rules):
Adicionar a seguinte regra no console do Firebase para a coleção `blessings`:
```javascript
match /blessings/{blessingId} {
  allow read, write: if request.auth != null && (
    request.auth.token.email.toLowerCase() == 'abner.eslava@gmail.com' ||
    request.auth.uid == resource.data.userId || 
    request.auth.uid == request.resource.data.userId
  );
}
```

---

## 2. O Roteador SPA por Hash (`#`)
Substituiremos a navegação física tradicional por um roteador client-side em `script.js` baseado na mudança da hash da URL (`window.location.hash`).

### Fluxo de Inicialização e Roteamento:
1. No carregamento da página, o `script.js` detecta se o usuário está logado e autorizado via `onAuthStateChanged`.
2. Obtém as permissões do usuário em `features` (ex: `['registros', 'oracoes', 'igreja', 'bencaos']`).
3. Adiciona um escutador de eventos para mudança de hash:
   ```javascript
   window.addEventListener('hashchange', handleRouteChange);
   ```
4. A função `handleRouteChange()` fará:
   - Ler a hash atual (ex: `const page = window.location.hash.substring(1) || 'registros'`).
   - Validar se a página solicitada está no array de permissões do usuário. Se não estiver, redirecionar para a primeira permitida.
   - Chamar o módulo JavaScript correspondente, limpar o container principal `#spaContent` e injetar o HTML renderizado.
   - Executar a inicialização do módulo (escutadores de eventos, Quill, TagManager, gráficos, etc.).

---

## 3. Modularização das Telas (Modules Design)
Cada aba será representada por um módulo Javascript contendo sua estrutura e comportamento isolados.

### Mapeamento dos Módulos:
1. **`registros.js`:**
   - **HTML:** Formulário de devocionais (livre e orientado), container de tags, timeline/feed de devocionais, estatísticas com gráficos Chart.js e filtros.
   - **JS:** Gerenciamento dos estados de edição, formulários de envio de devocionais, indexação de palavras-chave, autocomplete de trilhas de leitura e inicialização do editor Quill.
2. **`bencaos.js` (Nova funcionalidade):**
   - **HTML:** Formulário simplificado de bênçãos (Título, Data, Relato rico e Tags), Timeline cronológica reversa, filtros de data/texto e área de estatísticas (contadores).
   - **JS:** CRUD de bênçãos no Firestore, inicializador Quill independente para bênçãos, gerenciador de tags (instanciado no `TagManager`), filtros client-side e tratamento de exclusão/edição.
3. **`oracoes.js` & `igreja.js`:**
   - **HTML/JS:** Estrutura moderna contendo layouts premium temporários (Placeholders atrativos) integrados com a barra de navegação da SPA central.

---

## 4. Alterações em Arquivos de Código

### `index.html` (Refactoring):
- **O que sai:** O formulário completo de devocionais, contêiner de timeline, modais de filtragem e gráficos (toda a área dentro de `<main class="main-content">`) serão movidos para `modules/registros.js`.
- **O que entra:**
  - A barra lateral de navegação com links contendo o hash:
    - `<a href="#registros" class="nav-item active"><i class="ph ph-notebook"></i><span>Registros</span></a>`
    - `<a href="#oracoes" class="nav-item"><i class="ph ph-hands-praying"></i><span>Orações</span></a>`
    - `<a href="#igreja" class="nav-item"><i class="ph ph-church"></i><span>Igreja</span></a>`
    - `<a href="#bencaos" class="nav-item"><i class="ph ph-gift"></i><span>Bênçãos</span></a>`
  - Um único ponto de montagem central:
    ```html
    <main class="main-content">
        <div id="spaContent">
            <!-- Injetado dinamicamente pelos módulos JS -->
        </div>
    </main>
    ```

### `script.js` (Refactoring):
- A lógica de banco de dados e gerenciamento de devocionais (`fetchAll`, `renderFeed`, `renderChart`, formulários, etc.) será transferida para `modules/registros.js`.
- `script.js` passará a atuar estritamente como o **core** da aplicação: roteamento, autenticação Google, Whitelist de emails, inicialização do Firebase e eventos globais da interface (como o fechamento da sidebar mobile).
