# Tarefas: Busca Instantânea e Toggle de Favoritos nos Registros

## Visão geral

A implementação será feita em quatro etapas sequenciais: interface, mecanismo de busca, integração com a lista completa e revisão/cache.

## Tarefa 1 — Substituir a interface de filtros

Status: Concluída

### Objetivo

Remover o painel expansível e inserir a barra com busca, limpeza, toggle de favoritos e sorteio.

### Arquivos afetados

* `modules/registros.js`
* `style.css`

### Dependências

Nenhuma.

### Critério de conclusão

O painel antigo não é renderizado e a nova barra possui controles acessíveis e responsivos, ainda sem ativar o mecanismo final de busca.

### Teste manual

Abrir Registros em mobile e desktop e conferir campo, toggle e sorteio sem sobreposição ou compressão indevida.

### Observações

Preservar os IDs necessários somente para os novos controles.

## Tarefa 2 — Implementar busca completa e relevância

Status: Concluída

### Objetivo

Criar o índice normalizado, pesquisar todos os campos desde o primeiro caractere e ordenar resultados por relevância.

### Arquivos afetados

* `modules/registros.js`

### Dependências

Tarefa 1.

### Critério de conclusão

Consultas parciais, sem acentos, numéricas e por mês/ano retornam a coleção completa em tempo real e na ordem definida.

### Teste manual

Pesquisar `Ab`, `abraao`, `2024`, `setembro`, `setembro 2028`, um autor, um tema e trecho interno do conteúdo.

### Observações

Tags HTML não devem entrar no índice.

## Tarefa 3 — Integrar favoritos, paginação e sorteio

Status: Concluída

### Objetivo

Combinar o toggle com a busca, preservar o feed paginado padrão e fazer o sorteio/favoritação respeitarem o estado ativo.

### Arquivos afetados

* `modules/registros.js`

### Dependências

Tarefa 2.

### Critério de conclusão

Favoritos usa a coleção completa, restringe a busca quando preenchida, volta à paginação ao desligar sem busca e o sorteio usa os resultados ativos.

### Teste manual

Alternar favoritos com campo vazio e preenchido, desfavoritar um resultado, limpar a busca e desligar o toggle.

### Observações

Suspender o observador enquanto a visualização completa estiver ativa.

## Tarefa 4 — Atualizar cache e revisar

Status: Concluída

### Objetivo

Incrementar as versões da PWA, executar verificações e registrar a revisão final.

### Arquivos afetados

* `index.html`
* `script.js`
* `sw.js`
* `specs/busca-instantanea-registros/review.md`

### Dependências

Tarefas 1, 2 e 3.

### Critério de conclusão

As verificações passam, o cache novo é referenciado e a revisão compara a entrega com a especificação.

### Teste manual

Reabrir a PWA após a publicação e repetir os fluxos principais.

### Observações

Registrar limitações reais encontradas nos testes.
