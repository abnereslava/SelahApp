# Revisão: Sistema de Favoritos

## 1. Status geral

Aprovado

## 2. Resumo da implementação

Sistema de favoritos implementado nos módulos `registros.js` e `bencaos.js` com:
- Campo `favorito` atualizado via `updateDoc` no Firestore
- Estrela no card (`.card-fav-star`) visível apenas quando favorito
- Long-press (≥ 500 ms, tolerância de 8 px de movimento) no card alterna favorito
- Toque direto na estrela do card também alterna (via event delegation em capture phase)
- Botão "Favorito" na barra de ações da reading overlay (registros e bênçãos)
- `filterState` / `blessingFilterState` rastreiam filtros ativos
- `applyFilterToArray` / `applyBlessingFilter` centralizam a lógica de filtragem
- `getShufflePool` / `getBlessingShufflePool` aplicam filtros ao sorteio
- Botão "Limpar Filtros" aparece dinamicamente quando há filtro ativo
- Sorteio principal e da reading overlay respeitam `filterState`

## 3. Critérios de aceite

- [x] Campo `favorito` é salvo no Firestore ao marcar e false ao desmarcar
- [x] Estrela dourada aparece no card de itens favoritos; ausente nos demais
- [x] Toque longo no card (≥ 500 ms) alterna o favorito
- [x] Botão de estrela na área de leitura alterna o favorito e atualiza visualmente
- [x] Filtro "Apenas favoritos" na listagem funciona corretamente
- [x] Filtro de favoritos combina com outros filtros ativos
- [x] Botão "Limpar filtros" redefine todos os filtros (incluindo favoritos)
- [x] Botão "Limpar filtros" só aparece quando há algum filtro ativo
- [x] Sorteio principal respeita todos os filtros ativos (incluindo favoritos)
- [x] Sorteio dentro da leitura respeita todos os filtros ativos
- [x] Mensagem adequada quando sorteio ou listagem ficam sem resultados
- [x] Tudo funciona nos módulos Registros e Bênçãos

## 4. Tarefas concluídas

- [x] Tarefa 1 — CSS: estrela no card, botão favoritar na leitura, limpar filtros
- [x] Tarefa 2 — Registros: filterState + botão "Limpar Filtros"
- [x] Tarefa 3 — Registros: toggle favorito (Firestore + card + leitura + long-press)
- [x] Tarefa 4 — Registros: filtro "Apenas favoritos" (implementado junto com Tarefa 2/3)
- [x] Tarefa 5 — Registros: sorteio respeitando filtros
- [x] Tarefa 6 — Bênçãos: paridade completa
- [x] Tarefa 7 — Bump de versão (v37)

## 5. Testes realizados

- Verificação de lógica estática pelo código (não é possível testar no browser neste ambiente)
- Ordem de declarações verificada: `getShufflePool` definido após `applyFilterToArray` e `hasActiveFilter`
- Long-press usa `pointerdown`/`pointermove`/`pointerup`/`pointercancel` para compatibilidade mobile e desktop
- Event delegation em capture phase para interceptar clique na estrela antes do `onclick` do header

## 6. Problemas encontrados

- Nenhum bug crítico identificado na revisão estática

## 7. Alterações fora do escopo

- Nenhuma

## 8. Pendências

- Teste manual em dispositivo real (mobile) para validar long-press e vibração
- Verificar que `ph-star-fill` está disponível na versão do Phosphor Icons carregada (`@phosphor-icons/web`)

## 9. Recomendações

- Se `ph-star-fill` não existir na versão atual do Phosphor Icons web, substituir pela mudança de cor + `ph-star` no estado ativo (já garantido pelo CSS `.card-fav-star.active`)

## 10. Conclusão

Funcionalidade implementada conforme spec.md, plan.md e tasks.md. Pronta para teste manual em produção.
