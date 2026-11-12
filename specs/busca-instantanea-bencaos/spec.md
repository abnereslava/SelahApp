# Especificação: Busca Instantânea e Toggle de Favoritos em Bênçãos

## 1. Objetivo

Aplicar à aba **Bênçãos** a mesma experiência aprovada para **Registros**: substituir o painel atual de filtros por uma busca única em tempo real e transformar o filtro de favoritas em um toggle direto da lista.

## 2. Contexto

A aba Bênçãos possui hoje um painel expansível com campo de texto, intervalo de datas, checkbox de favoritas e botão para aplicar filtros. O feed é paginado em `allBlessings`, enquanto `statsBlessings` contém a coleção completa usada nas estatísticas.

A nova interface deve seguir o padrão visual e comportamental já implementado em Registros, adaptado aos campos próprios de uma bênção.

## 3. Usuários envolvidos

* Usuário autenticado consultando o próprio diário de bênçãos.

## 4. Funcionamento esperado

### 4.1 Interface

* Remover integralmente o painel **Filtrar Bênçãos** e seus controles internos.
* Inserir um campo de busca sempre visível com lupa e ação discreta para limpar.
* Inserir ao lado um toggle de **Favoritas**, com estado visual e semântico.
* Manter o botão **Recordar Bênção**.
* Reutilizar o padrão responsivo da barra existente em Registros.

### 4.2 Busca instantânea

* Atualizar os resultados desde o primeiro caractere, sem botão “Aplicar”.
* Ignorar diferenças de maiúsculas/minúsculas e acentos.
* Aceitar fragmentos parciais; por exemplo, `Ab` deve encontrar qualquer palavra indexada que contenha esse fragmento.
* Em consultas com várias palavras, exigir que todos os termos apareçam no conjunto pesquisável da bênção, ainda que em campos diferentes.
* Usar atraso técnico curto apenas para evitar renderizações excessivas.

### 4.3 Conteúdo pesquisável

A busca deve considerar:

* título da bênção;
* relato/testemunho convertido de HTML para texto legível;
* tags e palavras-chave;
* data em formato numérico;
* dia, nome do mês por extenso e ano em português.

Exemplos:

* `2024` encontra bênçãos cuja data, título, tags ou relato contenham 2024.
* `setembro` encontra bênçãos de setembro, independentemente do ano, e ocorrências textuais.
* `setembro 2028` encontra bênçãos que contenham os dois termos, incluindo as datadas nesse mês e ano.
* `09 2028` pode localizar setembro de 2028.

### 4.4 Ordenação por relevância

Com busca preenchida, ordenar por:

1. título exatamente igual à consulta;
2. título iniciado pela consulta;
3. palavra do título iniciada pela consulta;
4. ocorrência parcial no título;
5. ocorrência em tags ou data;
6. ocorrência somente no relato;
7. em empate, bênção mais recente primeiro.

### 4.5 Toggle de favoritas

* Com busca preenchida, o toggle limita os resultados pesquisados às bênçãos favoritas.
* Com busca vazia, o toggle considera todas as favoritas de `statsBlessings`, inclusive as ainda não carregadas pela rolagem.
* Outro clique desativa o toggle sem apagar a busca.
* Com busca vazia e toggle desligado, o feed volta à paginação normal.
* Desfavoritar uma bênção enquanto o toggle está ativo deve retirá-la da lista.

## 5. Fluxo principal

1. O usuário abre Bênçãos e vê o feed paginado normal.
2. Ao digitar, a lista é pesquisada e ordenada automaticamente.
3. O usuário pode ativar **Favoritas** para restringir os resultados atuais.
4. Ao limpar a busca, o toggle permanece aplicado à coleção completa.
5. Ao desligar o toggle com o campo vazio, a paginação normal retorna.

## 6. Regras de negócio

* Busca e toggle operam somente sobre dados do usuário autenticado já carregados nas fontes do módulo.
* Nenhuma consulta ao Firebase deve ocorrer por tecla.
* Pesquisar ou alternar a visualização não grava dados.
* Favoritar/desfavoritar mantém o fluxo persistido atual.
* **Recordar Bênção** deve sortear dentro da busca/favoritas quando algum desses estados estiver ativo.
* Sem busca nem favoritas, o sorteio conserva o comportamento atual.

## 7. Permissões

* Somente o usuário autenticado visualiza e pesquisa as próprias bênçãos.
* Não haverá mudança de autenticação, coleções ou regras do Firebase.

## 8. Dados necessários

Campos já existentes:

* `id`;
* `title`;
* `date`;
* `tags`;
* `description`;
* `favorito`;
* `createdAt` e `updatedAt`, quando disponíveis.

Estado temporário:

* consulta atual;
* toggle de favoritas;
* índice textual normalizado e pontuação em memória.

## 9. Estados e mensagens

* Sem busca e sem favoritas: feed paginado normal.
* Busca sem resultado: informar que nenhuma bênção corresponde à pesquisa.
* Favoritas sem resultado: informar que ainda não há bênçãos favoritas.
* Busca mais favoritas sem resultado: informar que nenhuma favorita corresponde à pesquisa.
* Erro ao favoritar/desfavoritar: manter a reversão atual.

## 10. Casos extremos

* Espaços, acentos ou pontuação sem termo pesquisável devem equivaler a busca vazia.
* Tags HTML do relato não devem entrar no índice.
* Bênção sem tags ou descrição deve continuar pesquisável por título e data.
* Data ausente ou inválida não deve interromper a busca.
* Termos repetidos não exigem ocorrências duplicadas.
* Consultas numéricas e de um caractere não possuem tamanho mínimo.
* A paginação não deve anexar cards incompatíveis enquanto uma busca estiver ativa.

## 11. Critérios de aceite

* [ ] O painel antigo de filtros não aparece mais em Bênçãos.
* [ ] Existe busca sempre visível, limpeza e toggle de favoritas.
* [ ] A lista muda desde o primeiro caractere.
* [ ] A busca ignora caixa e acentos e aceita fragmentos.
* [ ] Título, relato, tags e data são pesquisáveis.
* [ ] `2024`, `setembro`, `setembro 2028` e `09 2028` funcionam conforme descrito.
* [ ] Resultados são ordenados por relevância e depois por data.
* [ ] A busca usa a coleção completa disponível.
* [ ] O toggle combina com a busca e, sem busca, usa todas as favoritas.
* [ ] Desligar ambos retorna ao feed paginado.
* [ ] Desfavoritar reaplica a lista ativa.
* [ ] **Recordar Bênção** respeita os resultados ativos.
* [ ] Nenhuma regra ou gravação adicional do Firebase é criada.
* [ ] A interface mantém o padrão responsivo de Registros.

## 12. Dúvidas pendentes

Nenhuma. A solicitação é replicar em Bênçãos o comportamento já aprovado em Registros, incluindo a regra de combinação entre busca, favoritas e paginação.
