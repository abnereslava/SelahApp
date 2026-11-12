# Especificação: Normalização Tipográfica dos Registros

## 1. Objetivo

Padronizar a tipografia dos registros existentes do Selah, preservando o texto e tornando títulos, versículos, separadores e espaçamentos consistentes.

## 2. Contexto

A conta de destino possui centenas de registros criados em períodos e versões diferentes do editor. Uma amostra real revelou títulos já estruturados de formas distintas, versículos com cores diferentes, parágrafos vazios usados como espaçamento e resíduos internos do Quill.

## 3. Usuários envolvidos

* Administrador master, responsável por executar a manutenção.
* Usuário proprietário dos registros, que consulta e edita o conteúdo normalizado.

## 4. Funcionamento esperado

* Disponibilizar no Hub Admin uma ferramenta temporária para analisar e aplicar a normalização em todos os registros de uma conta escolhida.
* Exibir uma prévia quantitativa antes da gravação.
* Preservar o conteúdo textual e os elementos sem classificação segura.
* Criar uma cópia do conteúdo original no próprio documento antes de alterá-lo.
* Ignorar registros já processados pela mesma versão.

## 5. Fluxo principal

1. O administrador escolhe a conta de destino.
2. A ferramenta analisa os registros e informa quantos seriam alterados e quais tipos de ajuste seriam realizados.
3. O administrador aplica a normalização.
4. Cada registro alterado recebe o conteúdo normalizado e a cópia de segurança do conteúdo anterior.
5. O console informa totais, progresso e falhas.

## 6. Regras de negócio

* Converter marcadores Markdown isolados `##` e `###` em títulos `h2` e `h3`.
* Demover `h1` interno para `h2`, pois o título do registro já ocupa o primeiro nível.
* Remover títulos vazios, parágrafos vazios usados apenas como espaçamento e resíduos `.ql-cursor`.
* Remover separadores horizontais duplicados ou sem conteúdo entre eles.
* Preservar títulos `h2` e `h3` existentes.
* Identificar versículos somente quando o bloco iniciar com referência bíblica reconhecível ou indicação de versículo (`v1`, `vv. 1-3`) e contiver texto além da referência.
* Aplicar aos versículos negrito, itálico e azul `#0066cc`.
* Normalizar para azul versículos já destacados em dourado ou em azul parcial.
* Não promover automaticamente frases comuns a títulos quando não houver marcador ou estrutura inequívoca.
* Não corrigir gramática, ortografia, teologia ou conteúdo autoral nesta manutenção.
* Perguntas do formato orientado devem ser apresentadas como `h2` no modo leitura, sem alterar o texto das perguntas.

## 7. Permissões

* A ferramenta fica disponível apenas no Hub Admin já protegido.
* A alteração se limita aos documentos cujo `userId` corresponde à conta selecionada.

## 8. Dados necessários

* Coleção `devotionals`.
* Campos `userId`, `recordFormat` e `content`.
* Novo campo `typographyNormalizationV1` com data, versão e cópia do conteúdo anterior.

## 9. Estados e mensagens

* Conta não selecionada.
* Analisando.
* Prévia concluída sem gravação.
* Aplicando alterações com progresso.
* Concluído com totais.
* Erro por registro, sem interromper os demais.

## 10. Casos extremos

* Registro sem conteúdo: não alterar.
* Documento cujo conteúdo original e cópia excederiam margem segura de tamanho: não alterar e registrar erro.
* HTML inválido: processar apenas o que o navegador conseguir interpretar, sem inventar texto.
* Registro já migrado: ignorar.
* Cabeçalho vazio ou composto apenas por `<br>`: remover.
* Elementos desconhecidos: preservar.

## 11. Critérios de aceite

* [ ] A ferramenta apresenta uma prévia sem gravar dados.
* [ ] A execução alcança todos os registros da conta escolhida.
* [ ] O texto legível permanece inalterado, exceto por resíduos explícitos `##`, `###` e caracteres internos do editor.
* [ ] Versículos reconhecidos ficam em negrito, itálico e azul.
* [ ] `h1` interno vira `h2`; `h2` e `h3` válidos permanecem.
* [ ] Parágrafos e títulos vazios são removidos.
* [ ] Separadores redundantes são removidos.
* [ ] O conteúdo original é salvo antes de cada alteração.
* [ ] Registros já processados não são modificados novamente.
* [ ] Perguntas orientadoras aparecem como `h2` no modo leitura.

## 12. Dúvidas pendentes

Nenhuma. As regras conservadoras preservam estruturas ambíguas em vez de classificá-las automaticamente.
