# Especificação: Navegação por Swipe com Animação entre Abas

## 1. Objetivo

Permitir que o usuário navegue entre as abas do app (Registros, Bênçãos, Orações, Igreja) deslizando horizontalmente com o dedo, com transição animada suave, de forma semelhante a apps nativos como Instagram e WhatsApp.

## 2. Contexto

Atualmente a navegação entre abas ocorre apenas por toque nos itens da bottom nav. Em mobile, o swipe horizontal é um padrão esperado e sua ausência torna a experiência menos fluida. O app já usa uma arquitetura SPA (Single Page Application) com módulos carregados dinamicamente — a transição entre elas hoje não tem nenhuma animação.

## 3. Usuários envolvidos

- **Membro Convidado:** usuário principal, navega pelas abas no celular.
- **Administrador:** também usa o app, mas com acesso a mais abas.

## 4. Funcionamento esperado

- O usuário arrasta o dedo horizontalmente na área de conteúdo (não na bottom nav).
- Se o arrastar for suficiente (>30% da largura da tela ou velocidade mínima de swipe), a aba avança ou recua na ordem das abas visíveis.
- A transição acontece com animação: a aba atual sai pela esquerda/direita enquanto a nova entra pelo lado oposto.
- A bottom nav se atualiza automaticamente para refletir a aba ativa.
- Durante o swipe, o conteúdo acompanha o dedo em tempo real (efeito de "arrastar"), dando feedback tátil visual.
- Se o swipe for insuficiente, o conteúdo retorna para a aba atual com animação de retorno.

## 5. Fluxo principal

1. Usuário está na aba "Registros".
2. Arrasta o dedo da direita para a esquerda.
3. O conteúdo de "Registros" começa a sair pela esquerda; o conteúdo de "Bênçãos" começa a entrar pela direita.
4. Se o usuário soltar com deslocamento suficiente → transição se completa, aba muda para "Bênçãos".
5. Se soltar sem deslocamento suficiente → conteúdo retorna para "Registros" com bounce leve.
6. A bottom nav destaca "Bênçãos" como ativa.

## 6. Regras de negócio

- O swipe deve funcionar apenas na área de conteúdo principal, não conflitar com scroll vertical.
- A ordem das abas para o swipe deve ser a mesma ordem da bottom nav.
- Abas sem permissão para o usuário logado não devem aparecer na sequência de swipe.
- [Inferência] O swipe deve ser desabilitado quando o usuário estiver dentro de um campo de texto, editor Quill, ou scroll horizontal interno (como carrossel ou tabela).
- Apenas em mobile (largura ≤ 768px). Desktop mantém navegação por clique na sidebar.

## 7. Permissões

- Todos os usuários com acesso ao app têm acesso ao swipe nas abas que já são permitidas para eles.

## 8. Dados necessários

- Lista das abas visíveis para o usuário atual (já controlada pelo sistema de features).
- Aba atualmente ativa.

## 9. Estados e mensagens

- **Durante swipe:** conteúdo se move em tempo real com o dedo (translate3d).
- **Swipe completo:** animação de saída/entrada com easing suave (~250ms).
- **Swipe cancelado:** conteúdo retorna com animação de "snap back" (~150ms).
- **Na primeira aba, swipe para a direita:** resistência leve (efeito rubber-band), sem mudar de aba.
- **Na última aba, swipe para a esquerda:** idem.

## 10. Casos extremos

- Conflito com scroll vertical: o gesto deve ser interpretado como swipe apenas se o ângulo horizontal for dominante (>30° de diferença em relação ao eixo vertical).
- Campos de texto e editor Quill: o swipe não deve interceptar o texto sendo arrastado para seleção.
- Usuários com apenas uma aba visível: swipe não tem efeito.
- [Pendente] O que acontece se o conteúdo da aba ainda estiver carregando durante o swipe?

## 11. Critérios de aceite

- [ ] Arrastar horizontalmente a área de conteúdo em mobile navega entre as abas.
- [ ] A animação de transição acompanha o dedo em tempo real.
- [ ] Swipe insuficiente retorna para a aba original com animação suave.
- [ ] A bottom nav é atualizada ao mudar de aba via swipe.
- [ ] Não conflita com scroll vertical.
- [ ] Não conflita com o editor Quill.
- [ ] Funciona apenas em mobile (≤ 768px).
- [ ] Respeita as abas visíveis por permissão do usuário.

## 12. Dúvidas pendentes

- [Pendente] Se o conteúdo da aba ainda estiver sendo carregado durante o swipe, deve-se mostrar um placeholder ou bloquear o swipe até o carregamento completo?
- [Pendente] Deve haver feedback de vibração (Haptic Feedback via `navigator.vibrate`) ao completar a troca de aba?
