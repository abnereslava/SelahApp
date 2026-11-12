# Plano Técnico: Normalização Tipográfica dos Registros

## 1. Resumo da solução

Adicionar ao Hub Admin uma ferramenta temporária de análise e migração. A normalização será feita com `DOMParser`, percorrendo blocos HTML e alterando apenas padrões determinísticos. O conteúdo original será armazenado no mesmo documento antes da atualização.

## 2. Dependências

* Firebase Authentication e Firestore já usados no Hub Admin.
* DOMParser nativo do navegador.
* Estrutura atual de `content.texto`, `content.questions` e campos legados `c1` a `c5`.

## 3. Arquivos afetados

* `admin.html`: controles da ferramenta e console.
* `admin.js`: análise, normalização, cópia de segurança e atualização.
* `modules/registros.js`: semântica `h2` para perguntas orientadoras no modo leitura e visualização legada.
* `specs/normalizacao-tipografica-registros/review.md`: evidências e resultado da execução.

## 4. Estrutura de dados

`typographyNormalizationV1`:

* `version`: identificador da regra aplicada.
* `migratedAt`: data ISO.
* `originalContent`: cópia completa do campo `content` anterior.

## 5. Regras de segurança e permissões

* Somente a rota administrativa existente executa a ferramenta.
* A consulta filtra pelo UID informado.
* A prévia é obrigatória antes da execução.
* Documentos acima da margem de tamanho são ignorados.

## 6. Fluxos técnicos

* Consultar `devotionals` por `userId`.
* Para cada documento não migrado, clonar `content` e normalizar cada fragmento HTML.
* Comparar o JSON antes/depois e acumular estatísticas.
* Na aplicação, chamar `updateDoc` individualmente para permitir progresso e isolamento de falhas.

## 7. Impactos no sistema existente

* Apenas o HTML dos conteúdos reconhecidamente normalizáveis será alterado.
* A renderização de perguntas orientadas passará de `h4` para `h2`.

## 8. Riscos técnicos

* Identificação indevida de um parágrafo como versículo: mitigada por lista de livros bíblicos e exigência de referência no início.
* Limite de documento do Firestore: mitigado por estimativa conservadora e recusa de documentos grandes.
* Falha parcial: mitigada por atualização isolada e log individual.

## 9. Estratégia de teste

* Testes unitários da função de normalização com amostras reais anonimizadas/localizadas no repositório.
* Prévia na conta real, conferindo totais e categorias.
* Execução e reabertura de amostras de formato livre e orientado.

## 10. Ordem recomendada de implementação

1. Implementar e testar o normalizador puro.
2. Adicionar controles de prévia e execução ao Hub Admin.
3. Ajustar os títulos das perguntas orientadas no modo leitura.
4. Publicar, executar prévia, aplicar e verificar amostras.
5. Registrar os resultados em `review.md`.
