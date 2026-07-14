# Tarefas: Tema de Fundo Dinâmico

## Visão geral

Implementação em 5 tarefas: remover dark mode, adicionar camadas de fundo + variáveis por horário, aplicar a lógica de horário em JS, tornar janelas translúcidas (blindando leitura/escrita) e cachear a imagem no SW. Ao final, bump de versões e teste manual.

## Tarefa 1 — Remover dark mode não utilizado

Status: Concluída

### Objetivo
Limpar o bloco `[data-theme="dark"]` e referências correlatas do `style.css`, já que não está em uso.

### Arquivos afetados
- `style.css`

### Dependências
Nenhuma.

### Critério de conclusão
Nenhuma regra `[data-theme="dark"]` permanece; app continua idêntico no tema claro.

### Teste manual
Abrir o app: aparência clara inalterada; nenhum erro no console.

### Observações
Não remover as variáveis do `:root` (tema claro) — apenas o bloco dark.

## Tarefa 2 — Camadas de fundo (imagem + overlay por horário) no CSS

Status: Concluída

### Objetivo
Adicionar a imagem de fundo fixa e a camada de overlay de cor controlada por `[data-tod]`, com variáveis centralizadas e fallback de cor sólida.

### Arquivos afetados
- `style.css`

### Dependências
Tarefa 1.

### Critério de conclusão
Com `data-tod` setado manualmente no `<html>`, o fundo mostra a imagem e o overlay muda entre dia/tarde/noite.

### Teste manual
No DevTools, setar `document.documentElement.dataset.tod='tarde'` e `'noite'` e ver o filtro mudar.

### Observações
Fundo em pseudo-elementos fixos com `z-index` negativo; garantir `body` transparente por cima.

## Tarefa 3 — Lógica de horário em JS

Status: Concluída

### Objetivo
Implementar `applyTimeOfDayTheme()` que escolhe a faixa pela hora local e seta `data-tod`; registrar reavaliação em `visibilitychange`/`focus` e por intervalo.

### Arquivos afetados
- `script.js`

### Dependências
Tarefa 2.

### Critério de conclusão
Ao abrir o app, `data-tod` corresponde à hora atual; muda ao cruzar faixa (verificável mudando o relógio/hora).

### Teste manual
Abrir em horários diferentes (ou mockar) e confirmar a faixa aplicada.

### Observações
Constantes de faixa centralizadas e comentadas para fácil ajuste.

## Tarefa 4 — Janelas translúcidas (blindando leitura/escrita)

Status: Concluída

### Objetivo
Tornar translúcidas sidebar, cartões, stats-card, filtros, fab-sheet, toolbar e modais; manter leitura de registro, editor e formulário com fundo legível.

### Arquivos afetados
- `style.css`

### Dependências
Tarefas 2 e 3.

### Critério de conclusão
Listas/menus deixam ver o fundo; leitura e escrita permanecem plenamente legíveis. Fallback `@supports not (backdrop-filter)`.

### Teste manual
Navegar nas listas (vê o fundo) e abrir leitura + formulário (texto legível) em dia/tarde/noite.

### Observações
Cuidar de contraste e desempenho de `backdrop-filter` em mobile.

## Tarefa 5 — Cache da imagem no service worker + bump de versões

Status: Concluída

### Objetivo
Cachear a imagem de fundo no SW com fallback e atualizar versões (sw/css/js/import).

### Arquivos afetados
- `sw.js`, `index.html`, `script.js`

### Dependências
Tarefas 1–4.

### Critério de conclusão
Após um acesso online, o fundo persiste offline (ou cai no fallback sem quebrar). Versões atualizadas.

### Teste manual
DevTools → Offline após 1 carregamento; recarregar e conferir fundo/fallback.

### Observações
Envolver o cache cross-origin em try/catch para não quebrar a instalação do SW.
