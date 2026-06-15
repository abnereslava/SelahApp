# Plano Técnico: Sistema de Favoritos

## 1. Resumo da solução

Adicionar um campo `favorito: boolean` nos documentos Firestore (`devotionals` e `blessings`). A alternância do favorito ocorre via `updateDoc` direto. O estado de todos os filtros ativos passa a ser rastreado em um objeto `filterState` local ao módulo, que alimenta tanto a renderização da lista quanto o sorteio. O sorteio usa o pool filtrado de `allRecords`/`allBlessings` quando há filtros ativos, e mantém a lógica de `randomSeed` do Firestore quando não há filtros.

## 2. Dependências

- Firebase Firestore: `updateDoc`, `doc` (já importados em registros.js e bencaos.js)
- `allRecords` / `allBlessings`: arrays em memória com todos os registros paginados
- `renderFeed`: função existente que aceita array filtrado
- Phosphor Icons: `ph-star` (preenchido) e `ph-star` (com fill via classe CSS)

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `modules/registros.js` | filtros, favoritar, sorteio, cards, leitura |
| `modules/bencaos.js` | idem para bênçãos |
| `style.css` | estrela no card, botão favoritar na leitura, badge de filtro ativo |

## 4. Estrutura de dados

**Firestore (sem migração necessária):**
- Campo `favorito: true` adicionado ao doc na coleção `devotionals` ou `blessings` ao marcar
- Ausência do campo ou `favorito: false` → não favorito

**Estado local (por módulo, dentro do closure do `render`):**
```js
const filterState = {
    keyword: '',
    type: '',      // registros apenas
    author: '',    // registros apenas
    dateStart: '',
    dateEnd: '',
    favorites: false
};
```

**Pool de sorteio:**
```js
const getShufflePool = (excludeId = null) => {
    let pool = hasActiveFilter()
        ? applyFilterToArray(allRecords)
        : allRecords.slice();
    if (excludeId) pool = pool.filter(x => x.id !== excludeId);
    return pool;
};
```

## 5. Regras de segurança e permissões

- Cada documento já pertence ao `userId` do usuário autenticado (regra Firestore existente)
- O `updateDoc` só altera `{ favorito: bool }` — sem risco de sobrescrever outros campos
- Não há exposição de dados de outros usuários (lógica já existente é correta)

## 6. Fluxos técnicos

### 6.1 Favoritar/desfavoritar

1. Usuário faz long-press no card (≥ 500 ms) ou toca na estrela da leitura
2. `toggleFavorito(id, collectionName)` é chamado
3. Lê o estado atual em `allRecords` (ou `allBlessings`)
4. Chama `updateDoc(doc(db, collectionName, id), { favorito: !current })`
5. Atualiza o objeto local no array `allRecords`/`allBlessings`
6. Atualiza o ícone no card (`#rc-${id}` ou `#bc-${id}`) sem re-renderizar tudo
7. Se a leitura estiver aberta, atualiza o botão da estrela
8. Vibração curta: `navigator.vibrate?.(30)`

### 6.2 Filtros com estado rastreado

1. Ao clicar "Aplicar Filtros": lê campos do DOM, salva em `filterState`, chama `applyFilterToArray` e `renderFeed`
2. Ao clicar "Limpar Filtros": zera `filterState`, limpa campos do DOM, chama `renderFeed(allRecords, true)`
3. Botão "Limpar Filtros" fica visível apenas quando `hasActiveFilter()` retorna `true`

### 6.3 Sorteio respeitando filtros

- `btnRandom` (principal): se `hasActiveFilter()`, usa `getShufflePool()` para sortear aleatoriamente da pool filtrada. Se pool vazia, mostra alerta. Se sem filtro, mantém lógica de randomSeed do Firestore.
- `readingShuffleBtn` (dentro da leitura): usa `getShufflePool(r.id)` em vez de `allRecords.filter(...)`

## 7. Impactos no sistema existente

- **`renderFeed` não muda**: continua aceitando array, o filtro só muda quem chama ela
- **`btnApplyFilters`**: lógica expandida para salvar `filterState` + mostrar/esconder "Limpar"
- **`btnRandom`**: lógica bifurcada (com filtro → pool local; sem filtro → randomSeed)
- **`readingShuffleBtn`**: troca `allRecords.filter(...)` por `getShufflePool(r.id)`
- **Cards HTML**: adicionar `<button class="card-fav-btn">` dentro do `record-card`
- **Leitura overlay**: adicionar `<button id="readingFavBtn">` na barra de ações

## 8. Riscos técnicos

- **Paginação incompleta**: `allRecords` pode não conter todos os documentos se o usuário não scrollou até o fim. O sorteio filtrado age sobre o subconjunto carregado. Isso é aceitável (mesma limitação já existe no shuffle da leitura).
- **Long-press conflitando com scroll**: mitigar cancelando o long-press se `pointermove` > 8 px durante o hold.
- **Atualização local vs. Firestore**: após `updateDoc`, atualizar o objeto no array local evita re-fetch caro.
- **Re-render parcial**: atualizar apenas o ícone do card afetado em vez de re-renderizar o feed inteiro, para não perder posição de scroll.

## 9. Estratégia de teste

- Marcar favorito via long-press → verificar estrela no card e persistência no Firestore
- Marcar favorito via botão na leitura → verificar reflito no card após fechar
- Filtrar "Apenas favoritos" → verificar apenas cards estrelados aparecem
- Limpar filtros → feed volta ao estado completo, "Limpar" some
- Sorteio com "Apenas favoritos" ativo → apenas favoritos são sorteados
- Sorteio dentro da leitura com filtro ativo → pool filtrada correta
- Desfavoritar enquanto filtro de favoritos ativo → card some da lista imediatamente
- Testar em bencaos com mesmos cenários

## 10. Ordem recomendada de implementação

1. **CSS**: estrela no card + estado ativo do filtro + botão favoritar na leitura
2. **Registros — filterState + Limpar Filtros**: refatorar btnApplyFilters para usar filterState, adicionar botão Limpar
3. **Registros — toggle favorito**: função `toggleFavorito`, atualização local, long-press nos cards, botão na leitura
4. **Registros — filtro de favoritos**: checkbox "Apenas favoritos" no painel, incluir em applyFilter
5. **Registros — sorteio filtrado**: getShufflePool, ajustar btnRandom e readingShuffleBtn
6. **Bênçãos — todas as mudanças acima em paralelo** (mesma sequência)
7. **Bump de versão** (sw.js, ?v= nos imports)
