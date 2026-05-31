# Especificação: FAB de Criação Rápida + Estatísticas Expansíveis

## 1. Objetivo

Centralizar a criação de Registros e Bênçãos num único botão "+" no centro da bottom nav mobile, tornando as abas Registros e Bênçãos exclusivamente de visualização/edição. As estatísticas (gráficos e contadores) migram para o topo dessas abas como cards compactos que expandem ao toque.

## 2. Contexto

Hoje cada aba tem um formulário de criação inline (collapsible accordion no topo) misturado com a lista de itens. Isso sobrecarrega as abas e esconde o conteúdo principal. O padrão "FAB central na bottom nav" (usado por Instagram, Notion, etc.) resolve isso e torna a ação de criar imediata e acessível de qualquer aba.

## 3. Usuários envolvidos

- **Membro Convidado:** cria registros e bênçãos com menos friction.
- **Administrador:** mesma experiência como membro.

## 4. Funcionamento esperado

### 4.1 Bottom nav com FAB central (mobile)

A bottom nav passa de 4 itens iguais para o padrão:

```
[Registros] [Bênçãos]  [✚]  [Orações] [Igreja]
```

O "+" é um botão elevado, circular, dourado, maior que os outros itens — posicionado no centro e levemente acima da barra (efeito de destaque).

Ao tocar no "+", abre um **bottom sheet** com duas opções:
- **Novo Registro** (ícone ph-notebook)
- **Nova Bênção** (ícone ph-gift)

Tocar em uma opção abre o **formulário de criação em tela cheia** (slide-up), com botão de fechar no topo. Salvar ou cancelar fecha o formulário e retorna à aba que estava ativa.

### 4.2 Abas Registros e Bênçãos (view-only)

O formulário inline (collapsible accordion "Novo Registro" / "Nova Bênção") é **removido** das abas. As abas exibem apenas:
1. Cards de estatísticas compactos no topo (expandíveis)
2. Filtros de busca
3. Lista de cards com expansão inline

A edição de um item existente continua funcionando (o botão "Editar" dentro do card expandido abre o mesmo formulário full-screen, pré-preenchido).

### 4.3 Estatísticas expansíveis no topo de Registros

Dois cards compactos no topo da aba Registros:

**Card 1 — Resumo rápido (sempre visível)**
- Total de registros
- Registros este mês
- Tipo mais frequente

Ao expandir → revela os gráficos (pizza "Por Tipo" e barras "Livros Mais Frequentes") que existem hoje.

**[Inferência]** Bênçãos já tem estatísticas (total, este mês, tag principal) — migrar para o mesmo padrão de card expansível no topo da aba Bênçãos.

## 5. Fluxo principal

### Criar novo registro

1. Usuário está em qualquer aba.
2. Toca no "+" central da bottom nav.
3. Bottom sheet sobe com as duas opções.
4. Toca em "Novo Registro".
5. Formulário full-screen desliza de baixo para cima.
6. Preenche campos, salva.
7. Toast de sucesso, formulário fecha.
8. Retorna à aba onde estava.

### Editar registro existente

1. Usuário está na aba Registros.
2. Expande um card.
3. Toca em "Editar".
4. O mesmo formulário full-screen abre, pré-preenchido.
5. Altera, salva.
6. Retorna à lista com card atualizado.

### Ver estatísticas

1. Usuário está na aba Registros.
2. No topo, vê os cards de resumo (total, mês, tipo top).
3. Toca no card → expande revelando os gráficos.
4. Toca novamente → colapsa.

## 6. Regras de negócio

- O "+" só exibe as opções que o usuário tem permissão (se não tiver acesso a Bênçãos, só mostra "Novo Registro").
- O formulário full-screen é o mesmo HTML/lógica atual, apenas reposicionado.
- Nenhuma mudança na estrutura do Firestore.
- No desktop, o "+" não aparece (desktop mantém outra forma de acesso à criação — [Pendente item 5 / visual-desktop-mobile]).

## 7. Permissões

- Sem alteração nas regras de permissão existentes.
- O FAB respeita `currentUserFeatures`.

## 8. Dados necessários

- Sem novos dados. Mesmos campos de Registros e Bênçãos.

## 9. Estados e mensagens

- **Bottom sheet aberto:** overlay escuro semitransparente atrás, sheet com as 2 opções.
- **Formulário full-screen:** botão "✕ Fechar" no canto superior esquerdo.
- **Salvando:** botão de submit com loading.
- **Sucesso:** toast de confirmação.
- **Bottom sheet fechado ao tocar fora:** sim (overlay clicável).

## 10. Casos extremos

- Usuário com apenas uma feature permitida: bottom sheet mostra apenas 1 opção (ou abre diretamente o formulário, sem sheet intermediário).
- Usuário toca em "Editar" dentro do card → formulário pré-preenchido abre corretamente e salva UPDATE (não INSERT).
- Swipe para fechar o formulário full-screen: [Sugestão] arrastar o formulário para baixo fecha com animação — mas pode conflitar com scroll do formulário. Decidir na implementação.

## 11. Critérios de aceite

- [ ] Bottom nav mobile exibe "+" central elevado entre Bênçãos e Orações.
- [ ] Tocar no "+" abre bottom sheet com opções de criação.
- [ ] Formulário full-screen abre e fecha com animação slide-up/down.
- [ ] Criar registro funciona via FAB.
- [ ] Criar bênção funciona via FAB.
- [ ] Editar registro via botão no card abre o mesmo formulário pré-preenchido.
- [ ] Formulários inline removidos das abas Registros e Bênçãos.
- [ ] Estatísticas de Registros aparecem como card expansível no topo da aba.
- [ ] Estatísticas de Bênçãos aparecem como card expansível no topo da aba.
- [ ] FAB respeita permissões do usuário.

## 12. Dúvidas pendentes

- [Pendente] No desktop, como o usuário cria registros após a remoção do formulário inline? Aguarda definição do spec `visual-desktop-mobile`.
- [Sugestão] Arrastar o formulário full-screen para baixo fecha — aprovar ou não na implementação.
