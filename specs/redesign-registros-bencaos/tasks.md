# Tarefas: Redesign das Áreas de Registro e Visualização (Registros e Bênçãos)

## Visão geral

7 tarefas sequenciais: primeiro o CSS base, depois o formulário de Registros, a lista de Registros, o modo leitura, skeleton e estado vazio, e por último replicar tudo em Bênçãos.

---

## Tarefa 1 — CSS base: formulário underline, cards, overlay, skeleton, empty state

Status: Concluída

### Objetivo

Criar todas as classes CSS necessárias para os novos componentes antes de qualquer mudança nos módulos JS. Nenhuma mudança funcional nesta tarefa.

### Arquivos afetados

- `style.css`

### Dependências

Nenhuma.

### Critério de conclusão

As seguintes classes existem e produzem os efeitos corretos quando aplicadas manualmente:
- `.form-field-underline` — input com apenas borda inferior, sem borda completa
- `.form-field-underline:focus` — borda inferior dourada com glow suave
- `.floating-label` — label que flutua acima do campo quando há foco ou valor
- `.record-card` — card compacto com padding, borda sutil, cursor pointer
- `.record-card .card-header` — linha com título, data e chip de tipo
- `.record-card .card-body` — área colapsada (height: 0, overflow: hidden)
- `.record-card.expanded .card-body` — área expandida com transição suave
- `.record-type-chip` — chip colorido para o tipo de registro
- `.reading-overlay` — overlay fullscreen com fundo escuro semitransparente
- `.reading-content` — container centralizado com tipografia grande
- `.skeleton-card` — card com barras pulsando (animação `skeleton-pulse`)
- `.empty-state` — container centralizado com ícone e mensagem

### Teste manual

DevTools: aplicar classes no HTML existente para verificar efeitos visuais.

### Observações

- Chips de tipo: cada `recordType` pode ter uma cor sutil diferente (ex: `devocional` → dourado, `culto_domestico` → azul acinzentado, etc.) — usar modificadores `.chip-devocional`, `.chip-culto`, etc.
- Transição de expansão do card: preferir `grid-template-rows: 0fr → 1fr` se `max-height` gerar atraso perceptível.

---

## Tarefa 2 — Redesenho do formulário em registros.js

Status: Concluída

### Objetivo

Substituir o HTML do formulário `<details>` accordion em `registros.js` pelo novo design com campos underline, labels flutuantes, agrupamento de campos opcionais em seção "Detalhes adicionais", e botão de salvar redesenhado. Todos os `id` dos campos devem permanecer idênticos para não quebrar a lógica existente.

### Arquivos afetados

- `modules/registros.js` — somente a string de template HTML do formulário

### Dependências

Tarefa 1 concluída.

### Critério de conclusão

- O formulário aparece com o novo visual (campos underline, labels maiores).
- Criar, editar e cancelar edição funcionam normalmente.
- Campos obrigatórios (título, data, passagem, tipo) continuam com validação.
- Campos opcionais agrupados em seção "Detalhes adicionais" colapsável.
- Editor Quill inicializa e funciona dentro do novo container.

### Teste manual

1. Abrir a aba Registros.
2. Preencher e salvar um novo registro.
3. Editar um registro existente → verificar pré-preenchimento.
4. Cancelar edição → verificar que formulário limpa.
5. Verificar visual no mobile (375px) e desktop.

### Observações

- Não alterar nenhum `id` de campo, pois a lógica de leitura, validação e pré-preenchimento depende deles.
- Não alterar a lógica de `initRegistros()` ou qualquer função — apenas o HTML template.

---

## Tarefa 3 — Redesenho da lista de registros em registros.js

Status: Concluída

### Objetivo

Substituir a renderização de lista atual por cards compactos com expansão inline. Cada card mostra título, data formatada e chip de tipo. Ao expandir, mostra o conteúdo Quill e os botões de ação. Incluir filtro redesenhado.

### Arquivos afetados

- `modules/registros.js` — funções de renderização de lista

### Dependências

Tarefa 2 concluída.

### Critério de conclusão

- Lista renderiza como cards compactos.
- Toque/clique no card expande com animação.
- Conteúdo do registro é exibido corretamente dentro do card expandido.
- Botões Editar e Excluir funcionam como antes.
- Filtro por keyword e datas funciona.
- Apenas um card pode estar expandido por vez (opcional: colapsar o anterior ao expandir novo).

