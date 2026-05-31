# Especificação: Paginação com Scroll Infinito (15 por página)

## 1. Objetivo

Carregar no máximo 15 registros por vez nas abas Registros e Bênçãos. Ao rolar até o final da lista, os próximos 15 são carregados automaticamente (scroll infinito), sem botão de "carregar mais" explícito.

## 2. Contexto

Atualmente todos os registros são carregados de uma vez via `getDocs(q)`. Com o tempo, um usuário com dezenas ou centenas de registros vai sentir a lentidão no carregamento inicial e no renderizamento de todos os cards de uma só vez. A paginação melhora performance e UX.

O Firestore suporta paginação eficiente via `limit()` + `startAfter(lastDocument)` — sem custo extra de leituras desnecessárias.

## 3. Usuários envolvidos

- **Membro Convidado:** percebe carregamento mais rápido e lista fluida.

## 4. Funcionamento esperado

- Ao abrir a aba Registros, carregam os 15 registros mais recentes (ordenados por data desc).
- Um **sentinel invisível** no final da lista é observado por `IntersectionObserver`.
- Quando o sentinel entra no viewport (usuário chegou ao fim), os próximos 15 são buscados e adicionados à lista (não substituem — são **append**).
- Um indicador sutil de loading ("Carregando mais...") aparece durante o fetch.
- Quando não há mais registros, o sentinel é removido e uma mensagem "Você chegou ao início do seu diário" aparece no final.
- Ao aplicar filtros (keyword, tipo, data), a paginação é **reiniciada** — mostra os 15 primeiros resultados do filtro aplicado.

## 5. Fluxo principal

1. Aba abre → skeleton de 3 cards → primeiros 15 cards carregados.
2. Usuário scrolla → chega ao sentinel → loading indicator aparece.
3. Próximos 15 carregados → adicionados ao final da lista.
4. Sem mais registros → sentinel removido, mensagem final exibida.

## 6. Regras de negócio

- A ordenação padrão é por `date` descrescente (mais recente primeiro).
- O cursor de paginação é o **último documento Firestore** retornado na página anterior (`QueryDocumentSnapshot`).
- Filtros reiniciam a paginação do zero (novo `startAfter` = null).
- O `allRecords` (array em memória usado para autocomplete, edição, etc.) passa a ser acumulativo: cada página adiciona ao array existente.
- [Inferência] A função `buildIndices()` precisa ser chamada após cada página carregada para atualizar o índice de keywords/autores.

## 7. Permissões

- Sem alteração. A query Firestore continua filtrada por `userId`.

## 8. Dados necessários

- Sem novos campos no Firestore.
- Query: `query(collection, where("userId","==",uid), orderBy("date","desc"), limit(15))`
- Próxima página: `query(..., startAfter(lastDoc), limit(15))`

## 9. Estados e mensagens

- **Carregando primeira página:** skeleton de 3 cards.
- **Carregando próxima página:** indicador no final ("carregando mais...") com spinner pequeno.
- **Sem mais registros:** mensagem "Você chegou ao início do seu diário." com ícone ph-check-circle.
- **Lista vazia após filtro:** mensagem "Nenhum resultado para os filtros aplicados."
- **Lista totalmente vazia:** estado vazio atual (mensagem inspiracional).

## 10. Casos extremos

- Usuário com exatamente 15 registros: carrega a primeira página, sentinel observa, fetch retorna 0 docs → exibe mensagem final sem novo append.
- Filtro aplicado mid-scroll: reinicia paginação, desmonta o observer antigo, monta um novo.
- Aba desmontada durante fetch pendente: verificar se o container ainda existe antes de fazer append.
- Registros adicionados por outro dispositivo enquanto o usuário pagina: não afeta a sessão atual (paginação cursor-based é estável).

## 11. Critérios de aceite

- [ ] Apenas 15 registros carregados na abertura da aba.
- [ ] Scroll ao final carrega os próximos 15 automaticamente.
- [ ] Loading indicator visível durante o fetch da próxima página.
- [ ] Mensagem de fim de lista exibida quando não há mais registros.
- [ ] Filtros reiniciam a paginação corretamente.
- [ ] Estado vazio funciona quando lista é realmente vazia.
- [ ] Replicado em Bênçãos com a mesma lógica.

## 12. Dúvidas pendentes

- [Pendente] Filtros que não sejam suportados diretamente pelo Firestore (ex: filtro por keyword que está num array) exigem filtro client-side após o fetch. Nesse caso, a paginação de 15 pode retornar menos itens visíveis. Aceitar esse comportamento ou carregar páginas até ter 15 visíveis? Decisão para o plan.md.
