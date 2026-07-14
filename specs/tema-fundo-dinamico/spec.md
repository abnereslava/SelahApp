# Especificação: Tema de Fundo Dinâmico (imagem + janelas translúcidas + filtro por horário)

## 1. Objetivo

Renovar o visual do aplicativo aplicando uma imagem de fundo única em toda a interface, deixando algumas "janelas" (painéis/cartões) translúcidas para que a imagem apareça por trás, sem prejudicar a leitura de registros nem o preenchimento de formulários. Sobre a imagem de fundo, deve ser aplicado um filtro de coloração que muda conforme o horário do dia (tom alaranjado ao entardecer, simulando um céu de fim de tarde; tom escuro durante a noite), criando uma ambientação que acompanha o momento do dia.

## 2. Contexto

O app (PWA de devocionais) hoje usa um fundo sólido (`--bg-color`) e cartões/painéis opacos (`--surface-color`). Já existem no CSS as variáveis `--surface-glass` (rgba translúcido) e `--backdrop-blur` (blur(12px)), atualmente pouco usadas, além de um dark mode preservado em `[data-theme="dark"]`. Esta funcionalidade introduz uma camada de fundo global e transforma superfícies opacas em translúcidas de forma controlada.

## 3. Usuários envolvidos

- Usuário final único (dono do diário devocional). Não há perfis administrativos; a mudança é puramente visual e vale para todos os usuários autenticados.

## 4. Funcionamento esperado

- Uma imagem de fundo fixa cobre toda a área da aplicação (atrás de todo o conteúdo), sem rolar junto com o conteúdo (efeito fixo).
- **Imagem:** a foto indicada pelo usuário (Unsplash, `photo-1522441815192-d9f04eb0615c`).
- Sobre a imagem, uma camada de cor semitransparente é aplicada de acordo com a **faixa de horário atual do dispositivo**:
  - **Manhã/dia:** filtro neutro/claro e suave (mantém a imagem mais fiel e o app bem legível).
  - **Entardecer (tardezinha):** filtro alaranjado/âmbar, simulando céu de fim de tarde.
  - **Noite:** filtro escuro (escurece a imagem), reduzindo o brilho para conforto noturno.
- Algumas janelas ficam **translúcidas** (deixam ver a imagem por trás com desfoque/blur), enquanto as **superfícies de leitura e escrita permanecem legíveis** — com fundo suficientemente opaco (ou blur forte) para garantir contraste do texto.
- O filtro é recalculado quando o app é aberto e periodicamente/na retomada de foco, para acompanhar a passagem do tempo durante o uso.

## 5. Fluxo principal

1. Usuário abre o app.
2. O sistema detecta a hora local e escolhe a faixa (manhã/dia, entardecer, noite).
3. A imagem de fundo é exibida com a camada de cor correspondente à faixa.
4. O usuário navega entre Registros/Bênçãos/etc.; os cartões e painéis translúcidos deixam ver o fundo.
5. Ao abrir a leitura de um registro ou o formulário de criação, o conteúdo textual aparece sobre uma superfície legível (mais opaca), preservando o conforto de leitura/escrita.
6. Se o usuário permanecer com o app aberto e a hora mudar de faixa (ex.: tarde → noite), o filtro se ajusta na próxima verificação (retomada de foco ou intervalo).

## 6. Regras de negócio

- RN1: A imagem de fundo é a mesma em toda a aplicação e fica fixa (não rola com o conteúdo).
- RN2: A legibilidade de leitura e de escrita é prioridade absoluta: superfícies de texto (leitura de registro, editor Quill, formulários) nunca podem ficar translúcidas a ponto de dificultar a leitura.
- RN3: O filtro de cor depende exclusivamente do horário local do dispositivo (não requer dados salvos nem rede).
- RN4: As faixas de horário e cores devem ser definidas por constantes centralizadas e fáceis de ajustar.
- RN5: A funcionalidade não altera dados no Firestore nem regras de negócio existentes; é puramente de apresentação.
- RN6: Deve continuar funcionando offline (a imagem depende de rede externa — ver Casos extremos).

