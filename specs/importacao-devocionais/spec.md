# Especificação: Importação de Devocionais em Lote (Admin)

## 1. Objetivo

Permitir que o Administrador Master insira, de uma só vez, uma coleção de
devocionais históricos (digitados em outros apps ou escritos à mão e depois
transcritos com auxílio de IA) em uma conta de usuário específica do Selah. A
entrada é um arquivo/texto **JSON** contendo um array de devocionais, com o
corpo de cada um escrito em **Markdown**. O sistema valida, mostra um preview e
grava os registros na coleção `devotionals` do Firestore associados ao `userId`
da conta escolhida.

## 2. Contexto

O usuário possui uma vida inteira de devocionais fora do app. O fluxo previsto é:

1. Fotografar/printar o devocional original.
2. Pedir a uma IA que transcreva e organize cada devocional no formato JSON
   definido nesta spec (campos podem faltar — a IA preenche o que conseguir).
3. No Painel Admin, colar/enviar o JSON, escolher a conta de destino, revisar o
   preview e confirmar a importação.

O Painel Admin (`admin.html` + `admin.js`) já existe e já possui um mecanismo de
seleção de conta de destino (email → UID) usado pela ferramenta de migração
(`getMigrationTargetOptions`, `migrationTargetUid`). A importação reaproveita
esse mecanismo. O modelo de dados de um devocional já está consolidado no módulo
`modules/registros.js` (função de submit do `devotionalForm`).

## 3. Usuários envolvidos

- **Administrador Master** (`abner.eslava@gmail.com`): único perfil com acesso ao
  Painel Admin e, portanto, à importação. Pode importar para qualquer conta
  presente na whitelist (incluindo a própria).

## 4. Funcionamento esperado

### 4.1 Nova seção no Painel Admin

Uma nova seção "Importar Devocionais" em `admin.html`, contendo:

- Seletor da **conta de destino** (reaproveita a lista email → UID já existente).
- Campo de **UID de destino** (preenchido automaticamente ao escolher a conta;
  editável manualmente como fallback, igual à migração).
- **Área de texto** (textarea) para colar o JSON **e/ou** um seletor de arquivo
  `.json` para upload. [Sugestão] suportar os dois; no mínimo a textarea.
- Botão **"Validar e pré-visualizar"**.
- Área de **preview**: lista os devocionais detectados, com indicação de campos
  faltantes/avisos por item (ex.: "sem data", "tipo padrão aplicado").
- Botão **"Importar N devocionais"** (habilitado só após validação sem erros
  bloqueantes).
- **Console de log** de progresso (igual ao da migração), informando sucesso/erro
  por item e total ao final.

### 4.2 Formato de entrada (JSON)

O JSON é um **array** de objetos. Cada objeto representa um devocional:

```json
[
  {
    "title": "O Bom Pastor",
    "date": "2019-03-14",
    "mainPassage": "João 10",
    "recordType": "devocional",
    "recordFormat": "livre",
    "content_md": "O Senhor é o pastor que **conhece** as ovelhas...\n\nSegundo parágrafo.",
    "author": ["Pr. Fulano"],
    "relatedPassages": "Salmos 23; Ezequiel 34",
    "keywords": ["cuidado", "pastoreio"]
  },
  {
    "title": "Estudo de Romanos 8",
    "date": null,
    "mainPassage": "Romanos 8",
    "recordType": "ebd",
    "recordFormat": "orientado",
    "questions": [
      { "q": "O que o texto afirma sobre o Espírito?", "a_md": "Que Ele intercede..." },
      { "q": "Como aplicar hoje?", "a_md": "..." }
    ]
  }
]
```

### 4.3 Conversão e mapeamento

Para cada item do array, o importador monta um documento da coleção
`devotionals` com a mesma estrutura usada pelo app:

