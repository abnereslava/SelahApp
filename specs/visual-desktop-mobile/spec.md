# Especificação: Paridade Visual Desktop = Mobile

## 1. Objetivo

Fazer com que a versão desktop do app tenha aparência visual idêntica à mobile: mesmos componentes, mesma tipografia, mesmos espaçamentos e mesma densidade de informação. O desktop mantém a sidebar de navegação (não será removida), mas o conteúdo principal deve ser indistinguível visualmente do mobile.

## 2. Contexto

Atualmente o desktop usa a mesma base CSS mas com algumas diferenças práticas:
- O conteúdo ocupa toda a largura disponível (minus sidebar), ficando muito largo em telas grandes
- Alguns espaçamentos e tamanhos foram ajustados para mobile via `@media (max-width: 768px)` mas não revisados para desktop
- Os `.record-card` já usam o mesmo CSS, mas em telas largas os cards esticam horizontalmente de forma não intencional

A ideia é: **o conteúdo principal (cards, formulários, overlays) deve ter aparência de app móvel** independentemente do tamanho da tela, com a sidebar sendo apenas o mecanismo de navegação no desktop.

## 3. Usuários envolvidos

- Todos os usuários que acessam via browser desktop.

## 4. Funcionamento esperado

### 4.1 Área de conteúdo com largura máxima

O `#spaContent` (ou `.app-container`) recebe um `max-width` de ~680px e é centralizado dentro do `main-content`. Isso garante que os cards, formulários e listas nunca fiquem excessivamente largos.

### 4.2 Tipografia idêntica

Todas as regras de tamanho de fonte, espaçamentos e pesos que hoje estão só dentro de `@media (max-width: 768px)` são revisadas — o que faz sentido visualmente também no desktop é promovido para regra global.

### 4.3 Cards idênticos

Os `.record-card` no desktop têm exatamente o mesmo visual do mobile: mesma altura de header, mesma data lateral, mesmos chips, mesma animação de expansão. Nenhum override de largura ou padding diferente para desktop.

### 4.4 Header simplificado

O header desktop atual tem "Registro de Leitura / O que o Senhor falou..." e o greeting do usuário em layout horizontal. Esse header deve ser visualmente equivalente ao header mobile: branding + greeting compactos.

### 4.5 Formulários

Os formulários de criação (quando movidos para full-screen via FAB, spec `fab-criacao-rapida`) devem ter visual idêntico em desktop e mobile. Enquanto o FAB não estiver implementado, o formulário inline no desktop também recebe os mesmos estilos.

### 4.6 Modais e overlays

O `.reading-overlay` (modo leitura) já é `position: fixed; inset: 0` — funciona igual em desktop e mobile. Apenas garantir que `max-width: 680px; margin: 0 auto` seja aplicado dentro do overlay no desktop para não esticar demais.

## 5. Fluxo principal

Não há fluxo novo — apenas refinamento visual. O usuário desktop abre o app e vê exatamente a mesma aparência que no celular, com a sidebar como único elemento extra.

## 6. Regras de negócio

- A sidebar de navegação desktop é mantida (não será removida neste spec).
- Nenhuma funcionalidade será alterada — só CSS.
- O `max-width` do conteúdo não pode quebrar layouts existentes (ex: tabelas, gráficos).

## 7. Permissões

Sem impacto.

## 8. Dados necessários

Sem impacto.

## 9. Estados e mensagens

Sem novos estados — mesmos estados visuais do mobile aplicados ao desktop.

## 10. Casos extremos

- Telas muito largas (1440px+): o conteúdo centralizado com max-width deixa muito espaço vazio nas laterais. Isso é intencional e desejado (foco no conteúdo).
- Gráficos (Chart.js): podem precisar de `max-width` explícito para não quebrarem dentro do container estreito.
- Tabela de filtros com múltiplos campos em linha: verificar se 680px é suficiente ou se precisam empilhar.

## 11. Critérios de aceite

- [ ] Conteúdo principal centralizado com max-width ~680px no desktop.
- [ ] Cards com visual idêntico ao mobile (mesmos tamanhos, padding, tipografia).
- [ ] Header desktop simplificado e compacto como o mobile.
- [ ] Reading overlay centralizado com max-width no desktop.
- [ ] Gráficos funcionam corretamente dentro do container estreito.
- [ ] Nenhuma quebra de layout em telas de 1024px, 1280px e 1440px.

## 12. Dúvidas pendentes

- [Pendente] Após implementação do FAB (`fab-criacao-rapida`): como o usuário desktop cria registros? Opção A: botão "Novo Registro" fixo no topo da aba (substituindo o accordion). Opção B: FAB também no desktop (posição diferente, ex: canto inferior direito). Resolver no spec `fab-criacao-rapida` antes de implementar este.
