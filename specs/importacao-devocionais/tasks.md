# Tarefas: Importação de Devocionais em Lote (Admin)

## Visão geral

Implementação em 4 tarefas: UI → utilitários/conversão → validação+preview+dedup
→ gravação+log. Tudo em `admin.html` e `admin.js`, sem tocar `style.css`/`sw.js`.

---

## Tarefa 1 — UI da seção "Importar Devocionais"

Status: Concluída

### Objetivo

Adicionar o markup e os estilos da nova seção no Painel Admin: seletor de conta
de destino, campo de UID, textarea + upload `.json`, botões de validar e importar,
área de preview e console de log.

### Arquivos afetados

- `admin.html` (markup + `<style>` inline existente)

### Dependências

Nenhuma.

### Critério de conclusão

- Seção visível no Painel Admin com todos os controles.
- `<select>` de destino + input de UID (espelhando o padrão da migração).
- Textarea para JSON + `<input type="file" accept=".json">`.
- Botões "Validar e pré-visualizar" e "Importar" (este desabilitado inicialmente).
- Containers vazios para preview e log.

### Teste manual

Abrir `admin.html` como admin; a seção aparece e os controles renderizam sem
quebrar o layout. Em telas estreitas, os campos empilham.

---

## Tarefa 2 — Utilitários: defaults, normalização, Markdown→HTML, assinatura

Status: Concluída

### Objetivo

Implementar em `admin.js` as funções puras de apoio.

### Arquivos afetados

- `admin.js`

### Dependências

Tarefa 1.

### Critério de conclusão

- `mdToHtml(md)`: escapa HTML e converte parágrafos, **negrito**, *itálico*,
  títulos `#`/`##`, listas `-`/`*` e quebras de linha.
- `normalizeItem(raw)`: aplica defaults (recordType→`devocional`,
  recordFormat→`livre`, listas→`[]`, strings→`""`, date ausente→`""`), normaliza
  tipos triviais (string em `keywords`/`author` → lista) e retorna `{ doc, warnings }`.
- `buildSignature(docLike)`: gera a assinatura de deduplicação.
- `populateImportTargets()`: popula o `<select>` reutilizando
  `getMigrationTargetOptions()`.

### Teste manual

No console do navegador, chamar `mdToHtml("**a** *b*\n\nlinha")` e conferir o HTML;
`normalizeItem({})` retorna doc com defaults e avisos.

### Observações

`mdToHtml` deve escapar `& < >` antes de aplicar transformações (sanitização).

---

## Tarefa 3 — Validação, preview e deduplicação

Status: Concluída

### Objetivo

Ligar o botão "Validar e pré-visualizar": parsear o JSON, validar, detectar
duplicatas contra os registros existentes do destino e dentro do lote, e renderizar
o preview com avisos.

### Arquivos afetados

- `admin.js`

### Dependências

Tarefas 1 e 2.

### Critério de conclusão

- Parse com try/catch e mensagens de erro (JSON inválido / não-array / vazio).
- Carrega `devotionals` do UID de destino e monta o set de assinaturas existentes.
- Cada item: normalizado, com flag de duplicata (existente ou intra-lote) e lista
  de avisos.
- Preview renderizado (título, data/"sem data", tipo, formato, avisos, duplicata).
- Botão "Importar" habilitado apenas se houver ao menos 1 item não-duplicado e UID
  válido. Guarda o resultado validado em estado para a Tarefa 4.

### Teste manual

Colar JSON de exemplo (livre + orientado, item sem data, tipo inválido, item
duplicado) e conferir o preview e os avisos. Recarregar com o mesmo JSON já
importado → tudo marcado como duplicata.

---

## Tarefa 4 — Gravação sequencial, log e resumo

Status: Concluída

### Objetivo

Ligar o botão "Importar": gravar item a item em `devotionals` (pulando duplicatas),
logar progresso e exibir resumo final.

### Arquivos afetados

- `admin.js`

### Dependências

Tarefa 3.

### Critério de conclusão

- Confirmação antes de gravar (contagem + email de destino).
- Loop sequencial: pula duplicatas; monta o doc final (com `userId`, `createdAt`,
  `updatedAt`, `content` conforme formato); `addDoc`.
- Log de progresso a cada N itens e por falha.
- Resumo final: importados / pulados / falhas. Botão reabilitado ao terminar.

### Teste manual

Importar um lote pequeno; conferir no app (conta de destino) que os registros
aparecem, abrem e exibem o conteúdo formatado. Conferir que duplicatas não geram
novos documentos.

### Observações

Importação não-transacional: falha isolada não interrompe o restante; reportar no log.
