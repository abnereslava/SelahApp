# Tarefas: Compartilhamento de Registro em PDF

## Visão geral

A implementação será feita em tarefas sequenciais: primeiro a correção independente da trilha, depois a interface e geração do PDF, em seguida o compartilhamento/fallback e, por fim, cache e revisão.

## Tarefa 1 — Montar a trilha com a coleção completa

Status: Concluída

### Objetivo

Fazer o modo leitura encontrar pais e filhos ainda não paginados no feed.

### Arquivos afetados

* `modules/registros.js`

### Dependências

Nenhuma.

### Critério de conclusão

Uma trilha com título antigo presente somente em `statsRecords` aparece completa ao abrir um registro recente antes de rolar o feed.

### Teste manual

Reabrir o app, não rolar o feed, abrir um registro recente que continua um antigo e conferir todos os títulos na trilha.

### Observações

O feed deve continuar paginado.

## Tarefa 2 — Adicionar botão e documento de exportação

Status: Concluída

### Objetivo

Adicionar o botão responsivo para todos os tipos de registro e construir o elemento temporário contendo somente o registro aberto.

### Arquivos afetados

* `index.html`
* `modules/registros.js`
* `style.css`

### Dependências

Tarefa 1.

### Critério de conclusão

O botão aparece apenas no modo leitura, na posição prevista, e o elemento de exportação não contém trilha nem ações.

### Teste manual

Abrir registros de tipos diferentes no mobile e desktop e conferir a posição do botão e o conteúdo preparado para exportação.

### Observações

Não incluir `chainHtml` no documento temporário.

## Tarefa 3 — Gerar e compartilhar o PDF

Status: Concluída

### Objetivo

Gerar um PDF A4 local, compartilhar o arquivo quando suportado e baixá-lo nos demais casos.

### Arquivos afetados

* `modules/registros.js`

### Dependências

Tarefa 2 e `html2pdf.js` carregado.

### Critério de conclusão

Um PDF válido é produzido com somente o registro aberto; o compartilhamento nativo recebe o arquivo ou o fallback inicia o download.

### Teste manual

Gerar PDF de registro curto e longo, abrir o arquivo e testar compartilhamento no Android e download em navegador sem suporte a arquivos.

### Observações

Cancelamento do seletor não deve ser tratado como falha de geração.

## Tarefa 4 — Atualizar cache e revisar

Status: Concluída

### Objetivo

Atualizar as versões da PWA, executar verificações e registrar o resultado em `review.md`.

### Arquivos afetados

* `index.html`
* `script.js`
* `sw.js`
* `specs/compartilhamento-trilha/review.md`

### Dependências

Tarefas 1, 2 e 3.

### Critério de conclusão

Os arquivos passam nas verificações, a nova versão é carregada pela PWA e a revisão compara a entrega com a especificação.

### Teste manual

Fechar/reabrir a PWA, confirmar a versão nova e repetir os fluxos de trilha e PDF.

### Observações

Registrar qualquer limitação real encontrada na geração do PDF.
