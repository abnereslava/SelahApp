# Plano Técnico: Navegação por Swipe com Animação entre Abas

## 1. Resumo da solução

A navegação por swipe será implementada em `script.js` através de listeners de eventos de toque (`touchstart`, `touchmove`, `touchend`) aplicados ao container de conteúdo principal (`.app-container` ou `#mainContent`). Durante o arraste, o conteúdo atual se translada horizontalmente via `transform: translateX()` em tempo real. Ao soltar, se o deslocamento for suficiente (>30% da largura ou velocidade mínima), altera-se `window.location.hash` para disparar o `hashchange` existente, com animação CSS de slide. Se insuficiente, o conteúdo retorna com animação de snap-back. Um wrapper de animação envolverá os dois painéis (atual + destino) para a transição. Placeholder skeleton é exibido se o módulo de destino ainda não carregou.

## 2. Dependências

- `script.js` — lógica central de navegação (hash routing, `handleRouteChange`, `currentUserFeatures`)
- `style.css` — classes de animação (`slide-enter-left`, `slide-enter-right`, `slide-exit-left`, `slide-exit-right`, `snap-back`)
- `index.html` — estrutura do container de conteúdo
- `navigator.vibrate` — API nativa do browser (sem dependência externa)
- Sem novas bibliotecas externas.

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `script.js` | Adicionar lógica de swipe: detecção de gesto, controle de animação, integração com hash routing |
| `style.css` | Adicionar classes de animação de slide e skeleton loader para transição |
| `index.html` | Verificar se o container de conteúdo tem id/classe adequada para o listener |

## 4. Estrutura de dados

Variáveis de controle do swipe (locais ao módulo de swipe em `script.js`):

```
touchStartX: number        — posição X inicial do toque
touchStartY: number        — posição Y inicial do toque
touchCurrentX: number      — posição X atual durante arraste
isDragging: boolean        — flag de arraste ativo
isAnimating: boolean       — flag de animação em progresso (bloqueia novo swipe)
swipeDirection: 'left'|'right'|null
```

O índice da aba atual é derivado de `currentUserFeatures.indexOf(currentHash)`.

## 5. Regras de segurança e permissões

- A lógica de swipe só navega para abas presentes em `currentUserFeatures`, igual à navegação atual via clique.
- Nenhuma dado sensível envolvido.

## 6. Fluxos técnicos

### Detecção de gesto

```
touchstart → registra touchStartX, touchStartY
touchmove  → calcula deltaX e deltaY
           → se |deltaX| < |deltaY| * 1.5: gesto vertical, ignorar (scroll)
           → se |deltaX| >= limiar: aplica translateX no container em tempo real
touchend   → calcula velocidade (deltaX / deltaTime)
           → se |deltaX| > 30% da tela OU velocidade > 0.5px/ms:
               → determina aba de destino
               → inicia animação de transição
               → window.location.hash = novaAba
               → navigator.vibrate(20)
           → caso contrário: snap-back animation
```

### Animação de transição

Dois containers são sobrepostos durante a transição:
- Container atual: sai com `translateX(-100%)` ou `translateX(100%)` em ~250ms
- Container destino: entra do lado oposto, ao mesmo tempo

O `handleRouteChange` existente já carrega o módulo correto — será integrado para disparar a animação ao invés de apenas substituir o innerHTML.

### Placeholder durante carregamento

Se o módulo do destino ainda não foi importado (primeiro acesso), o container destino exibe um skeleton loader enquanto o `import()` dinâmico resolve.

## 7. Impactos no sistema existente

- `handleRouteChange` em `script.js` será modificado para aceitar um parâmetro opcional de direção de animação.
- O evento `hashchange` continua funcionando normalmente para navegação via clique na bottom nav — nesses casos a direção é calculada automaticamente pela posição do item na lista.
- Nenhum módulo existente (registros.js, bencaos.js, etc.) precisa ser alterado.

## 8. Riscos técnicos

- **Conflito com scroll vertical:** mitigado pela verificação do ângulo do gesto (deltaX vs deltaY).
- **Conflito com editor Quill:** o listener deve verificar se o `event.target` está dentro de `.ql-editor` antes de processar o swipe.
- **Conflito com elementos com scroll horizontal:** verificar se `event.target` está dentro de `.autocomplete-list` ou outros elementos scrolláveis.
- **Performance em dispositivos lentos:** usar `requestAnimationFrame` para aplicar `translateX` durante o arraste.
- **iOS Safari:** `touchmove` pode precisar de `passive: false` para `preventDefault()` funcionar durante o swipe horizontal.

## 9. Estratégia de teste

- Swipe para esquerda na aba Registros → vai para Bênçãos (nova ordem).
- Swipe para direita na aba Bênçãos → volta para Registros.
- Swipe insuficiente → snap-back sem mudar de aba.
- Scroll vertical dentro de uma aba não dispara swipe.
- Digitar e selecionar texto no editor Quill não dispara swipe.
- Vibração ocorre ao completar troca (verificar no celular físico).
- Skeleton aparece na primeira vez que uma aba é acessada via swipe.
- Bottom nav atualiza corretamente após swipe.

## 10. Ordem recomendada de implementação

1. Adicionar classes CSS de animação de slide e skeleton ao `style.css`.
2. Refatorar `handleRouteChange` em `script.js` para aceitar direção e acionar animação.
3. Implementar detecção de swipe com `touchstart`/`touchmove`/`touchend` em `script.js`.
4. Integrar placeholder skeleton para módulos ainda não carregados.
5. Adicionar vibração háptica ao confirmar troca.
6. Testar conflitos com scroll e Quill.
