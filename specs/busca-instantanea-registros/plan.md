# Plano Técnico: Busca Instantânea e Toggle de Favoritos nos Registros

## 1. Resumo da solução

O painel expansível atual será substituído por uma barra responsiva com campo `search`, botão de limpeza, toggle de favoritos e o botão de sorteio existente. O módulo criará, em memória, um índice normalizado por registro usando a coleção completa de `statsRecords`.

Cada entrada do índice separará título/passagem, metadados e conteúdo para permitir filtragem por todos os termos e uma pontuação de relevância. A visualização ativa será controlada por um estado simples com `query` e `favorites`. Quando ambos estiverem vazios/desligados, o feed volta a usar `allRecords` e a paginação existente.

## 2. Dependências

* `statsRecords` como fonte completa para busca e favoritos.
* `allRecords` como fonte do feed paginado padrão.
* `renderFeed`, `fetchPage`, `refreshStats`, `toggleFavorito` e `getShufflePool` existentes.
* APIs nativas de DOM, `String.prototype.normalize`, `Map`, `Set` e temporização curta com `setTimeout`.
* Nenhuma dependência externa nova.
* Nenhuma alteração no Firebase.

## 3. Arquivos afetados

* `modules/registros.js`: substituir a interface, criar índice pesquisável, pontuar resultados, combinar busca/favoritos e integrar paginação, sorteio e atualização de favorito.
* `style.css`: estilizar a barra de busca, limpeza, toggle e responsividade.
* `index.html`: atualizar a versão do CSS e do módulo principal.
* `script.js`: atualizar a versão das importações dinâmicas.
* `sw.js`: incrementar o cache da PWA.
* `specs/busca-instantanea-registros/tasks.md`: acompanhar as tarefas.
* `specs/busca-instantanea-registros/review.md`: registrar a revisão final.

## 4. Estrutura de dados

Estado de interface:

```text
recordListState = {
  query: string,
  favorites: boolean
}
```

Índice em memória por ID:

```text
searchIndex: Map<id, {
  record,
  primary,
  metadata,
  content,
  combined
}>
```

* `primary`: título e passagem principal normalizados.
* `metadata`: data em várias representações, autoria, temas, tipo, passagens relacionadas e links.
* `content`: texto livre ou perguntas/respostas sem tags HTML.
* `combined`: concatenação dos três grupos.

## 5. Regras de segurança e permissões

* O índice contém somente dados já carregados para o usuário autenticado.
* Nenhuma consulta ou gravação será disparada por tecla.
* O índice não será persistido em `localStorage`, Firebase ou arquivos.
* O HTML do conteúdo será convertido em texto somente para comparação.
* Não haverá mudança de autenticação, regras ou coleções.

## 6. Fluxos técnicos

### 6.1 Construção do índice

1. Após `refreshStats`, percorrer `statsRecords`.
2. Converter HTML de conteúdo e respostas em texto legível.
3. Gerar representações de data: ISO, dia/mês/ano, mês por extenso e combinações úteis.
4. Normalizar caixa, acentos, pontuação e espaços.
5. Armazenar cada entrada no `Map` por ID.

### 6.2 Busca e relevância

1. Normalizar o valor digitado e separar termos únicos.
2. Exigir que todos os termos apareçam em `combined`.
3. Calcular pontuação privilegiando correspondência exata, início e palavras do título/passagem.
4. Atribuir pesos menores a metadados e conteúdo.
5. Ordenar por pontuação e desempatar por data/horário mais recente.
6. Renderizar a lista completa resultante sem alterar `allRecords`.

### 6.3 Toggle e paginação

1. Aplicar favoritos depois da busca quando houver consulta.
2. Sem consulta, usar todos os favoritos de `statsRecords`.
3. Com busca ou favoritos ativos, desconectar o observador e ocultar o sentinela da paginação.
4. Sem busca e sem favoritos, renderizar `allRecords` e reativar o sentinela.
5. Se uma página terminar de carregar durante uma busca, recalcular a visualização ativa em vez de anexar cards incompatíveis.

### 6.4 Favoritar e sortear

1. Após favoritar/desfavoritar, sincronizar as fontes existentes.
2. Reaplicar a visualização ativa para retirar ou inserir o item quando necessário.
3. O sorteio usa a mesma lista calculada quando busca ou favoritos estiver ativo.
4. Sem estado ativo, permanece a consulta aleatória atual do Firebase.

## 7. Impactos no sistema existente

* O painel de filtros por tipo, autor e intervalo de datas deixa de existir.
* Essas informações continuam pesquisáveis pelo campo único.
* O feed padrão continua paginado.
* A busca e favoritos podem renderizar resultados da coleção completa sem exigir scroll prévio.
* Trilha, leitura, edição, PDF e estatísticas não mudam.

## 8. Riscos técnicos

* Conteúdos muito extensos aumentam o custo inicial de indexação; o índice será reconstruído somente quando a coleção completa for atualizada.
* Um observador de paginação ainda ativo poderia anexar itens durante a busca; o estado ativo precisa suspender o sentinela.
* Consultas muito curtas podem retornar muitos registros; o atraso curto reduz renderizações durante digitação rápida.
* Normalização de HTML deve evitar que nomes de tags entrem no índice.
* A ordenação precisa ser estável para evitar saltos em resultados com mesma relevância.

## 9. Estratégia de teste

* Testar normalização de caixa e acentos.
* Testar fragmentos de um caractere e `Ab`.
* Testar conteúdo livre, perguntas/respostas, autor, tipo, palavras-chave, passagens e links.
* Testar `2024`, `setembro`, `setembro 2028` e `09 2028`.
* Testar ordenação por relevância e desempate por data.
* Testar toggle sem busca, com busca e após desfavoritar.
* Testar limpeza da busca preservando o toggle.
* Testar retorno ao feed paginado.
* Testar sorteio com estados ativos.
* Executar verificações de sintaxe, cache-busting e ausência de alterações Firebase.

## 10. Ordem recomendada de implementação

1. Substituir a interface e seus estilos.
2. Implementar normalização, índice, filtragem e relevância.
3. Integrar toggle, paginação, favoritos e sorteio.
4. Atualizar cache, executar testes e revisar.
