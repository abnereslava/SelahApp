# Especificação: Redesign das Áreas de Registro e Visualização (Registros e Bênçãos)

## 1. Objetivo

Reformular completamente a interface das abas "Registros" e "Bênçãos" com foco em estética refinada e experiência de uso fluida no celular, sem perder nenhuma funcionalidade existente. O objetivo é transformar o app em algo que pareça um diário espiritual premium, não apenas um formulário funcional.

## 2. Contexto

Atualmente ambas as abas apresentam:
- Um formulário em accordeon (`<details>`) para criar novos itens.
- Uma lista de itens já registrados abaixo do formulário.

A UX atual é funcional mas genérica. O redesign deve elevar o padrão visual e de interação para algo que inspire o usuário a usar o app com frequência e com prazer.

## 3. Usuários envolvidos

- **Membro Convidado:** cria e visualiza registros devocionais e bênçãos no celular.
- **Administrador:** também usa as abas como membro.

## 4. Funcionamento esperado

### Área de criação (formulário)

[Sugestão A — Criação por Bottom Sheet]
Ao tocar em um botão flutuante (FAB — Floating Action Button) fixo no canto inferior direito da tela, um painel desliza de baixo para cima (bottom sheet), cobrindo parcialmente a tela. O formulário fica dentro desse painel. O usuário preenche e salva. O painel fecha com animação suave.

[Sugestão B — Página dedicada de criação]
Tocar no FAB ou no botão "Novo Registro" abre uma tela de criação que substitui o conteúdo da aba com animação de slide. O usuário preenche, salva e retorna à lista com animação de retorno. Mais espaço disponível para o editor.

[Sugestão C — Card colapsável aprimorado (evolução do atual)]
Manter o formulário inline no topo da aba, mas redesenhá-lo visualmente: campos com estilo de "linha de fundo" (underline) em vez de bordas completas, agrupamento por seções com ícones maiores, e botão de salvar proeminente. Menos disruptivo, sem mudança estrutural.

### Área de visualização (lista de registros)

[Sugestão A — Timeline vertical com cards]
Cada registro é exibido como um card com:
- Data formatada como "31 Mai" em destaque dourado.
- Título em destaque.
- Passagem principal como subtítulo.
- Tag de tipo (Devocional, Culto Doméstico, etc.) como chip colorido.
- Trecho do conteúdo (2-3 linhas) com botão "ler mais".
- Linha de conexão vertical (|) entre cards para efeito de timeline.

[Sugestão B — Lista compacta com expansão inline]
Cards menores, apenas título + data + tipo. Ao tocar, o card expande inline mostrando o conteúdo completo, com animação de accordion. Bom para quem tem muitos registros.

[Sugestão C — Grade de cards com capa]
Dois cards por linha, com data em destaque e título. Ao tocar, abre em uma tela de leitura de tela cheia com fundo escuro e tipografia grande (modo leitura). Esteticamente mais rico.

### Área de criação — Bênçãos

[Sugestão A — Card de gratidão rápida]
Formulário simplificado: apenas um campo de texto livre ("O que Deus fez por você hoje?") com campo de data. Sem campos adicionais obrigatórios. Tom mais leve e celebrativo.

[Inferência] Bênçãos provavelmente tem estrutura mais simples que Registros — confirmar campos existentes antes de especificar detalhes.

### Área de visualização — Bênçãos

[Sugestão A — Mural de cartões]
Bênçãos exibidas como post-its empilhados em grade, com cores suaves distintas (tons terrosos: bege, areia, dourado). Cada cartão mostra data e texto. Toque expande para leitura completa.

[Sugestão B — Timeline idêntica aos Registros]
Consistência visual com a aba de Registros.

## 5. Fluxo principal

### Registros

1. Usuário abre a aba "Registros".
2. Visualiza a lista de registros anteriores como cards de timeline.
3. Toca no FAB (ou botão de criação) para adicionar novo registro.
4. Preenche o formulário [no bottom sheet / na tela de criação / no formulário inline].
5. Salva. Feedback de sucesso (toast ou animação).
6. Retorna à lista com o novo registro aparecendo no topo.

### Bênçãos

1. Usuário abre a aba "Bênçãos".
2. Visualiza o histórico de bênçãos.
3. Toca no FAB para registrar nova bênção.
4. Preenche o campo de texto rápido.
5. Salva. Animação celebrativa breve (ex: brilho dourado).
6. Nova bênção aparece no topo da lista/mural.

## 6. Regras de negócio

- Nenhuma funcionalidade existente pode ser removida: criar, editar, excluir, buscar registros.
- Os campos existentes devem ser mantidos, ainda que reorganizados ou tornados opcionais visualmente.
- A identidade visual deve seguir o tema atual: fundo escuro, dourado, tipografia Playfair Display, glassmorphism.
- A edição de um registro existente deve abrir o mesmo formulário de criação, pré-preenchido.

## 7. Permissões

- Apenas usuários autenticados com permissão para a aba específica podem criar/editar/excluir.
- Sem alteração nas regras de permissão existentes.

## 8. Dados necessários

### Registros (já existentes no Firestore)
- título, data, continuação, passagem principal, tipo, autores, passagens relacionadas, palavras-chave, conteúdo (Quill delta)

### Bênçãos
- [Pendente] Verificar campos atuais do módulo bencaos.js antes de especificar.

## 9. Estados e mensagens

- **Lista vazia:** ilustração ou mensagem encorajadora ("Comece seu diário espiritual hoje").
- **Carregando registros:** skeleton loader (cartões cinza animados pulsando).
- **Salvando:** indicador de loading no botão de salvar.
- **Sucesso:** toast de confirmação com animação de entrada/saída.
- **Erro:** toast de erro com mensagem clara.
- **Modo leitura:** conteúdo exibido com tipografia grande e espaçamento generoso.

## 10. Casos extremos

- Registros com conteúdo muito longo: truncar na lista com "ler mais".
- Registros sem título: exibir data como identificador visual.
- Bênçãos sem texto: [Inferência] validação deve impedir salvar sem conteúdo.
- Muitos registros: paginação ou carregamento incremental (infinite scroll leve).
- Editor Quill em bottom sheet: verificar se o teclado virtual não bloqueia o editor.

## 11. Critérios de aceite

- [ ] Lista de registros renderiza como cards de timeline com dados corretos.
- [ ] Criação de novo registro funciona sem perda de nenhum campo existente.
- [ ] Edição de registro existente abre formulário pré-preenchido.
- [ ] Exclusão de registro funciona com confirmação.
- [ ] Área de bênçãos redesenhada mantém todas as funcionalidades.
- [ ] Visual consistente com o tema escuro/dourado do app.
- [ ] Skeleton loader exibido durante carregamento.
- [ ] Estado vazio exibido quando não há registros.
- [ ] Funciona corretamente em mobile (375px–430px de largura).

## 12. Dúvidas pendentes

- [Pendente] Qual das sugestões de layout para o formulário de criação você prefere? (Bottom Sheet / Tela dedicada / Card inline aprimorado)
- [Pendente] Qual das sugestões para a lista de registros você prefere? (Timeline / Lista compacta / Grade com capa)
- [Pendente] Para Bênçãos: o formulário deve ser simplificado ou manter os mesmos campos de Registros?
- [Pendente] Para Bênçãos: mural de cartões ou timeline como Registros?
- [Pendente] Deve haver um "modo leitura" dedicado ao abrir um registro?
- [Pendente] Confirmar campos atuais do módulo bencaos.js antes de planejar.
