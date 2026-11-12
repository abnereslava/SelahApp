# Especificação: Busca Instantânea e Toggle de Favoritos nos Registros

## 1. Objetivo

Substituir o painel atual de filtros da área **Registros** por uma busca única, instantânea e abrangente, acompanhada de um toggle que alterna diretamente entre todos os registros e somente os favoritos.

## 2. Contexto

A área Registros possui atualmente um painel expansível com filtros separados por termo, tipo, autor, intervalo de datas e favoritos. A aplicação também mantém duas fontes locais: `allRecords`, com a parte já paginada no feed, e `statsRecords`, com a coleção completa do usuário.

O usuário deseja uma interação mais direta: digitar qualquer fragmento no campo e ver os resultados mudarem em tempo real, sem abrir painel nem pressionar “Aplicar”. Também deseja que favoritos deixe de ser um critério dentro do painel e passe a ser um controle de alternância sempre acessível.

## 3. Usuários envolvidos

* Usuário autenticado do Selah consultando os próprios registros.

## 4. Funcionamento esperado

### 4.1 Interface

* Remover integralmente o painel expansível **Filtrar e Buscar Registros** e seus controles internos.
* Inserir no mesmo local um campo de busca sempre visível.
* Exibir um ícone de lupa no campo.
* Quando houver texto, disponibilizar uma forma discreta de limpar a busca.
* Inserir ao lado do campo um toggle de favoritos sempre visível.
* Manter o botão **Sortear Registro**.
* A interface deve funcionar em mobile e desktop sem comprimir excessivamente o campo.

### 4.2 Busca instantânea

* A busca começa a atualizar os resultados desde o primeiro caractere digitado.
* Não existe botão “Aplicar”.
* A comparação ignora diferenças entre maiúsculas e minúsculas.
* A comparação ignora acentos; por exemplo, `abraao` encontra `Abraão`.
* Fragmentos parciais são aceitos; por exemplo, `Ab` encontra palavras como `Abner`, `Abraão`, `Absalão`, `Abrir` e `Aberto`.
* Consultas com várias palavras exigem que todos os termos estejam presentes no conjunto pesquisável do registro, ainda que apareçam em campos diferentes.
* Os resultados devem ser atualizados em tempo real, com atraso técnico curto apenas para evitar renderizações excessivas durante digitação rápida.

### 4.3 Conteúdo pesquisável

A busca deve considerar:

* título;
* passagem principal;
* passagens relacionadas;
* autor ou pregador;
* palavras-chave/temas;
* tipo do registro, incluindo o rótulo apresentado ao usuário;
* texto livre do registro;
* perguntas e respostas do formato orientado;
* títulos e URLs dos links anexados;
* data em formato numérico;
* dia, nome do mês por extenso e ano em português.

Exemplos esperados:

* `2024` encontra registros cuja data, texto ou metadados contenham 2024.
* `setembro` encontra registros de setembro, independentemente do ano, além de registros em que a palavra exista no conteúdo.
* `setembro 2028` encontra registros que contenham os dois termos, incluindo registros datados de setembro de 2028.
* `09 2028` pode encontrar registros datados em setembro de 2028.

### 4.4 Ordenação por relevância

Quando a busca estiver preenchida, os resultados devem ser ordenados por relevância antes do desempate por data:

1. correspondência exata do título ou passagem principal;
2. título ou passagem principal iniciando com a consulta;
3. palavra do título ou passagem principal iniciando com a consulta;
4. correspondência no título, passagem ou metadados;
5. correspondência somente no conteúdo do registro;
6. em empates, registro mais recente primeiro.

Para consultas com várias palavras, a relevância deve considerar o conjunto completo dos termos.

### 4.5 Toggle de favoritos

* Um clique ativa o estado **Somente favoritos**.
* Outro clique desativa esse estado.
* O controle deve indicar visual e semanticamente se está ativado.
* Ao ativar, a lista deve usar a coleção completa disponível em `statsRecords`, e não apenas os cards já paginados.
* Se houver uma busca digitada, o toggle deve restringir os resultados da busca aos favoritos.
* Ao desfavoritar um item enquanto o toggle está ativo, esse item deve sair da lista.
* Ao desativar, a busca atual permanece aplicada; se o campo estiver vazio, o feed volta ao comportamento paginado padrão.

## 5. Fluxo principal

