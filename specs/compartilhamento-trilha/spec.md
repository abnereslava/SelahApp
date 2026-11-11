# Especificação: Compartilhamento de Registro em PDF

## 1. Objetivo

Permitir que o usuário gere e compartilhe um arquivo PDF de um registro específico diretamente a partir do modo leitura, sem criar link público, sem publicar dados e sem alterar permissões ou regras do Firebase.

O PDF deve conter somente o registro atualmente aberto. A trilha de registros deve ser omitida do arquivo, assim como qualquer ação privada do aplicativo.

## 2. Contexto

O Selah exibe registros em um modal de leitura que pode conter título, data, passagem principal, tipo, autoria, passagens relacionadas, temas, conteúdo formatado e links. Alguns registros também pertencem a uma trilha definida pelo campo `continuationOf`.

O compartilhamento inicialmente considerado por link público exigiria uma coleção e regras próprias no Firebase. Essa abordagem foi descartada. O compartilhamento será feito por um PDF gerado localmente no navegador com os dados que já estão carregados no modo leitura.

## 3. Usuários envolvidos

* **Usuário autenticado:** pode gerar e compartilhar o PDF de um registro que esteja lendo no Selah.
* **Destinatário:** recebe apenas o arquivo PDF e não obtém qualquer acesso ao aplicativo, à conta ou a outros registros.

## 4. Funcionamento esperado

### 4.1 Botão de compartilhamento

* O botão deve existir somente no modo leitura de Registros.
* No mobile, deve ser discreto e ficar na mesma linha da data.
* No desktop, deve ficar na barra superior/cabeçalho do diálogo de leitura.
* O botão não deve aparecer nos cards, no formulário de escrita/edição nem nos PDFs.
* Ao tocar no botão, o app deve gerar um PDF do registro atualmente aberto.
* Após a geração, o app deve abrir o compartilhamento nativo do dispositivo quando o navegador aceitar compartilhamento de arquivos.
* Quando o compartilhamento de arquivo não estiver disponível, o PDF deve ser baixado automaticamente para o dispositivo.

### 4.2 Conteúdo do PDF

O arquivo deve preservar, quando existentes:

* título;
* data;
* passagem principal;
* tipo do registro;
* autoria;
* passagens relacionadas;
* temas/palavras-chave;
* conteúdo completo e sua formatação de leitura;
* links anexados ao registro.

O PDF não deve conter:

* trilha de registros;
* registros anteriores ou seguintes;
* botões de favorito, aleatório, editar ou compartilhar;
* menu, cabeçalho de conta ou navegação do aplicativo;
* identificador do usuário;
* dados administrativos;
* conteúdo de qualquer outro registro.

### 4.3 Aparência do PDF

* Formato A4, orientação retrato.
* Fundo branco e texto escuro, independentemente do horário ou tema visual ativo no aplicativo.
* Margens adequadas para impressão e leitura.
* Título, metadados e corpo com hierarquia visual semelhante ao modo leitura.
* Conteúdo longo deve continuar em páginas adicionais sem cortar linhas de texto de forma indevida.
* Nome do arquivo deve ser derivado do título do registro, higienizado para uso como nome de arquivo, com fallback como `registro-selah.pdf`.

## 5. Fluxo principal

1. O usuário abre um registro no modo leitura.
2. Toca no botão discreto de compartilhamento.
3. O botão entra no estado de processamento enquanto o PDF é montado localmente.
4. O app gera um PDF contendo somente o registro aberto.
5. Se o dispositivo suportar compartilhamento de arquivo, o seletor nativo é aberto com o PDF anexado.
6. Caso contrário, o PDF é baixado e o app informa que o arquivo foi salvo para compartilhamento manual.
7. O modal de leitura permanece aberto no mesmo registro.

## 6. Regras de negócio

* Nenhuma coleção, documento, regra ou permissão do Firebase deve ser criada ou alterada.
* A geração deve usar somente os dados do registro já carregado no cliente.
* O PDF deve conter exatamente um registro.
* A trilha pode continuar aparecendo normalmente no modal privado, mas nunca deve ser incluída no PDF.
* O arquivo não deve conter ações interativas privadas.
* A geração do PDF não deve alterar o registro, seu favorito ou qualquer dado salvo.
* O botão deve bloquear acionamentos repetidos enquanto o arquivo estiver sendo gerado.
* [Pendente] Definir se o compartilhamento estará disponível somente para registros do tipo `devocional` ou para todos os tipos da área Registros.

## 7. Permissões

* Apenas usuários que já conseguem abrir o modo leitura autenticado podem gerar o PDF.
* O destinatário recebe um arquivo independente e não ganha permissão no Selah.
* Não há leitura pública nem compartilhamento de credenciais, tokens ou URLs privadas.

## 8. Dados necessários

Nenhum dado novo precisa ser persistido.

Dados usados somente durante a geração:

* registro atualmente aberto;
* metadados já exibidos no modo leitura;
* HTML formatado do conteúdo;
* links do registro;
* nome de arquivo derivado do título.

Dependência técnica prevista:

* biblioteca de geração de PDF executada no navegador, carregada junto ao aplicativo e compatível com conversão de HTML paginado.

## 9. Estados e mensagens

* **Gerando PDF:** botão desabilitado com indicador de processamento.
* **Compartilhando:** seletor nativo aberto pelo dispositivo.
* **Baixado:** mensagem informando que o PDF foi salvo para compartilhamento manual.
* **Erro:** mensagem informando que não foi possível gerar o PDF.
* **Compartilhamento cancelado:** não deve ser tratado como erro de geração.

## 10. Casos extremos

* Registro sem título: usar passagem principal ou nome padrão no cabeçalho e no arquivo.
* Registro muito longo: criar páginas adicionais.
* Conteúdo com listas, títulos, cores e separadores: preservar a estrutura legível dentro das limitações do PDF.
* Imagens externas ou conteúdo não suportado: não bloquear a geração do restante do texto.
* Nome com acentos ou caracteres inválidos: gerar nome de arquivo seguro.
* Navegador que suporta `navigator.share`, mas não aceita arquivos: usar download.
* Usuário cancela o seletor de compartilhamento: manter o modal aberto e não exibir falha genérica.
* Biblioteca indisponível ou falha de carregamento: exibir erro e não alterar o registro.
* Trilha com vários registros: ignorar todos os outros e exportar apenas o registro aberto.

## 11. Critérios de aceite

* [ ] Existe botão discreto de compartilhamento somente no modo leitura.
* [ ] No mobile, o botão fica na mesma linha da data.
* [ ] No desktop, o botão integra a barra superior do diálogo.
* [ ] O botão gera um PDF A4 do registro aberto.
* [ ] O PDF contém somente um registro.
* [ ] A trilha de registros não aparece no PDF.
* [ ] A trilha continua disponível normalmente no modo leitura privado.
* [ ] O PDF preserva título, data, metadados, conteúdo formatado e links existentes.
* [ ] Nenhum botão ou dado privado do aplicativo aparece no arquivo.
* [ ] O compartilhamento nativo de arquivo é usado quando suportado.
* [ ] O fallback baixa o PDF quando o compartilhamento de arquivo não é suportado.
* [ ] Cancelar o compartilhamento não fecha o modo leitura nem gera erro genérico.
* [ ] Nenhum dado ou regra do Firebase é alterado.

## 12. Dúvidas pendentes

* [Pendente] O botão deve aparecer somente em registros do tipo **Devocional** ou em qualquer item da área **Registros**?