### Teste manual

1. Verificar renderização da lista com múltiplos registros.
2. Clicar em um card → expandir.
3. Clicar novamente → colapsar.
4. Clicar em Editar → formulário pré-preenchido.
5. Clicar em Excluir → confirmação e remoção.
6. Aplicar filtro → verificar resultados filtrados.

### Observações

- Formatar a data de forma legível: `31 Mai 2026` ao invés de `2026-05-31`.
- Preservar toda a lógica de filtro existente, apenas redesenhar o HTML da seção de filtros.

---

## Tarefa 4 — Modo leitura dedicado em registros.js

Status: Concluída

### Objetivo

Implementar o overlay de modo leitura que abre ao clicar em "Ler" dentro de um card expandido. Exibe título, data e conteúdo completo com tipografia grande e confortável.

### Arquivos afetados

- `modules/registros.js` — função `openReadingMode(record)`

### Dependências

Tarefa 3 concluída.

### Critério de conclusão

- Botão "Ler" aparece em cards expandidos.
- Clicar abre o overlay com título, data e conteúdo renderizado.
- Botão fechar remove o overlay com fade-out.
- Tecla ESC fecha o overlay.
- Conteúdo Quill HTML é sanitizado antes de inserido no overlay.

### Teste manual

1. Expandir um card.
2. Clicar em "Ler".
3. Verificar tipografia, espaçamento e conteúdo.
4. Fechar com botão e com ESC.
5. Testar em mobile: scroll do conteúdo longo funciona dentro do overlay.

### Observações

- O conteúdo Quill é HTML — já está sendo exibido no card, usar a mesma abordagem.
- Garantir que o overlay não quebra em iOS com `position: fixed` e teclado virtual (sem inputs no overlay).

---

## Tarefa 5 — Skeleton loader e estado vazio em registros.js

Status: Concluída

### Objetivo

Exibir skeleton cards durante o carregamento inicial da lista. Exibir estado vazio se a lista retornar sem registros.

### Arquivos afetados

- `modules/registros.js`

### Dependências

Tarefas 3 e 4 concluídas.

### Critério de conclusão

- Skeleton de 3 cards aparece enquanto o Firestore retorna dados.
- Ao carregar, skeletons são substituídos pelos cards reais.
- Se a lista está vazia, exibe `.empty-state` com ícone e mensagem inspiracional.

### Teste manual

- Simular conexão lenta no DevTools (Network → Slow 3G) e verificar skeleton.
- Remover todos os registros e verificar estado vazio.

### Observações

- Mensagem do estado vazio: "Comece seu diário espiritual. Registre o que o Senhor falou ao seu coração hoje."

---

## Tarefa 6 — Replicar redesign em bencaos.js

Status: Concluída

### Objetivo

Aplicar as mesmas mudanças de Tarefas 1–5 no módulo `bencaos.js`, adaptando para os campos específicos (título, data, tags, relato/testemunho). Manter as estatísticas existentes (total de bênçãos, este mês, tag principal) redesenhadas como cards de estatística no topo.

### Arquivos afetados

- `modules/bencaos.js`

### Dependências

Tarefas 1–5 concluídas.

### Critério de conclusão

- Formulário de bênçãos com o mesmo novo visual (campos underline).
- Lista de bênçãos como timeline de cards compactos expansíveis.
- Modo leitura funciona para bênçãos.
- Skeleton e estado vazio presentes.
- Estatísticas (total, este mês, tag principal) visíveis no topo como cards.
- Botão "Recordar Bênção" (aleatória) mantido e redesenhado.
- Filtro de bênçãos mantido e redesenhado.

### Teste manual

1. Criar nova bênção.
2. Editar bênção existente.
3. Expandir card de bênção e abrir modo leitura.
4. Verificar estatísticas no topo.
5. Verificar estado vazio.

### Observações

- Mensagem do estado vazio de bênçãos: "Registre as bênçãos que o Senhor derramou sobre você. A gratidão transforma o coração."
- Botão "Recordar Bênção Aleatória" deve ter destaque visual sutil (ícone ph-shuffle).
