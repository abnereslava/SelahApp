# Plano: FAB de Criação Rápida

## Decisões técnicas

- **Formulário**: movido do `<details>` inline para um `<div class="create-overlay">` com `position:fixed; transform:translateY(100%)` (não `display:none` para Quill inicializar corretamente).
- **FAB mobile**: `<button class="nav-fab">` no centro do `#mobileBottomNav` entre Bênçãos e Orações, levemente elevado acima da barra.
- **FAB desktop**: `<button class="desktop-fab">` fixo no canto inferior direito, visível apenas em `@media (min-width: 769px)`.
- **Bottom sheet**: HTML estático em `index.html`, visível/invisível por classes CSS. Oculta opções conforme `currentUserFeatures`.
- **Stats card**: elemento `<div class="stats-card">` com expand via CSS grid trick (`grid-template-rows: 0fr → 1fr`), fica no topo de cada aba.
- **Gráficos**: render lazy — Chart.js já renderiza com canvas em DOM transformado; `chart.resize()` chamado no expand.
- **Edição via card**: `editRecord()` abre o create overlay em vez de scrollar para o topo.
- **Permissões**: FAB sheet oculta opções via `currentUserFeatures` ao abrir.
