# Especificação: Layout Desktop Otimizado

## 1. Objetivo

Redesenhar exclusivamente para desktop (≥ 769px) os overlays de criação/edição de registro, visualização (reading overlay), analytics e seletores (passagem bíblica), de modo que sejam apresentados como diálogos/painéis próprios de computador — com dimensões adequadas, mouse, teclado e tela larga — em vez de telas fullscreen herdadas do mobile. A versão mobile permanece intacta.

## 2. Contexto

O app foi concebido como PWA mobile-first. Toda a UI de criação, edição e leitura usa overlays `position: fixed; inset: 0` com visual de tela cheia que faz sentido no celular, mas no desktop resulta em:

- Campos de formulário esticados por toda a largura da tela
- Botões de ação excessivamente grandes para interação com mouse
- Ausência de sensação de "janela/dialog" — o overlay cobre tudo sem margem
- Bottom bar de ações (leitura) pouco ergonômica com mouse, pois fica na borda inferior de uma tela grande
- Drawer/FAB sheet do mobile exibido no desktop sem motivo

A especificação anterior (`visual-desktop-mobile`) fez o conteúdo principal centralizado com `max-width: 720px`, o que melhorou os cards e listas. Esta spec trata especificamente dos overlays e diálogos.

## 3. Usuários envolvidos

- Usuários que acessam o app via browser em computador (desktop/laptop, tela ≥ 769px).

## 4. Funcionamento esperado

### 4.1 Create/Edit Overlay (Registro e Bênção)

No desktop, em vez de ocupar 100vw × 100vh, o overlay de criação/edição aparece como um **dialog centrado** com:
- Largura fixa: ~700px (ou `min(700px, 90vw)`)
- Altura: auto, com `max-height: 90vh` e scroll interno no formulário
- Backdrop escurecido cobrindo o restante da tela
- Border-radius visível (ex: 16px)
- Cabeçalho com título e botão × de fechar
- Rodapé com botões de ação (Salvar, Cancelar, Excluir) em linha horizontal

### 4.2 Reading Overlay (Visualização de Registro/Bênção)

No desktop, o reading overlay aparece como um **dialog centrado** com:
- Largura: ~760px (ou `min(760px, 92vw)`)
- Altura: auto com `max-height: 90vh`, scroll no conteúdo
- A `reading-bottom-bar` passa a ser uma **barra lateral de ações à direita** (ou barra de ações no topo do dialog), não mais na borda inferior da tela
- Botões "Aleatório", "Editar", "Fechar" ficam no topo ou na lateral do dialog, em tamanho adequado para mouse (não excessivamente grandes)
- Trilha de registros (chain) visível abaixo do conteúdo, dentro do dialog

### 4.3 Analytics Overlay

No desktop, o analytics overlay aparece como um **dialog centrado** com:
- Largura: ~900px (ou `min(900px, 92vw)`)
- Altura: auto com `max-height: 90vh`, scroll interno
- Gráficos aproveitam melhor a largura disponível do dialog

### 4.4 Passage Picker Overlay (Seletor de Passagem Bíblica)

No desktop, o seletor de passagem aparece como um **dialog centrado menor** com:
- Largura: ~480px
- Altura: auto com `max-height: 80vh`
- Navegação livro → capítulo via teclado (Tab, Enter, Setas) [Sugestão]

### 4.5 Confirmação (customConfirmModal / customAlertModal)

Estes já usam `<dialog>`, devem manter seu comportamento — apenas verificar que o estilo já é adequado no desktop (provavelmente sim).

### 4.6 FAB e criação rápida

No desktop o `fab-sheet` (drawer) não deve aparecer. O botão `desktop-fab` (canto inferior direito) já existe no HTML — ele deve abrir um dropdown/menu flutuante com as opções "Novo Registro" e "Nova Bênção", em vez do drawer do mobile.

### 4.7 Comportamento de abertura/fechamento

- Clicar no backdrop fecha o dialog (equivalente a clicar em "Fechar"), com a mesma lógica de confirmação de rascunho existente.
- A tecla `Escape` fecha o dialog ativo (já funciona nativamente em alguns casos; garantir para os overlays custom).
- Animação de entrada: `scale(0.96) + opacity 0` → `scale(1) + opacity 1` (sutil, 180ms).

