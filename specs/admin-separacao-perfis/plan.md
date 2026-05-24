# Plano Tecnico: Separacao de Perfis e Ajustes do Hub Admin

## 1. Resumo da solucao

A implementacao deve ajustar a autenticacao client-side para separar os destinos por perfil: administradores sempre vao para `admin.html`, usuarios comuns sempre vao para `index.html`, e usuarios nao autorizados sao deslogados.

No Hub Admin, a interface sera reorganizada para aproveitar melhor o desktop, remover o link "Voltar ao App", permitir selecionar o tipo de perfil no convite, adicionar filtro por perfil e trocar os chips de permissoes na lista por um resumo com botao de configuracao.

O dado de convite passara a ter um campo de perfil, preservando compatibilidade com documentos antigos sem esse campo. A configuracao detalhada de permissoes deve ficar em modal ou painel dedicado acionado por linha.

Para que as regras do Firestore consigam autorizar administradores convidados com seguranca, novos documentos de `whitelisted_emails` devem usar ID deterministico igual ao e-mail normalizado. Documentos antigos com IDs aleatorios devem ser tratados como legado ate migracao/recriacao.

## 2. Dependencias

* Firebase Authentication para detectar o usuario logado.
* Firestore, colecao `whitelisted_emails`.
* `admin.html` e `admin.js` para a interface e logica do Hub Admin.
* `index.html` e `script.js` para o fluxo de login e remocao de transicao para admin.
* `style.css` e estilos inline atuais do `admin.html` para responsividade e largura desktop.
* Phosphor Icons ja carregado no projeto.

## 3. Arquivos afetados

* `admin.html`: remover botao "Voltar ao App", alterar formulario de convite, adicionar filtro por perfil, adicionar estrutura de modal/painel de permissoes e ajustar layout desktop.
* `admin.js`: mudar protecao de rota para aceitar master e administradores convidados, salvar tipo de perfil, filtrar por perfil, renderizar resumo de permissoes e controlar edicao em modal/painel.
* `script.js`: remover suporte a `?mode=app`, remover criacao dinamica do botao "Painel Admin" e garantir redirecionamento de admin para `admin.html`.
* `style.css`: se necessario, mover/centralizar estilos do Hub Admin para melhorar largura e legibilidade.
* `docs/sistema-atual.md`: apos implementacao, atualizar a documentacao do fluxo atual.
* `specs/admin-separacao-perfis/review.md`: criar somente apos implementacao/revisao.

## 4. Estrutura de dados

Documento de `whitelisted_emails` para usuario comum:

```json
// ID do documento: usuario@gmail.com
{
  "email": "usuario@gmail.com",
  "addedAt": "2026-05-24T12:00:00.000Z",
  "role": "user",
  "features": ["registros", "oracoes", "igreja", "bencaos"]
}
```

Documento de `whitelisted_emails` para administrador convidado:

```json
// ID do documento: admin@gmail.com
{
  "email": "admin@gmail.com",
  "addedAt": "2026-05-24T12:00:00.000Z",
  "role": "admin"
}
```

Compatibilidade:

* Documento sem `role` deve ser tratado como `user`.
* Documento sem `features` e `role=user` deve usar fallback de permissoes padrao.
* Documento com ID aleatorio deve continuar sendo listado e reconhecido por consulta de campo `email` no front-end, mas nao e suficiente para regras Firebase baseadas em `get()` direto por e-mail.
* O master `abner.eslava@gmail.com` pode continuar sendo tratado por constante no codigo e exibido como registro virtual na lista.

Status de permissao:

* Para `role=user`, comparar `features` normalizado com o array padrao.
* Para `role=admin`, tratar permissoes de abas como nao aplicaveis enquanto administradores ficarem isolados no Hub Admin.
* O status "Padrao" ou "Customizadas" deve ser derivado de `features`; nao sera criado campo persistido para isso.

## 5. Regras de seguranca e permissoes

O bloqueio client-side melhora UX, mas nao substitui regras do Firestore. As regras de seguranca devem ser revisadas no Firebase para refletir administradores convidados, ja que eles terao os mesmos poderes do master com a excecao de nao excluir ou desabilitar o master.

Riscos:

