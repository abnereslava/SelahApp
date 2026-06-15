# Especificação: Sistema de Favoritos

## 1. Objetivo

Permitir que o usuário marque registros de leitura e bênçãos como favoritos para acesso rápido e filtragem posterior. Favoritos são indicados visualmente por uma estrela no card e podem ser gerenciados tanto a partir da área de leitura quanto por toque longo no card da listagem.

## 2. Contexto

Os módulos `registros` e `bencaos` possuem listas de cards com paginação infinita, overlay de leitura e sistema de filtros (por data, livro, tipo e aleatoriedade). O favorito é uma propriedade do documento individual no Firestore e deve refletir em tempo real nos cards e na leitura.

Além dos favoritos, o usuário solicitou:
- botão "Limpar filtros" no painel de filtros;
- botão de sorteio (principal e dentro da leitura) deve respeitar todos os filtros ativos, incluindo o filtro de favoritos;
- revisão geral para garantir que os filtros existentes estão funcionando corretamente.

## 3. Usuários envolvidos

- Usuário autenticado (único perfil ativo neste projeto).

## 4. Funcionamento esperado

### 4.1 Marcar/desmarcar favorito

- O usuário pode favoritar ou desfavoritar um item de duas formas:
  a. **Toque longo** no card da listagem (≥ 500 ms): abre um pequeno menu de contexto ou altera diretamente o estado do favorito com feedback visual (toast/vibração curta).
  b. **Botão de estrela** visível na área de leitura (overlay de visualização), próximo ao título ou no cabeçalho.
- A ação alterna o estado: se já é favorito, desfavorita; se não é, favorita.
- Ao favoritar, a estrela no card e na leitura fica preenchida (ativa); ao desfavoritar, volta ao contorno (inativa).

### 4.2 Indicador visual no card

- Um ícone de estrela pequeno aparece no canto do card quando o item é favorito.
- Itens não favoritos não exibem estrela (ícone oculto, sem ocupar espaço extra).

### 4.3 Filtro por favoritos

- No painel de filtros de cada módulo, adicionar uma opção de filtro "Apenas favoritos" (tipo toggle/checkbox).
- Quando ativo, a lista exibe somente itens marcados como favoritos pelo usuário.
- O filtro de favoritos combina com os demais filtros já existentes (data, livro/tema, tipo).

### 4.4 Botão "Limpar filtros"

- O painel de filtros deve ter um botão "Limpar filtros" que redefine todos os campos para o estado padrão (sem filtros ativos), incluindo o filtro de favoritos.
- O botão só fica visível (ou ativo) quando há ao menos um filtro aplicado.

### 4.5 Sorteio respeita filtros ativos

- O botão de sorteio (principal na listagem e dentro da área de leitura) deve sortear apenas dentre os itens que passam pelos filtros ativos no momento.
- Se o filtro de favoritos estiver ativo, sorteia apenas entre favoritos.
- Se nenhum item estiver disponível para o sorteio com os filtros aplicados, exibir mensagem informando que não há itens disponíveis.

### 4.6 Revisão dos filtros existentes

- Verificar se os filtros atuais de data, livro/tema e tipo estão sendo aplicados corretamente tanto na listagem quanto no sorteio.
- Corrigir inconsistências encontradas.

## 5. Fluxo principal

1. Usuário acessa a listagem de Registros ou Bênçãos.
2. Usuário faz toque longo num card ou abre a leitura e toca na estrela.
3. O item passa a ser favorito; a estrela no card fica preenchida.
4. Usuário abre o painel de filtros e ativa "Apenas favoritos".
5. A listagem atualiza mostrando somente favoritos.
6. Usuário usa o sorteio: apenas itens favoritos são considerados.
7. Usuário pressiona "Limpar filtros": todos os filtros são zerados, listagem volta ao estado padrão.

## 6. Regras de negócio

- O estado de favorito é persistido no Firestore, no campo `favorito: boolean` do documento correspondente.
- O estado de favorito é por usuário (documento já é scoped por `userId`).
- Desfavoritar remove o campo ou seta `favorito: false` — ambos devem ser tratados como não favorito.
- O filtro de favoritos na query do Firestore usa `where('favorito', '==', true)`.
- O sorteio deve respeitar os mesmos filtros da listagem ativa, construindo a query de forma idêntica.
- "Limpar filtros" não apaga dados, apenas reseta o estado da UI dos filtros.

## 7. Permissões

- Somente o próprio usuário autenticado pode favoritar/desfavoritar seus documentos.
- As regras do Firestore já garantem acesso restrito por `userId`.

## 8. Dados necessários

- Campo novo no documento Firestore: `favorito: boolean` (opcional; ausente equivale a `false`).
- Estado local de filtro de favoritos: booleano no objeto de filtros do módulo.
- Leitura do campo `favorito` em todos os cards renderizados.

## 9. Estados e mensagens

| Situação | Comportamento |
|---|---|
| Item marcado como favorito | Estrela preenchida no card e na leitura |
| Item não favorito | Estrela ausente no card; contorno na leitura |
| Filtro de favoritos ativo sem resultados | Mensagem "Nenhum favorito encontrado" |
| Sorteio com filtros sem resultados | Toast/alerta "Nenhum item disponível com os filtros atuais" |
| Ação de favoritar | Feedback visual imediato (estrela muda de estado) + [Sugestão: vibração curta no mobile] |

## 10. Casos extremos

- Usuário favorita um item e depois altera filtros que excluem esse item: o item favorito continua marcado, mas não aparece na lista filtrada.
- Usuário tenta sortear com filtros sem nenhum resultado: mensagem apropriada, sem erro.
- Usuário remove um favorito enquanto o filtro "Apenas favoritos" está ativo: o item some da lista imediatamente.
- Item carregado via paginação infinita deve refletir o estado de favorito corretamente.
- [Inferência] Toque longo em mobile pode conflitar com o scroll; o threshold de 500 ms e a detecção de movimento devem evitar ativações acidentais.

## 11. Critérios de aceite

- [ ] Campo `favorito` é salvo no Firestore ao marcar e removido/false ao desmarcar.
- [ ] Estrela preenchida aparece no card de itens favoritos; ausente nos demais.
- [ ] Toque longo no card (≥ 500 ms) alterna o favorito.
- [ ] Botão de estrela na área de leitura alterna o favorito e atualiza visualmente em tempo real.
- [ ] Filtro "Apenas favoritos" na listagem funciona corretamente.
- [ ] Filtro de favoritos combina com outros filtros ativos.
- [ ] Botão "Limpar filtros" redefine todos os filtros (incluindo favoritos).
- [ ] Botão "Limpar filtros" só aparece quando há algum filtro ativo.
- [ ] Sorteio principal respeita todos os filtros ativos (incluindo favoritos).
- [ ] Sorteio dentro da leitura respeita todos os filtros ativos.
- [ ] Mensagem adequada quando sorteio ou listagem ficam sem resultados.
- [ ] Tudo funciona nos módulos Registros e Bênçãos.

## 12. Dúvidas pendentes

- [Pendente] Toque longo: deve abrir um pequeno menu de contexto com opções (Favoritar, Editar, Excluir) ou deve apenas alternar o favorito diretamente com feedback visual? **Sugestão da IA: alternar diretamente com feedback visual (mais simples e consistente com o botão na leitura).**
- [Pendente] A vibração curta ao favoritar é desejada? (Requer `navigator.vibrate`, funciona somente em Android.)
- [Inferência] O campo `favorito` não existe atualmente nos documentos; documentos antigos sem o campo são tratados como não favoritos.