## 7. Permissões

- Não há controle de permissão. Aplica-se a qualquer usuário autenticado. Não há ação de criar/editar/excluir associada.

## 8. Dados necessários

- Nenhum dado persistido é necessário. A única entrada é a hora local (`Date`) do dispositivo.
- [Sugestão] Opcionalmente, cachear a imagem no service worker para funcionamento offline (ver plan.md).

## 9. Estados e mensagens

- Não há estados de carregamento/erro visíveis ao usuário. Se a imagem não carregar (offline/sem cache), a interface deve continuar utilizável com um fundo de cor sólida de fallback (as variáveis de tema atuais).
- Faixas de horário como "estados" visuais: dia, entardecer, noite.

## 10. Casos extremos

- **Offline / imagem externa indisponível:** o app precisa continuar legível. Fallback para cor de fundo sólida caso a imagem não carregue.
- **Transição de faixa durante o uso:** o app fica aberto por horas e cruza o limite de faixa; o filtro precisa atualizar sem recarregar a página.
- **Contraste em cartões translúcidos:** áreas com muito texto sobre a imagem podem perder contraste; blur + camada de cor precisam garantir leitura.
- **Dark mode existente:** já existe `[data-theme="dark"]`. É preciso definir como o filtro por horário interage com o dark mode (ver Dúvidas pendentes).
- **Desempenho em mobile:** `backdrop-filter: blur()` pode custar em aparelhos fracos; usar com parcimônia.
- **Fotossensibilidade/reduce-motion:** não há animação essencial; nenhum piscar. (Sem impacto relevante esperado.)

## 11. Critérios de aceite

- [ ] A imagem indicada aparece como fundo fixo em toda a aplicação (desktop e mobile).
- [ ] Pelo menos um conjunto de janelas (cartões/painéis de listagem) fica visivelmente translúcido, deixando ver a imagem por trás.
- [ ] A leitura de um registro e o formulário de criação permanecem plenamente legíveis (texto com contraste adequado).
- [ ] Ao entardecer, um filtro alaranjado é visível sobre o fundo; à noite, um filtro escuro é visível.
- [ ] O filtro corresponde à hora local e se ajusta ao retomar o foco do app após mudança de faixa.
- [ ] Sem imagem (offline/sem cache), o app continua utilizável com fundo de fallback.
- [ ] Nenhuma regressão nos fluxos existentes (criar/editar/ler registros e bênçãos, filtros, sorteio, favoritos).

## 12. Decisões (confirmadas pelo usuário)

- **Faixas de horário e cores** (confirmado adotar a proposta inicial):
  - Manhã/dia (06:00–16:59): filtro neutro/claro bem suave.
  - Entardecer (17:00–19:29): filtro âmbar/laranja (aprox. `rgba(214, 119, 6, ~0.28)`), simulando céu de fim de tarde.
  - Anoitecer/noite (19:30–05:59): filtro escuro (aprox. `rgba(10, 14, 30, ~0.55)`), escurecendo a imagem.
  - Valores centralizados em constantes de fácil ajuste.
- **Janelas translúcidas** (confirmado — "Listas e menus"): translúcidas → sidebar, stats-card, cartões da lista (`.record-card`), painel de filtros, fab-sheet, barra de ferramentas flutuante e modais. Mantêm fundo legível → leitura de registro (`.reading-scroll`/`.reading-body`), editor (`.ql-editor`) e formulário de criação (`.create-overlay`).
- **Dark mode** (confirmado): **remover o dark mode** (`[data-theme="dark"]`), que não está em uso. À noite, apenas o filtro escurece o fundo; as superfícies e o texto permanecem no tema claro atual, preservando legibilidade.
- **Cache offline da imagem** (confirmado): cachear a imagem de fundo no service worker no primeiro acesso; se indisponível offline, cair em fundo de cor sólida de fallback.
- [Inferência] O usuário quer um visual mais imersivo/"premium"; a translucidez deve ser elegante e discreta, não a ponto de poluir a leitura.
