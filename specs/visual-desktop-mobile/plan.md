# Plano: Paridade Visual Desktop = Mobile

## Decisões técnicas

- **max-width**: `.app-container { max-width: 720px }` globalmente; override mobile `max-width: 100%` mantido.
- **Header desktop**: `.header-titles` oculto em desktop (`@media (min-width: 769px)`); `.app-header` com padding reduzido.
- **Reading overlay**: `.reading-scroll` e `.reading-toolbar` com `max-width: 680px; margin: 0 auto` em desktop para não esticar.
- **Gráficos (Chart.js)**: naturalmente responsivos dentro do container 720px; `max-width: 100%` nos canvas se necessário.
- **Sem quebra de layout**: tabelas e grades já usam `flex-wrap` e `auto-fit`; nenhum ajuste necessário.
