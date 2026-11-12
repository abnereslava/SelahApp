# Plano Técnico: Busca Instantânea e Toggle de Favoritos em Bênçãos

## 1. Resumo da solução

O painel de filtros de Bênçãos será substituído pela mesma barra responsiva usada em Registros. Um índice em memória será construído sobre a união de `statsBlessings` e `allBlessings`, normalizando título, relato sem HTML, tags e data.

A consulta será dividida em termos, filtrada por presença de todos eles e ordenada por pontuação de relevância. O toggle de favoritas será aplicado depois da busca. Sem consulta nem toggle, o feed continuará usando `allBlessings` e sua paginação.

## 2. Dependências

* Componentes CSS existentes `records-list-toolbar`, `records-search-shell`, `records-search-clear`, `records-favorites-toggle` e `records-random-btn`.
* `statsBlessings` para a coleção completa.
* `allBlessings` para o feed paginado.
* Fluxos existentes de leitura, edição, favoritos, sorteio, estatísticas e paginação.
* APIs nativas de DOM, `Map`, `Set`, normalização de strings e `setTimeout`.
* Nenhuma biblioteca externa nova.

## 3. Arquivos afetados

* `modules/bencaos.js`: interface, fonte completa, índice, busca, relevância, toggle e integrações.
* `index.html`: atualizar versão do script principal.
* `script.js`: atualizar versão das importações dinâmicas.
* `sw.js`: incrementar cache da PWA.
* `specs/busca-instantanea-bencaos/tasks.md`: acompanhar as etapas.
* `specs/busca-instantanea-bencaos/review.md`: registrar a revisão.

## 4. Estrutura de dados

Estado:

```text
blessingListState = {
  query: string,
  favorites: boolean
}
```

Índice:

```text
blessingSearchIndex: Map<id, {
  blessing,
  title,
  metadata,
  content,
  combined
}>
```

* `title`: título normalizado.
* `metadata`: tags e representações da data.
* `content`: relato convertido de HTML para texto.
* `combined`: concatenação pesquisável.

## 5. Regras de segurança e permissões

* O índice usa apenas dados já carregados do usuário autenticado.
* Nenhuma consulta ou gravação acontece durante a digitação.
* O índice permanece somente em memória.
* Nenhuma regra, coleção ou permissão Firebase será alterada.

## 6. Fluxos técnicos

### 6.1 Fonte completa

1. Unir `statsBlessings` e `allBlessings` por ID.
2. Preservar a versão paginada/local quando o mesmo ID existir nas duas fontes.
3. Usar essa fonte para busca, favoritas e abertura de resultados ainda não paginados.

### 6.2 Indexação e busca

1. Reconstruir o índice após `refreshStats`.
2. Remover tags HTML do relato por DOM temporário.
3. Gerar data ISO, numérica, mês por extenso e mês/ano.
4. Normalizar acentos, caixa, pontuação e espaços.
5. Exigir todos os termos da consulta.
6. Pontuar título antes de tags/data e relato.
7. Desempatar por data e horário mais recentes.

### 6.3 Toggle, paginação e ações

1. Aplicar favoritas após a busca.
2. Sem busca, aplicar favoritas na fonte completa.
3. Suspender o sentinela enquanto busca ou favoritas estiver ativo.
4. Reativar o feed paginado quando ambos forem desligados.
5. Sincronizar favorito nas duas fontes e reaplicar a lista.
6. Usar os resultados ativos em **Recordar Bênção**.
7. Permitir leitura e edição de bênçãos vindas somente de `statsBlessings`.

## 7. Impactos no sistema existente

* O painel por termo e intervalo de datas deixa de existir.
* Datas continuam pesquisáveis pelo campo único.
* O feed padrão permanece paginado.
* Resultados completos podem incluir itens ainda não mostrados pela rolagem.
* Criação, edição, leitura, analytics e Firebase mantêm os fluxos existentes.

## 8. Riscos técnicos

* Resultados de `statsBlessings` precisam ser aceitos pelas funções que antes consultavam apenas `allBlessings`.
* Paginação em andamento não pode anexar cards incompatíveis com a busca.
* O fallback de consulta sem `orderBy` precisa respeitar o estado ativo.
* Relatos longos aumentam o custo inicial de indexação; o índice não será refeito por tecla.

## 9. Estratégia de teste

* Testar `Ab`, caixa e acentos.
* Testar título, tag e trecho interno do relato.
* Testar `2024`, `setembro`, `setembro 2028` e `09 2028`.
* Testar ordenação por relevância.
* Testar favoritas com e sem busca.
* Testar desfavoritar na lista ativa.
* Testar abrir e editar resultado ainda não paginado.
* Testar retorno à paginação e sorteio ativo.
* Executar sintaxe, whitespace, versões e ausência de mudanças Firebase.

## 10. Ordem recomendada de implementação

1. Substituir a interface pelo componente compartilhado.
2. Implementar fonte completa, índice, busca e relevância.
3. Integrar toggle, paginação, leitura, edição, favorito e sorteio.
4. Atualizar cache, testar e revisar.