| Campo no JSON de entrada | Campo gravado no Firestore | Conversão |
|---|---|---|
| `title` | `title` | string; default `""` |
| `date` | `date` | `AAAA-MM-DD`; se ausente/`null` → `""` (sinalizado) |
| `mainPassage` | `mainPassage` | string; default `""` |
| `recordType` | `recordType` | enum válido; default `devocional` |
| `recordFormat` | `recordFormat` | `livre`/`orientado`; default `livre` |
| `content_md` | `content.texto` | Markdown → HTML |
| `questions[].a_md` | `content.questions[].a` | Markdown → HTML; `q` copiado direto |
| `author` | `author` | lista de strings; default `[]` |
| `relatedPassages` | `relatedPassages` | string; default `""` |
| `keywords` | `keywords` | lista (máx. 3); default `[]` |
| `continuationOf` | `continuationOf` | **título** do registro anterior; resolvido para o ID após a importação (ver 4.5) |
| — | `userId` | UID da conta de destino (preenchido pelo sistema) |
| — | `actions` / `links` | `[]` (não suportado na importação inicial) |
| — | `createdAt` / `updatedAt` | ISO do momento da importação |

### 4.5 Resolução de `continuationOf` (encadeamento)

No JSON, `continuationOf` é o **título** do devocional anterior (o usuário não tem
IDs do Firestore ao transcrever). A importação resolve em duas fases:

1. **Fase 1** — cria todos os documentos (com `continuationOf: null`), capturando
   o novo ID de cada um e montando um mapa `título → ID` do lote.
2. **Fase 2** — para cada item com referência de continuação, resolve o título
   para um ID, procurando primeiro no **lote** recém-criado e depois nos
   **registros já existentes** da conta de destino; se encontrado, atualiza o
   documento com `continuationOf` = ID alvo. Se não encontrado, o item fica sem
   vínculo e é sinalizado no preview/log.

Auto-referência (item que aponta para o próprio título) é ignorada.

### 4.4 Conversão Markdown → HTML

O corpo (`content_md`) e as respostas guiadas (`a_md`) são escritos em Markdown e
convertidos para o HTML que o editor Quill produz/consome. Suporte mínimo:
parágrafos, **negrito**, *itálico*, listas, títulos (`#`/`##`) e quebras de
linha. [Inferência] um conversor Markdown leve é suficiente; não é necessário
suportar todo o CommonMark.

## 5. Fluxo principal

1. Admin abre `admin.html` e vai à seção "Importar Devocionais".
2. Escolhe a conta de destino (UID preenchido automaticamente).
3. Cola o JSON (ou seleciona um arquivo `.json`).
4. Clica em "Validar e pré-visualizar".
5. O sistema parseia o JSON, valida cada item e exibe o preview com avisos.
6. Se houver erro de parse ou erro bloqueante, exibe a mensagem e impede importar.
7. Admin revisa e clica em "Importar N devocionais".
8. O sistema grava item a item em `devotionals`, registrando progresso no log.
9. Ao final, exibe um resumo (importados com sucesso / falhas).

## 6. Regras de negócio

1. **Acesso exclusivo do Admin Master** — a seção só existe/funciona em
   `admin.html`, protegida pela mesma checagem de rota já existente.
2. **Destino obrigatório** — não é possível importar sem um UID de destino
   válido.
3. **JSON deve ser um array** — entrada que não seja um array válido é rejeitada
   com mensagem clara.
4. **Defaults seguros** — campos ausentes recebem os defaults da seção 4.3 sem
   bloquear a importação.
5. **Data ausente** — devocionais sem data são importados com `date: ""` e
   sinalizados no preview e no log, para ajuste manual posterior no app.
   (Decisão confirmada pelo usuário.)
6. **`recordType` inválido** → cai para `devocional` (com aviso).
7. **`recordFormat` inválido ou ausente** → cai para `livre` (com aviso).
8. **Sem deduplicação automática** na versão inicial — [Pendente] avaliar se
   devemos evitar reimportar itens iguais. Risco de duplicação assumido pelo
   admin nesta versão.
9. **Importação não é transacional** — cada item é gravado individualmente; uma
   falha isolada não impede os demais. Falhas são reportadas no log.

## 7. Permissões

- **Ler/usar a importação:** exclusivo `abner.eslava@gmail.com`.
- **Gravar em `devotionals` com `userId` de terceiro:** as Regras de Segurança do
  Firestore precisam permitir que o Admin Master crie documentos em
  `devotionals` para qualquer `userId`. [Pendente] confirmar/ajustar as regras
  atuais — ver seção 8 e 10.

