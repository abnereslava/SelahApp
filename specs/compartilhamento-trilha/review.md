# Revisão: Compartilhamento de Registro em PDF

## Status

Aprovado com ressalva de validação em dispositivo físico.

## Comparação com a especificação

* [x] O botão de compartilhamento existe somente no modo leitura.
* [x] No mobile, o botão fica na mesma linha da data.
* [x] No desktop, o botão fica na barra de ações do modal.
* [x] O botão está disponível para todos os tipos de registro.
* [x] O documento de exportação contém somente o registro aberto.
* [x] A trilha, ações privadas, favorito e IDs não entram no PDF.
* [x] O compartilhamento usa arquivo PDF quando a Web Share API aceita arquivos.
* [x] Navegadores sem compartilhamento de arquivos recebem o download do mesmo PDF.
* [x] A trilha privada usa a união da coleção completa com a página atual do feed.
* [x] O feed permanece paginado.
* [x] Nenhuma alteração de Firebase foi adicionada.

## Verificações executadas

* `node --check modules/registros.js`
* `node --check script.js`
* `node --check sw.js`
* `git diff --check`
* Teste isolado da união por ID entre `statsRecords` e `allRecords`, incluindo pai ainda não paginado.
* Verificação estática de que `chainHtml` não é fornecido ao gerador de PDF.
* Verificação estática de versões `v48` no CSS, módulo principal, importações dinâmicas e service worker.

## Ressalvas

* A abertura da folha de compartilhamento e o resultado visual do PDF ainda devem ser conferidos no Android real, pois dependem do navegador/WebView e do sistema operacional.
* O PDF é renderizado a partir do HTML como imagem; o texto pode não ser selecionável e registros muito longos podem gerar arquivos maiores.
* O primeiro uso do compartilhamento em PDF depende do carregamento do bundle fixado de `html2pdf.js` pela CDN.

## Resultado

A implementação atende aos requisitos de código e aos testes automatizados disponíveis. A validação final recomendada é abrir registros curtos e longos no celular, gerar os PDFs e conferir a folha nativa de compartilhamento.
