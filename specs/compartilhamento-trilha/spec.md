# Especificação: Compartilhamento Público de Trilha

## 1. Objetivo

Permitir que um usuário autenticado compartilhe, a partir do modo leitura, um registro e exclusivamente os demais registros pertencentes à mesma trilha. A pessoa que receber o link poderá ler esse conteúdo sem entrar no Selah, mas não poderá navegar pelo restante dos registros, acessar a conta do proprietário nem usar ações privadas.

Também corrigir o filtro de registros para que a opção **Apenas favoritos** funcione sozinha, sem exigir termo, tipo, autor ou período, e considere todos os registros do usuário, não apenas a página já carregada no feed.

## 2. Contexto

O Selah é uma SPA autenticada por Google/Firebase. Os registros ficam na coleção `devotionals` e formam trilhas por meio do campo `continuationOf`. Atualmente, o modo leitura é acessível somente dentro da área autenticada, e o filtro de favoritos é aplicado sobre `allRecords`, que pode conter apenas a parcela já carregada pela paginação.

O compartilhamento público não deve liberar leitura direta da coleção privada `devotionals`. Deve existir uma representação pública separada contendo somente os campos necessários dos registros autorizados para aquela trilha.

## 3. Usuários envolvidos

* **Proprietário autenticado:** usuário do Selah que pode compartilhar um registro próprio.
* **Visitante do link:** qualquer pessoa que possua o link público, com ou sem conta Google.
* **Usuário sem o link:** não pode consultar nem listar compartilhamentos públicos.

## 4. Funcionamento esperado

### 4.1 Botão de compartilhamento

* O botão deve existir somente no modo leitura de Registros.
* No mobile, deve ser discreto e ficar na mesma linha da data, no topo do conteúdo.
* No desktop, pode ficar no cabeçalho/barra superior do diálogo de leitura.
* O botão não deve aparecer nos cards, no formulário de escrita/edição nem na visualização pública.
* Ao acioná-lo, o app deve preparar um link público da trilha e abrir o compartilhamento nativo do dispositivo quando `navigator.share` estiver disponível.
* Quando o compartilhamento nativo não estiver disponível, o link deve ser copiado para a área de transferência e o usuário deve receber confirmação.

### 4.2 Conteúdo do link público

* O link deve abrir sem exigir login.
* O registro originalmente compartilhado deve ser aberto primeiro.
* A página pública deve exibir a trilha do registro, permitindo abrir os registros anteriores e seguintes que façam parte dela.
* A página pública não deve exibir feed geral, sorteio, favoritos, edição, exclusão, analytics, menu lateral, dados da conta ou links para registros de outras trilhas.
* A navegação pública deve aceitar somente IDs presentes no conteúdo publicado daquele compartilhamento.
* Campos privados ou desnecessários, como `userId`, `favorito`, metadados administrativos e identificadores internos não usados pela tela pública, não devem ser publicados.

### 4.3 Filtro de favoritos

* Marcar somente **Apenas favoritos** e tocar em **Aplicar Filtros** deve listar todos os favoritos do usuário.
* Os demais campos podem permanecer vazios.
* O resultado deve usar a coleção completa já carregada para estatísticas (`statsRecords`) quando disponível, evitando limitar o filtro à primeira página do feed.
* Desfavoritar um item enquanto o filtro estiver ativo deve removê-lo do resultado, preservando o comportamento atual.
* Limpar filtros deve restaurar o feed paginado normal.

## 5. Fluxo principal

### Compartilhamento

1. O proprietário abre um registro no modo leitura.
2. O app monta a trilha completa seguindo `continuationOf` para trás e para frente.
3. O proprietário toca em **Compartilhar**.
4. O app grava ou atualiza um documento público contendo somente o registro selecionado, os registros da mesma trilha e os campos permitidos.
5. O app gera o link e abre o compartilhamento nativo; na ausência dele, copia o link.
6. O visitante abre o link sem autenticação.
7. A página mostra o registro selecionado e permite navegar somente pelos itens incluídos naquela trilha publicada.

### Favoritos

1. O proprietário abre os filtros.
2. Marca somente **Apenas favoritos**.
3. Toca em **Aplicar Filtros**.
4. O feed exibe todos os favoritos disponíveis na coleção completa do usuário.

## 6. Regras de negócio