## 8. Dados necessários

- **Coleção `devotionals`** (já existente) — documentos no mesmo formato do app.
- **Coleção `whitelisted_emails`** (já existente) — fonte da lista de contas de
  destino e dos UIDs conhecidos.
- **UID de destino** — obtido do seletor (`dataset.uid`) ou digitado manualmente.

## 9. Estados e mensagens

- **JSON inválido:** "JSON inválido. Verifique a estrutura e tente novamente."
- **Não é array:** "O conteúdo precisa ser uma lista (array) de devocionais."
- **Sem destino:** "Selecione a conta de destino antes de importar."
- **Preview vazio:** "Nenhum devocional encontrado no JSON."
- **Aviso por item:** "Item 3: sem data (será importado em branco)." / "Item 5:
  tipo desconhecido, usando 'devocional'."
- **Sucesso:** "Importação concluída: X importados, Y com avisos, Z falhas."
- **Confirmação antes de importar:** "Importar N devocionais para [email]? Esta
  ação grava diretamente na conta selecionada."

## 10. Casos extremos

- **UID de destino desconhecido** (conta nunca logou) — o campo de UID fica
  vazio; o admin pode usar a detecção de UID legado já existente ou digitar
  manualmente. Sem UID válido, importação bloqueada.
- **Regras do Firestore bloqueando escrita para `userId` de terceiro** — se as
  regras atuais só permitirem `userId == request.auth.uid`, a importação para
  outra conta falhará. [Pendente] revisar as regras (provavelmente já ajustadas
  para a migração, que também grava `userId` de terceiros — confirmar).
- **Markdown com HTML embutido** — sanitização mínima para evitar quebra de
  layout. [Sugestão] escapar/limpar tags perigosas.
- **JSON muito grande** (centenas de itens) — importação sequencial com log de
  progresso; sem paralelismo agressivo para não estourar limites do Firestore.
- **Campos com tipo errado** (ex.: `keywords` como string) — normalizar quando
  trivial (string → lista de 1) ou avisar e usar default.

## 11. Critérios de aceite

- [ ] Nova seção "Importar Devocionais" visível apenas no Painel Admin.
- [ ] Seleção de conta de destino com UID resolvido automaticamente + fallback
      manual.
- [ ] Colagem de JSON (array) parseada e validada, com preview por item.
- [ ] Campos faltantes recebem defaults seguros sem bloquear a importação.
- [ ] Devocionais sem data importados em branco e sinalizados.
- [ ] Corpo em Markdown convertido para HTML compatível com o editor do app.
- [ ] Formato "orientado" (perguntas/respostas) importado corretamente.
- [ ] Gravação item a item em `devotionals` com `userId` correto e log de
      progresso.
- [ ] Resumo final com contagem de sucessos/avisos/falhas.
- [ ] Registros importados aparecem normalmente na conta de destino dentro do app.

## 12. Decisões (resolvidas com o usuário)

- **Regras do Firestore:** confirmado — o Admin Master já tem permissão para
  gravar em `devotionals` com `userId` de terceiros. Nenhum ajuste de regras
  necessário.
- **Deduplicação:** confirmada — o sistema deve detectar e evitar reimportar
  devocionais já existentes na conta de destino. Detecção por assinatura
  (`title` + `date` + `mainPassage` + trecho do conteúdo, normalizados),
  comparando contra os registros existentes da conta e também entre itens do
  próprio lote. Duplicatas são sinalizadas no preview e **puladas** por padrão na
  importação (com log).
- **Escopo v1:** `actions` e `links` ficam **fora** da primeira versão (gravados
  como `[]`). Podem entrar numa versão futura.
- **`continuationOf` (v1.1):** passou a ser suportado a pedido do usuário —
  referenciado por **título** e resolvido para ID em duas fases (ver 4.5).
- **Upload de arquivo:** além da colagem de texto, a v1 também aceita upload de
  arquivo `.json` (preenche a textarea).
