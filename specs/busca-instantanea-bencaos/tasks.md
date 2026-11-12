# Tarefas: Busca Instantânea e Toggle de Favoritos em Bênçãos

## Visão geral

A implementação seguirá quatro etapas: interface, mecanismo de busca, integração com os fluxos da lista e revisão/cache.

## Tarefa 1 — Substituir a interface de filtros

Status: Concluída

### Objetivo

Remover o painel expansível e inserir a barra com busca, limpeza, favoritas e **Recordar Bênção**.

### Arquivos afetados

* `modules/bencaos.js`

### Dependências

Nenhuma.

### Critério de conclusão

O painel antigo não é renderizado e a nova barra reutiliza o padrão responsivo de Registros.

### Teste manual

Abrir Bênçãos em mobile e desktop e conferir os quatro elementos da barra.

### Observações

Reutilizar o CSS existente, sem duplicar estilos.

## Tarefa 2 — Implementar fonte completa, busca e relevância

Status: Concluída

### Objetivo

Indexar título, relato, tags e data da coleção completa e ordenar resultados por relevância.

### Arquivos afetados

* `modules/bencaos.js`

### Dependências

Tarefa 1.

### Critério de conclusão

Consultas parciais, sem acento, numéricas e por mês/ano retornam todas as bênçãos correspondentes na ordem definida.

### Teste manual

Pesquisar `Ab`, `2024`, `setembro`, `setembro 2028`, uma tag e trecho do relato.

### Observações

Não reconstruir o índice a cada tecla.

## Tarefa 3 — Integrar favoritas, paginação e ações

Status: Concluída

### Objetivo

Combinar o toggle com a busca e adaptar leitura, edição, favorito, sentinela e sorteio à coleção completa.

### Arquivos afetados

* `modules/bencaos.js`

### Dependências

Tarefa 2.

### Critério de conclusão

Favoritas e busca funcionam juntas, resultados não paginados abrem normalmente e desligar ambos restaura a paginação.

### Teste manual

Alternar favoritas, abrir um item antigo, desfavoritá-lo, limpar a busca e usar **Recordar Bênção**.

### Observações

Sincronizar `statsBlessings` e `allBlessings` após favoritar.

## Tarefa 4 — Atualizar cache e revisar

Status: Concluída

### Objetivo

Incrementar versões, executar verificações e registrar `review.md`.

### Arquivos afetados

* `index.html`
* `script.js`
* `sw.js`
* `specs/busca-instantanea-bencaos/review.md`

### Dependências

Tarefas 1, 2 e 3.

### Critério de conclusão

As verificações passam, o cache é renovado e a revisão compara a entrega com a especificação.

### Teste manual

Reabrir a PWA após a publicação e repetir os fluxos principais.

### Observações

Registrar limitações reais dos testes disponíveis.