* O compartilhamento deve ser iniciado somente pelo proprietário autenticado do conteúdo.
* A coleção privada `devotionals` deve continuar inacessível para visitantes anônimos.
* O documento público deve usar um identificador longo e não previsível.
* A leitura anônima deve permitir obtenção de um compartilhamento específico, mas não a listagem da coleção de compartilhamentos.
* O visitante não pode alterar, favoritar, excluir ou editar nenhum registro.
* O visitante não pode sair da trilha publicada por manipulação da URL.
* A trilha publicada deve pertencer integralmente ao mesmo proprietário.
* Conteúdo HTML salvo pelo Quill deve receber o mesmo tratamento de exibição já usado no modo leitura privado.
* [Pendente] Definir se o botão aparece somente para registros do tipo `devocional` ou para todos os tipos presentes na área Registros.
* [Pendente] Definir validade e atualização do link público.

## 7. Permissões

* **Proprietário autenticado:** pode criar/atualizar e, se incluída a revogação, excluir seus próprios compartilhamentos.
* **Visitante:** pode apenas obter um documento público específico por seu identificador; não pode listar compartilhamentos.
* **Outros usuários autenticados:** não podem alterar compartilhamentos de outro proprietário.

As regras do Firestore devem separar `get` de `list`: a leitura pública de um token específico pode ser permitida, enquanto consultas/listagens da coleção pública devem ser negadas.

## 8. Dados necessários

### [Sugestão] Coleção `public_shares`

Cada documento público pode conter:

* `ownerId`: UID usado somente para validar escrita nas regras; não deve ser exibido na página.
* `createdAt`: criação do compartilhamento.
* `updatedAt`: última atualização do conteúdo público.
* `selectedRecordId`: registro que deve abrir primeiro.
* `records`: array de registros sanitizados pertencentes à mesma trilha.
* `schemaVersion`: versão do formato público.

Campos permitidos por registro:

* identificador público interno à trilha;
* título;
* data;
* passagem principal e passagens relacionadas;
* tipo;
* autoria;
* palavras-chave;
* conteúdo textual/HTML;
* relação de continuidade necessária para montar a trilha;
* links anexados ao registro, quando já fazem parte do modo leitura.

## 9. Estados e mensagens

* Preparando compartilhamento.
* Link compartilhado/copiado com sucesso.
* Não foi possível criar o link.
* Compartilhamento não encontrado, inválido ou revogado.
* Conteúdo público carregando.
* Trilha pública vazia ou inconsistente.
* Nenhum favorito encontrado.

## 10. Casos extremos

* Registro sem continuação: o link deve mostrar apenas aquele registro.
* Elo ausente na trilha: publicar somente os registros válidos encontrados, sem abrir acesso a outras coleções.
* Dois registros apontando para o mesmo anterior: a implementação atual considera uma cadeia linear; ramificações devem ser tratadas de forma determinística e registradas no plano técnico.
* Registro da trilha pertencente a outro usuário: deve ser excluído e o compartilhamento deve falhar de forma segura se a integridade não puder ser confirmada.
* Navegador sem Web Share API ou Clipboard API: exibir o link para cópia manual.
* Link alterado manualmente para outro ID: exibir estado de compartilhamento inválido.
* Visitante já autenticado no Selah: o link público deve continuar mostrando apenas a visualização pública, sem ampliar automaticamente o escopo.
* Favoritos ausentes na primeira página, mas presentes em páginas antigas: ainda devem aparecer no filtro.

## 11. Critérios de aceite

* [ ] Existe botão discreto de compartilhamento apenas no modo leitura.
* [ ] No mobile, o botão fica na mesma linha da data.
* [ ] No desktop, o botão integra o cabeçalho/barra superior do diálogo.
* [ ] O compartilhamento usa a interface nativa quando disponível e possui fallback de cópia.
* [ ] O link abre sem login.
* [ ] O visitante pode navegar por todos os registros da trilha publicada.
* [ ] O visitante não consegue acessar registros externos à trilha, feed, sorteio ou ações privadas.
* [ ] A coleção privada `devotionals` não recebe permissão pública de leitura.
* [ ] A coleção pública não pode ser listada anonimamente.
* [ ] Apenas o proprietário pode criar/alterar seu compartilhamento.
* [ ] O filtro funciona com somente **Apenas favoritos** marcado.
* [ ] O filtro de favoritos considera todos os registros do usuário já obtidos para estatísticas.
* [ ] Limpar filtros restaura o feed normal.

## 12. Dúvidas pendentes

* [Pendente] O compartilhamento deve estar disponível somente em registros com tipo **Devocional** ou em qualquer item da área **Registros**?
* [Pendente] O link deve representar uma fotografia permanente do conteúdo no momento do compartilhamento ou acompanhar edições futuras?
* [Pendente] O link deve permanecer válido indefinidamente até revogação manual, expirar automaticamente ou gerar uma nova cópia a cada compartilhamento?
* [Pendente] As regras do Firestore não estão versionadas neste repositório. Confirmar como serão publicadas no projeto Firebase para que a visualização anônima funcione sem liberar a coleção privada.
