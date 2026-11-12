# Plano Técnico: Compartilhamento de Registro em PDF

## 1. Resumo da solução

O modo leitura de Registros receberá um botão discreto de compartilhamento. Ao acioná-lo, o módulo montará um elemento temporário com somente os dados do registro aberto, converterá esse elemento em um PDF A4 no navegador e tentará compartilhar o arquivo pela Web Share API. Quando o compartilhamento de arquivos não for suportado, o mesmo Blob será baixado.

Separadamente, a trilha privada deixará de consultar apenas a página corrente do feed. Sua montagem usará uma união por ID entre `statsRecords` e `allRecords`, preservando dados locais mais recentes e permitindo encontrar títulos ainda não paginados.

## 2. Dependências

* `html2pdf.js` 0.10.1, bundle oficial executado no navegador, fixado por URL e SRI.
* Web Share API (`navigator.share` e `navigator.canShare`) para compartilhar o `File` quando suportado.
* APIs nativas `Blob`, `File`, `URL.createObjectURL` e download por elemento `<a>` como fallback.
* Estruturas existentes `allRecords`, `statsRecords`, `RECORD_TYPE_LABELS` e modo leitura.
* Nenhuma alteração no Firebase.

## 3. Arquivos afetados

* `index.html`: carregar o bundle fixado de `html2pdf.js` antes do módulo principal e atualizar a versão de cache do script.
* `modules/registros.js`: unir as fontes da trilha, montar o conteúdo exclusivo do PDF, gerar/compartilhar o arquivo e ligar o botão do modo leitura.
* `style.css`: estilizar a linha de data/compartilhamento, o botão responsivo e o documento temporário de exportação.
* `script.js`: atualizar o cache-busting dos módulos.
* `sw.js`: incrementar a versão do cache da PWA.
* `specs/compartilhamento-trilha/tasks.md`: acompanhar as tarefas.
* `specs/compartilhamento-trilha/review.md`: registrar a revisão final.

## 4. Estrutura de dados

Nenhuma persistência nova.

Estruturas temporárias:

* `recordsById`: `Map` formado por `statsRecords` e `allRecords`; registros locais paginados sobrescrevem versões equivalentes das estatísticas.
* `pdfElement`: elemento DOM fora da tela com cabeçalho, metadados, conteúdo e links do registro aberto.
* `pdfBlob`: Blob `application/pdf` retornado pela biblioteca.
* `pdfFile`: File criado a partir do Blob para a Web Share API.

## 5. Regras de segurança e permissões

* A geração ocorre somente após o usuário autenticado abrir um registro privado.
* O PDF usa somente o objeto do registro aberto; a trilha não é passada ao gerador.
* `userId`, favorito, IDs do Firebase e controles da interface não entram no elemento exportado.
* Nenhuma regra, coleção ou chamada adicional de gravação no Firebase será criada.
* URLs dos links anexados serão preservadas como links do PDF, de acordo com o conteúdo já salvo pelo usuário.

## 6. Fluxos técnicos

### 6.1 Trilha completa

1. Unir `statsRecords` e `allRecords` em um `Map` por ID.
2. Localizar pais por `continuationOf` no mapa.
3. Localizar filhos na coleção completa resultante.
4. Renderizar títulos e links da trilha sem renderizar cards adicionais no feed.
5. Ao abrir um item antigo, `openReadingMode` continuará aceitando registros vindos de `statsRecords`.

### 6.2 PDF

1. Criar o botão no cabeçalho de leitura e associá-lo ao registro atual.
2. Montar um elemento temporário com metadados, corpo e links, sem `chainHtml`.
3. Aplicar estilos próprios de papel branco/A4.
4. Executar `html2pdf().set(...).from(element).toPdf().outputPdf('blob')`.
5. Criar um `File` com nome higienizado.
6. Se `navigator.canShare({ files: [file] })` for verdadeiro, chamar `navigator.share`.
7. Caso contrário, baixar o Blob por URL temporária.
8. Remover o elemento e revogar URLs temporárias no bloco `finally`.

## 7. Impactos no sistema existente

* O feed continua paginado.
* O modo leitura mantém a trilha e as ações atuais.
* A trilha passa a refletir a coleção completa carregada para estatísticas.
* A biblioteca de PDF acrescenta peso ao carregamento da página, mas fica fixada em CDN e só trabalha ao compartilhar.
* Não há impacto em criação, edição, favoritos, sorteio ou Firebase.

## 8. Riscos técnicos

* `html2pdf.js` renderiza o conteúdo como imagem; o texto do PDF pode não ser selecionável e arquivos longos podem ficar maiores.
* A renderização HTML para canvas possui limitações com elementos externos e quebras de página.
* A Web Share API exige contexto seguro e suporte a arquivos; o fallback de download cobre navegadores incompatíveis.
* A ativação transitória do gesto pode expirar durante uma geração muito longa; nesse caso, falha de compartilhamento diferente de cancelamento deve cair no download.
* Ramificações de trilha continuam seguindo o primeiro filho encontrado, compatível com o comportamento atual linear.

## 9. Estratégia de teste

* Verificação de sintaxe dos arquivos JavaScript.
* Verificação estática de cache-busting, presença da dependência e ausência de código Firebase novo.
* Teste unitário isolado da união de registros e montagem de trilha com pai não paginado.
* Teste do gerador com registro livre e registro orientado.
* Inspeção do PDF para confirmar somente um registro, ausência da trilha e paginação de conteúdo longo.
* Teste mobile do botão na linha da data e desktop na barra superior.
* Teste do caminho `navigator.share` com arquivo e do fallback de download.

## 10. Ordem recomendada de implementação

1. Corrigir a fonte usada para montar a trilha e validar o cenário sem scroll.
2. Adicionar dependência e estrutura visual do botão/PDF.
3. Implementar geração, compartilhamento e fallback.
4. Atualizar cache da PWA e executar testes.
5. Registrar a revisão final.