* Se as regras atuais permitem escrita somente para `abner.eslava@gmail.com`, administradores convidados conseguirao entrar no Hub, mas nao conseguirao gerenciar convites.
* Se as regras forem ampliadas, precisam validar `role=admin` com cuidado para evitar escalacao indevida.
* A capacidade de administradores convidados convidarem/removerem outros administradores deve depender de uma habilitacao feita pelo master.
* Para regras seguras com `role=admin`, a whitelist deve usar ID por e-mail normalizado, permitindo `get(/whitelisted_emails/{email})` nas rules.

## 6. Fluxos tecnicos

Login no app comum:

1. `script.js` recebe `onAuthStateChanged`.
2. Se e-mail for master, redireciona para `admin.html`.
3. Se e-mail estiver em `whitelisted_emails` com `role=admin`, redireciona para `admin.html`.
4. Se e-mail estiver com `role=user` ou sem `role`, carrega o app comum com `features`.
5. Remove a excecao `?mode=app`.
6. Nao injeta botao "Painel Admin".

Acesso direto ao Hub Admin:

1. `admin.js` recebe `onAuthStateChanged`.
2. Se e-mail for master, libera.
3. Se e-mail tiver documento com `role=admin`, libera.
4. Caso contrario, redireciona para `index.html`.

Convite:

1. Admin informa e-mail.
2. Admin escolhe tipo de perfil.
3. Usa `setDoc(doc(db, "whitelisted_emails", email))` para gravar no documento deterministico do e-mail.
4. Se `user`, define permissoes padrao ou customizadas e bloqueia salvamento se nenhuma aba estiver selecionada.
5. Se `admin`, salva `role=admin`.
5. Valida duplicidade.
6. Persiste no Firestore.

Lista e filtros:

1. `admin.js` carrega documentos e adiciona o master como item virtual.
2. Aplica busca por e-mail.
3. Aplica filtro de perfil.
4. Renderiza lista/tabela com status resumido e botao de configurar.

Configuracao de permissoes:

1. Clique em "Configurar" abre modal/painel.
2. O modal mostra os controles de permissao aplicaveis ao perfil.
3. Ao salvar, atualiza Firestore.
4. Lista e status sao atualizados.

## 7. Impactos no sistema existente

* O fluxo antigo do admin usando `index.html?mode=app` deixara de existir.
* O botao dinamico "Painel Admin" sera removido do app comum.
* Convites antigos continuam validos como usuarios comuns.
* A tabela do admin tera menos informacao visivel por linha e dependera de acao dedicada para editar permissoes.
* A documentacao atual de `specs/admin-hub` ficara parcialmente historica, pois previa link "Painel Admin" e retorno ao app.

## 8. Riscos tecnicos

* Incompatibilidade temporaria entre front-end e regras Firestore para administradores convidados.
* Redirecionamento em loop se `script.js` e `admin.js` divergirem na interpretacao de `role`.
* Quebra de usuarios antigos se fallback de `role`/`features` nao for preservado.
* Perda de clareza se "Padrao" e "Customizadas" nao tiverem criterio consistente.
* Excesso de alteracoes em estilos inline pode dificultar manutencao se nao for feito de forma localizada.

## 9. Estrategia de teste

Testes manuais recomendados:

* Login como master abre `admin.html`.
* Master tentando `index.html?mode=app` volta para `admin.html`.
* Usuario comum convidado abre `index.html` e nao ve botao "Painel Admin".
* Usuario comum digitando `admin.html` e redirecionado/bloqueado.
* Convite de usuario comum cria documento com `role=user`.
* Convite de administrador cria documento com `role=admin`.
* Filtro por perfil alterna entre todos, administradores e usuarios.
* Linha de usuario mostra "Padrao" com permissoes padrao.
* Alterar permissao para usuario muda status para "Customizadas".
* Restaurar permissoes padrao muda status para "Padrao".
* Layout desktop do Hub Admin usa largura maior sem overflow horizontal indevido.

## 10. Ordem recomendada de implementacao

1. Ajustar roteamento/autorizacao por perfil em `script.js` e `admin.js`.
2. Remover botoes de transicao entre areas.
3. Preparar a whitelist para IDs determinísticos por e-mail.
4. Ajustar formulario de convite para incluir tipo de perfil e salvar `role`.
5. Reestruturar lista para resumo de permissoes e filtro por perfil.
6. Criar modal/painel de configuracao de permissoes.
7. Ajustar largura/responsividade do Hub Admin em desktop.
8. Atualizar documentacao em `docs/sistema-atual.md`.
9. Criar `review.md` comparando implementacao com spec/plano/tarefas.
