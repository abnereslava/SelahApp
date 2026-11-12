# Tarefas: Normalização Tipográfica dos Registros

## Visão geral

Implementar normalização conservadora, validar em prévia, aplicar com cópia de segurança e conferir registros reais.

## Tarefa 1 — Normalizador HTML

Status: Em andamento

### Objetivo

Criar transformação determinística para títulos Markdown, versículos, espaços vazios, separadores e resíduos do Quill.

### Arquivos afetados

* `admin.js`

### Dependências

Nenhuma.

### Critério de conclusão

As amostras de cada regra produzem HTML válido sem alterar o texto autoral.

### Teste manual

Executar a prévia e conferir as estatísticas.

### Observações

Estruturas ambíguas devem permanecer inalteradas.

## Tarefa 2 — Interface administrativa

Status: Pendente

### Objetivo

Adicionar seleção de conta, prévia, aplicação e console de progresso.

### Arquivos afetados

* `admin.html`
* `admin.js`

### Dependências

Tarefa 1.

### Critério de conclusão

A prévia não grava dados e a aplicação exige resultado prévio compatível com a conta selecionada.

### Teste manual

Selecionar uma conta e executar a prévia.

### Observações

A execução deve ignorar documentos já migrados.

## Tarefa 3 — Semântica do formato orientado

Status: Pendente

### Objetivo

Renderizar perguntas orientadoras como títulos `h2` no modo leitura.

### Arquivos afetados

* `modules/registros.js`

### Dependências

Nenhuma.

### Critério de conclusão

Perguntas orientadoras usam `h2` nas duas visualizações do registro.

### Teste manual

Abrir um registro orientado e inspecionar a hierarquia visual.

### Observações

O editor continua armazenando as perguntas separadamente.

## Tarefa 4 — Publicação, execução e verificação

Status: Pendente

### Objetivo

Publicar a ferramenta, aplicar na conta escolhida e conferir amostras após a atualização.

### Arquivos afetados

* `specs/normalizacao-tipografica-registros/review.md`

### Dependências

Tarefas 1 a 3.

### Critério de conclusão

Totais da execução registrados e amostras de ambos os formatos verificadas.

### Teste manual

Reabrir registros atualizados no modo leitura.

### Observações

Não excluir registros nem alterar campos autorais fora de `content`.