## 5. Fluxo principal

1. Usuário está na tela principal (desktop) vendo os cards.
2. Clica no FAB desktop (canto inferior direito) — surge um menu com "Novo Registro" / "Nova Bênção".
3. Clica em "Novo Registro" — o create overlay aparece como dialog centrado com backdrop.
4. Preenche o formulário, salva — dialog fecha, card aparece na lista.
5. Clica em um card — reading overlay aparece como dialog centrado.
6. Clica em "Editar" dentro do reading overlay — reading fecha, create overlay abre em modo edição.
7. Clica em "Aleatório" — reading overlay atualiza com novo registro.
8. Clica no × ou fora do dialog — fecha (com confirmação se houver rascunho).

## 6. Regras de negócio

- **Mobile intocado**: nenhum estilo ou comportamento mobile é alterado. As mudanças são exclusivamente dentro de `@media (min-width: 769px)`.
- **Lógica preservada**: toda lógica de auto-save, draft recovery, confirmação de descarte, analytics e Quill permanece igual — apenas o container visual muda.
- **Acessibilidade**: o backdrop ao clicar fecha o overlay com a mesma lógica de `_requestClose*` existente (incluindo confirmação de rascunho).
- **Quill toolbar**: no desktop a toolbar do Quill pode usar o posicionamento padrão (não usa `Visual Viewport API` do mobile, pois não há teclado virtual). [Inferência — confirmar comportamento atual]

## 7. Permissões

Sem impacto — mesma autenticação e autorização.

## 8. Dados necessários

Sem impacto no Firestore. Apenas mudanças de apresentação.

## 9. Estados e mensagens

- Estado **aberto**: dialog visível com backdrop.
- Estado **fechando**: animação de saída (opcional).
- Estado **backdrop clicado com rascunho**: exibe confirmação de descarte (mesmo fluxo mobile).
- Estado **Escape pressionado**: mesmo comportamento do clique no ×.

## 10. Casos extremos

- Tela entre 769px e 900px: dialog de analytics (900px) deve encolher para `90vw`.
- Quill toolbar no desktop: verificar se a floating toolbar mobile é exibida desnecessariamente — se sim, ocultá-la no desktop e deixar o Quill usar sua toolbar nativa (snow).
- `_overlayCloseStack`: os handlers de fechamento dos overlays mobile usam este stack para o botão Voltar do Android; no desktop isso não se aplica, mas o stack não deve ser quebrado.
- Dois overlays abertos (ex: reading + passage picker): o picker deve aparecer sobre o reading dialog.

## 11. Critérios de aceite

- [ ] Create overlay de Registros no desktop é um dialog centrado (~700px), não fullscreen.
- [ ] Create overlay de Bênçãos no desktop é um dialog centrado (~700px), não fullscreen.
- [ ] Reading overlay de Registros no desktop é um dialog centrado (~760px), não fullscreen.
- [ ] Reading overlay de Bênçãos no desktop é um dialog centrado (~760px), não fullscreen.
- [ ] Analytics overlay no desktop é um dialog centrado (~900px), não fullscreen.
- [ ] Passage picker no desktop é um dialog centrado (~480px), não fullscreen.
- [ ] Clicar no backdrop fecha o overlay (com confirmação se houver rascunho).
- [ ] Pressionar Escape fecha o overlay ativo.
- [ ] FAB desktop abre menu flutuante, não o drawer do mobile.
- [ ] Mobile (≤ 768px) continua funcionando exatamente como antes.
- [ ] Auto-save e draft recovery funcionam normalmente no desktop.
- [ ] Quill funciona corretamente dentro do dialog desktop.

## 12. Dúvidas pendentes

- [Pendente] A `reading-bottom-bar` vira barra de ações no **topo** do dialog ou na **lateral direita**? Sugestão: topo do dialog (cabeçalho com título + ações), pois é mais comum em dialogs de leitura e mais simples de implementar. Aguardar decisão do usuário.
- [Pendente] A animação de fechamento (fade-out/scale) é desejada, ou apenas a de abertura?
- [Pendente] O Quill no desktop deve usar a toolbar nativa (snow) em vez da floating toolbar mobile?
