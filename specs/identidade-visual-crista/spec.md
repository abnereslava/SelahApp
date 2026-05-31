# Especificação: Identidade Visual Cristã e Aparência Profissional

## 1. Objetivo

Elevar a qualidade visual do app Selah a um padrão premium que transmita seriedade, profundidade espiritual e cuidado artesanal — características associadas a um diário devocional cristão de alto valor. O app deve parecer feito sob medida para o propósito de leitura bíblica e registro espiritual, não um template genérico.

## 2. Contexto

O app já possui uma base visual sólida: tema escuro com dourado, tipografia Playfair Display, glassmorphism. No entanto, a identidade cristã ainda é pouco expressiva — não há elementos visuais que remetam imediatamente ao universo bíblico/devocional. O objetivo não é "decorar com cruzes", mas criar uma linguagem visual coerente, sutil e profissional que honre o propósito do app.

## 3. Usuários envolvidos

- **Membro Convidado:** sente que está usando um app especialmente criado para sua jornada espiritual.
- **Administrador:** percebe a maturidade visual do produto.

## 4. Funcionamento esperado

### 4.1 Tipografia refinada

[Sugestão] Adicionar uma segunda fonte para o corpo de texto dos registros e bênçãos: **EB Garamond** ou **Crimson Pro** (Google Fonts, gratuita). Essas fontes têm herança tipográfica clássica associada a livros religiosos e bíblias impressas. Playfair Display permanece para títulos e headings.

### 4.2 Paleta de cores aprofundada

[Sugestão] Refinar a paleta atual com variações mais intencionais:
- **Dourado principal:** `#D4AF37` (atual) → manter
- **Dourado suave (hover/accent):** `#C9A227`
- **Bordô/vinho sutil:** `#6B2D3E` — para chips de tipo de registro, badges e destaques secundários
- **Azul-ardósia profundo:** `#2D3B4E` — para elementos de destaque secundário (ex: passagens bíblicas)
- **Fundo mais rico:** `#1A0F0A` (atual `#2B1E17` pode ser levemente mais profundo)

[Pendente] O usuário aprova a adição de bordô e azul-ardósia como cores secundárias, ou prefere manter apenas dourado sobre escuro?

### 4.3 Elementos decorativos sutis

[Sugestão] Adicionar ornamentos visuais que referenciem o universo bíblico sem ser kitsch:

- **Divisores ornamentais:** uma linha horizontal com um pequeno elemento central (◆ ou † ou ✦) para separar seções em vez de simples `<hr>`. Aplicável entre o formulário e a lista, entre cards no modo leitura.
- **Marca d'água sutil no header/hero:** uma silhueta muito sutil e de baixo contraste de um livro aberto ou pergaminho no background do cabeçalho do app. SVG inline, `opacity: 0.03–0.05`.
- **Versículo do dia no header:** uma linha abaixo do título "Selah" com um versículo bíblico curto rotacionado (de uma lista curada). Ex: *"Selah — Pausa e Reflita. Salmo 46:10"*.
- **Ícones temáticos:** usar ícones Phosphor mais específicos onde cabem: `ph-book-open` para Registros, `ph-hand-heart` para Bênçãos, `ph-cross` ou `ph-church` para Igreja, `ph-hands-praying` para Orações.

[Pendente] O versículo fixo no header agrada, ou prefere não adicionar texto permanente lá?

### 4.4 Header/Branding aprimorado

[Sugestão] O header atual mostra apenas "Olá, [nome]" e botão Sair. Proposta:
- Adicionar o nome "Selah" em tipografia maior e mais elegante no topo.
- Abaixo do nome, um subtítulo suave: *"Diário Espiritual"* em estilo caption dourado.
- [Sugestão] Um separador ornamental abaixo do header antes do conteúdo da aba.

### 4.5 Refinamento de micro-detalhes

- **Bordas e raios:** aumentar ligeiramente o border-radius de inputs e cards de `8px` para `12px` para um visual mais suave e moderno.
- **Sombras mais profundas:** nas cards de registro e no formulário, `box-shadow` com maior spread e menor opacidade para efeito de profundidade.
- **Transições mais suaves:** revisar `--transition` de `0.25s` para `0.3s` com easing mais pronunciado.
- **Ícones com peso consistente:** garantir que todos os ícones Phosphor usem o peso `regular` (não mixing de `bold` e `regular` no mesmo componente).

### 4.6 Estado de carregamento inicial (splash)

[Sugestão] Quando o app está autenticando e carregando, exibir uma tela de splash com:
- Logo/nome "Selah" centralizado.
- Subtítulo "Diário Espiritual".
- Spinner dourado sutil.
- Fundo com a cor do tema (`#2B1E17`).

Isso substitui a tela em branco que aparece antes do carregamento.

## 5. Fluxo principal

O usuário abre o app → vê uma splash screen de carregamento com branding profissional → é autenticado → visualiza o app com nova tipografia, divisores ornamentais, header refinado e paleta de cores aprofundada → todas as interações são acompanhadas de micro-animações suaves.

## 6. Regras de negócio

- Nenhuma funcionalidade existente pode ser afetada por mudanças puramente visuais.
- As variáveis CSS existentes devem ser atualizadas (não duplicadas) para garantir consistência.
- O `admin.html` deve receber as mesmas atualizações tipográficas e de paleta para manter a consistência do ecossistema.

## 7. Permissões

Sem impacto em permissões.

## 8. Dados necessários

- Lista curada de 7–10 versículos bíblicos curtos para rotação no header (hardcoded no HTML/JS, sem Firestore).
- Google Fonts URL atualizada para incluir EB Garamond ou Crimson Pro.

## 9. Estados e mensagens

- **Splash de carregamento:** visível enquanto Firebase Auth verifica sessão.
- **Versículo no header:** rotaciona a cada visita (ou fixo para começar, [Pendente]).

## 10. Casos extremos

- Fontes do Google Fonts podem falhar em conexões lentas → `font-display: swap` garante que o app exibe com fallback.
- Marca d'água SVG no background: deve ser `aria-hidden="true"` e não afetar acessibilidade.
- Divisores ornamentais devem ser puramente decorativos, sem quebrar layout em telas pequenas.

## 11. Critérios de aceite

- [ ] Segunda fonte (EB Garamond ou Crimson Pro) carregada e aplicada no corpo dos registros.
- [ ] Paleta de cores atualizada com variáveis CSS consistentes.
- [ ] Divisores ornamentais presentes entre seções principais.
- [ ] Header com branding "Selah / Diário Espiritual" refinado.
- [ ] Tela de splash durante carregamento inicial.
- [ ] Ícones temáticos na bottom nav e na sidebar.
- [ ] Visual consistente entre `index.html` e `admin.html`.
- [ ] Nenhuma funcionalidade quebrada.

## 12. Dúvidas pendentes

- [Pendente] Aprova a adição de bordô (`#6B2D3E`) e azul-ardósia (`#2D3B4E`) como cores secundárias, ou prefere manter apenas dourado sobre escuro?
- [Pendente] Quer um versículo bíblico fixo/rotativo no header do app? Se sim, quer escolher os versículos ou posso sugerir uma lista?
- [Pendente] A tela de splash deve mostrar apenas o nome "Selah" e um spinner, ou algo mais elaborado?
- [Pendente] Qual segunda fonte prefere para o corpo dos registros? EB Garamond (mais clássica, ligada a bíblias impressas antigas) ou Crimson Pro (mais moderna, legível em telas)?
