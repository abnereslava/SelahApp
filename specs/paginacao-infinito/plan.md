# Plano: Paginação com Scroll Infinito

## Decisões técnicas

- **Cursor Firestore**: `limit(15)` + `startAfter(lastDoc)` — sem custo extra de leituras.
- **IntersectionObserver**: observa `#devotionalsSentinel` / `#blessingsSentinel` (div invisível após o feed). Desconectado e reconectado a cada `fetchAll()`.
- **allRecords acumulativo**: cada página adiciona ao array; `buildIndices()` chamado a cada página.
- **Filtros**: operam sobre `allRecords` (páginas já carregadas). Não reconectam o observer — usuário vê resultado filtrado do que já foi carregado.
- **Stats**: atualizadas a cada página carregada (podem ser parciais até todas as páginas carregarem — aceitável).
- **Variáveis de paginação**: declaradas dentro de `init()` para serem recriadas a cada visita ao tab.
- **Importações Firestore**: adicionar `limit, startAfter` em ambos os módulos.
- **Limite de client-side filter**: aceito conforme spec (paginação retorna menos de 15 visíveis quando filtros client-side estão ativos).