1. O usuário abre a área Registros.
2. O campo está vazio e o toggle de favoritos está desligado.
3. O usuário digita um ou mais caracteres.
4. A aplicação pesquisa na coleção completa local e atualiza a lista automaticamente.
5. O usuário pode ativar favoritos para restringir os resultados atuais.
6. O usuário pode desativar favoritos sem perder o texto pesquisado.
7. Ao limpar o campo, a lista volta ao estado correspondente ao toggle atual.

## 6. Regras de negócio

* A busca e o toggle operam somente sobre registros pertencentes ao usuário autenticado, já disponíveis nas fontes locais do módulo.
* Nenhuma gravação é feita ao pesquisar ou alternar a visualização.
* A busca não deve exigir nova consulta ao Firebase a cada tecla.
* O botão de favorito dos cards e do modo leitura continua alterando o estado persistido atual.
* O sorteio deve respeitar a busca e o toggle enquanto algum dos dois estiver ativo.
* Ao alterar ou criar registros, o índice pesquisável deve refletir os dados recarregados pelo fluxo existente.
* A busca vazia não é um filtro textual.

## 7. Permissões

* Somente o usuário autenticado pode pesquisar e visualizar os próprios registros.
* A funcionalidade não cria novas permissões nem compartilhamento de dados.
* Não haverá alteração nas regras do Firebase.

## 8. Dados necessários

Dados já existentes nos registros:

* `id`;
* `date`;
* `title`;
* `mainPassage`;
* `relatedPassages`;
* `recordType`;
* `recordFormat`;
* `author`;
* `keywords`;
* `content.texto`;
* `content.questions`;
* `links`;
* `favorito`;
* `createdAt` e `updatedAt`, quando disponíveis para desempate.

Estado temporário de interface:

* termo atual da busca;
* toggle de favoritos ativado/desativado;
* texto normalizado e pontuação de relevância calculados em memória.

## 9. Estados e mensagens

* Campo vazio: exibir o feed correspondente ao estado do toggle.
* Busca em andamento: atualizar sem bloquear a tela.
* Nenhum resultado para a busca: exibir mensagem específica de ausência de correspondências.
* Toggle ativado sem favoritos: exibir mensagem específica de ausência de favoritos.
* Busca mais toggle sem resultado: informar que nenhum favorito corresponde à pesquisa.
* Erro ao favoritar/desfavoritar: manter o tratamento atual de reversão do estado.

## 10. Casos extremos

* Apenas espaços, acentos ou pontuação no campo: tratar como busca vazia quando não restar termo pesquisável.
* Conteúdo HTML do editor: pesquisar apenas o texto legível, sem considerar tags HTML.
* Autor salvo como string ou lista: ambos devem ser pesquisáveis.
* Registro sem título: usar passagem principal normalmente.
* Data ausente ou inválida: ignorar as representações derivadas da data sem interromper a busca.
* Termos repetidos: não exigir ocorrências duplicadas.
* Busca numérica curta: aceitar da mesma forma que texto, sem tamanho mínimo.
* Muitos registros: evitar reconstruções desnecessárias do índice a cada tecla.
* Favorito alterado com busca ativa: recalcular a visualização preservando o texto digitado.

## 11. Critérios de aceite

* [ ] O painel e o botão atuais de filtro não aparecem mais.
* [ ] Existe um campo de busca sempre visível e um toggle de favoritos.
* [ ] A lista começa a mudar desde o primeiro caractere.
* [ ] A busca ignora caixa e acentos.
* [ ] Fragmentos como `Ab` encontram palavras maiores que contenham esse fragmento.
* [ ] A busca alcança título, passagens, autoria, temas, tipo, conteúdo, links e data.
* [ ] `2024`, `setembro` e `setembro 2028` funcionam conforme descrito.
* [ ] Resultados pesquisados são ordenados por relevância e depois por data.
* [ ] A busca usa a coleção completa disponível, mesmo sem rolar o feed.
* [ ] O toggle mostra todos os favoritos da coleção completa com um clique.
* [ ] Outro clique desativa o toggle sem apagar a busca.
* [ ] Busca e favoritos funcionam em conjunto.
* [ ] Desfavoritar durante a visualização de favoritos remove o item da lista.
* [ ] O sorteio respeita o estado de busca/favoritos.
* [ ] Nenhuma regra ou gravação adicional do Firebase é criada.
* [ ] A interface permanece adequada em mobile e desktop.

## 12. Dúvidas pendentes

Nenhuma. O usuário confirmou que, com busca vazia e favoritos desligado, o feed deve voltar à paginação normal. Com busca preenchida, favoritos restringe os resultados pesquisados; com busca vazia, considera a coleção completa.

