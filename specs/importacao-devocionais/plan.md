# Plano Técnico: Importação de Devocionais em Lote (Admin)

## 1. Resumo da solução

Adicionar uma nova seção "Importar Devocionais" ao Painel Admin existente
(`admin.html` + `admin.js`). A UI reaproveita o padrão visual e o mecanismo de
seleção de conta de destino (email → UID) já usado pela ferramenta de migração.
A lógica em `admin.js`:

1. Lê o JSON (textarea ou arquivo `.json`).
2. Parseia e valida (precisa ser array; aplica defaults; normaliza tipos).
3. Detecta duplicatas (contra registros existentes da conta + dentro do lote).
4. Converte `content_md`/`a_md` (Markdown → HTML compatível com Quill).
5. Renderiza um preview com avisos por item.
6. Ao confirmar, grava item a item em `devotionals` via `addDoc`, com log de
   progresso, pulando duplicatas.

Sem dependências externas novas: o conversor Markdown é uma função leve interna,
com escape de HTML para sanitização mínima.

## 2. Dependências

- **Firebase Firestore** (já inicializado em `admin.js`): `collection`, `addDoc`,
  `getDocs`, `query`, `where`.
- **Coleção `whitelisted_emails`**: fonte da lista de contas/UIDs
  (`getMigrationTargetOptions`, já existente).
- **Coleção `devotionals`**: destino da gravação e fonte para deduplicação.
- Nenhuma biblioteca externa nova (conversor Markdown próprio).

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `admin.html` | Nova seção de UI "Importar Devocionais" (markup + estilos inline na `<style>` já existente) |
| `admin.js` | Lógica de parse, validação, dedup, conversão Markdown→HTML, preview e gravação |

> Observação: **não** alterar `style.css` (está no cache do service worker do app
> principal). Estilos da nova seção ficam no bloco `<style>` inline de
> `admin.html`, evitando bump de `sw.js`. `admin.html`/`admin.js` não são cacheados
> pelo SW.

## 4. Estrutura de dados

### Entrada (JSON por item)
```
{
  title?, date?, mainPassage?, recordType?, recordFormat?,
  content_md?,                         // formato livre
  questions?: [{ q, a_md }],           // formato orientado
  author?: string[], relatedPassages?: string, keywords?: string[]
}
```

### Documento gravado em `devotionals`
```
{
  userId,                              // UID de destino (sistema)
  title, date, mainPassage,
  recordType, recordFormat,
  content: { texto } | { questions: [{ q, a }] },
  author: [], relatedPassages: "", keywords: [],
  continuationOf: null, actions: [], links: [],
  createdAt, updatedAt                 // ISO do momento da importação
}
```

### Assinatura de deduplicação
`norm(title) + '␟' + (date||'') + '␟' + norm(mainPassage) + '␟' + plainText(content).slice(0,200)`
onde `norm` = lowercase + trim + colapso de espaços. Conjunto de assinaturas dos
registros existentes da conta é montado uma vez antes do loop.

## 5. Regras de segurança e permissões

- A seção vive em `admin.html`, já protegido por rota (somente Admin Master).
- Gravação em `devotionals` com `userId` de terceiros: já permitida pelas regras
  atuais (confirmado).
- Sanitização: o Markdown é convertido após escape de `&`, `<`, `>`, evitando
  injeção de HTML arbitrário vindo do JSON.

## 6. Fluxos técnicos

1. **Seleção de destino:** reutiliza `getMigrationTargetOptions()` para popular um
   `<select>`; UID resolvido em campo editável (fallback manual), igual à migração.
2. **Validar e pré-visualizar:**
   - `JSON.parse` com try/catch → erro amigável.
   - Se não for array → erro.
   - Para cada item: aplica defaults, normaliza tipos, coleta avisos.
   - Carrega registros existentes do destino (`where userId == uid`) e monta o set
     de assinaturas; marca duplicatas (existentes e intra-lote).
   - Renderiza preview: índice, título, data (ou "sem data"), tipo, formato,
     avisos e flag de duplicata.
3. **Importar:**
   - Confirmação com contagem e email de destino.
   - Loop sequencial: pula duplicatas; converte Markdown; `addDoc`; loga progresso
     a cada N itens.
   - Resumo final: importados / pulados (duplicados) / falhas.

## 7. Impactos no sistema existente

- Nenhum impacto no app principal (`index.html`/`script.js`/módulos).
- Nenhuma alteração em fluxos existentes do admin; apenas adição de seção.
- Registros importados aparecem normalmente no módulo de registros da conta.

## 8. Riscos técnicos

- **Conversor Markdown incompleto:** pode não cobrir formatações exóticas. Mitigado
  pelo escopo mínimo acordado (parágrafos, negrito, itálico, títulos, listas,
  quebras).
- **Volume alto:** muitas gravações sequenciais podem ser lentas; aceitável para
  uso administrativo pontual. Log de progresso dá feedback.
- **Falsos positivos/negativos de dedup:** assinatura heurística. Mitigado por
  incluir trecho do conteúdo; duplicatas só são puladas, nunca apagam nada.
- **UID de destino ausente:** importação bloqueada até haver UID válido.

## 9. Estratégia de teste

- JSON válido (livre + orientado) → preview correto → importação grava docs.
- JSON inválido / não-array → mensagens de erro.
- Item sem data → importado em branco e sinalizado.
- Item com `recordType`/`recordFormat` inválidos → default + aviso.
- Reimportar o mesmo lote → todos marcados como duplicata e pulados.
- Duplicata intra-lote (item repetido no mesmo JSON) → segundo marcado.
- Verificar no app (conta de destino) que os registros aparecem e abrem corretamente.
- `node --check admin.js` sem erros de sintaxe.

## 10. Ordem recomendada de implementação

1. `admin.html`: markup da seção + estilos inline.
2. `admin.js`: utilitários (defaults, normalização, conversor Markdown, assinatura).
3. `admin.js`: parse + validação + preview.
4. `admin.js`: deduplicação (carregar existentes + comparar).
5. `admin.js`: gravação sequencial + log + resumo.
6. Teste manual completo.
