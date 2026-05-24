# Fluxo de Desenvolvimento Orientado por Especificação

Este projeto utiliza um fluxo leve de desenvolvimento orientado por especificação para criação, alteração e revisão de funcionalidades.

Sempre que for solicitada a criação de uma nova funcionalidade, a IA deve seguir este processo antes de escrever código.

## Regra principal

Nenhum código deve ser implementado antes da criação e aprovação dos arquivos de especificação da funcionalidade.

A IA deve primeiro entender a funcionalidade, documentar a intenção, planejar a implementação, quebrar em tarefas pequenas e somente depois implementar.

## Estrutura de arquivos por funcionalidade

Para cada nova funcionalidade, criar uma pasta dentro de:

/specs/

O nome da pasta deve ser curto, descritivo e em kebab-case.

Exemplos:

/specs/convites-login/
/specs/dossie-individual/
/specs/ambiente-demonstracao/
/specs/relatorios-ia/

Dentro da pasta da funcionalidade, criar os seguintes arquivos:

spec.md
plan.md
tasks.md
review.md

A ordem correta de trabalho é:

spec.md → plan.md → tasks.md → implementação → review.md

# 1. spec.md

## Finalidade

O arquivo spec.md descreve o que a funcionalidade deve fazer do ponto de vista do produto, dos usuários e das regras de negócio.

Este arquivo não deve conter implementação detalhada, código ou decisões técnicas profundas.

## Objetivo

Registrar com clareza:

* o que será criado;
* por que a funcionalidade existe;
* quem usará a funcionalidade;
* quais fluxos devem funcionar;
* quais regras devem ser respeitadas;
* quais permissões existem;
* quais casos extremos precisam ser considerados;
* quais critérios indicam que a funcionalidade está pronta.

## Estrutura obrigatória

O arquivo spec.md deve conter:

# Especificação: [Nome da funcionalidade]

## 1. Objetivo

Descrever, em linguagem clara, o propósito da funcionalidade.

## 2. Contexto

Explicar onde esta funcionalidade se encaixa no sistema existente.

## 3. Usuários envolvidos

Listar os perfis de usuário envolvidos, como administrador, professor, coordenação, responsável, estudante ou outro perfil aplicável.

## 4. Funcionamento esperado

Descrever o comportamento esperado da funcionalidade em linguagem natural.

## 5. Fluxo principal

Descrever o passo a passo ideal de uso.

## 6. Regras de negócio

Listar as regras obrigatórias que o sistema deve respeitar.

## 7. Permissões

Definir quem pode visualizar, criar, editar, excluir, aprovar ou executar ações relacionadas à funcionalidade.

## 8. Dados necessários

Listar os dados que precisam ser lidos, salvos, atualizados ou exibidos.

## 9. Estados e mensagens

Definir estados como carregando, vazio, sucesso, erro, bloqueado, sem permissão ou confirmação.

## 10. Casos extremos

Listar situações que podem gerar erro, inconsistência ou comportamento inesperado.

## 11. Critérios de aceite

Criar uma lista objetiva de condições que precisam ser cumpridas para considerar a funcionalidade concluída.

## 12. Dúvidas pendentes

Listar decisões que ainda precisam ser respondidas antes da implementação.

## Regras para criação do spec.md

* Não escrever código.
* Não inventar funcionalidades não solicitadas.
* Não tomar decisões importantes sem registrar como dúvida ou suposição.
* Se algo não estiver claro, marcar como [Pendente].
* Se algo for apenas uma sugestão da IA, marcar como [Sugestão].
* Se algo for uma inferência baseada no projeto existente, marcar como [Inferência].
* A IA não deve transformar [Inferência], [Sugestão] ou [Pendente] em requisito obrigatório sem confirmação.

# 2. plan.md

## Finalidade

O arquivo plan.md traduz a especificação aprovada em um plano técnico de implementação.

Ele deve explicar como a funcionalidade será construída, quais arquivos podem ser afetados, quais dados serão usados e quais riscos existem.

## Objetivo

Registrar:

* abordagem técnica;
* arquivos que provavelmente serão criados ou alterados;
* estrutura de dados;
* regras de segurança;
* integrações necessárias;
* riscos técnicos;
* ordem recomendada de implementação.

## Estrutura obrigatória

O arquivo plan.md deve conter:

# Plano Técnico: [Nome da funcionalidade]

## 1. Resumo da solução

Explicar, em linguagem técnica clara, como a funcionalidade será implementada.

## 2. Dependências

Listar dependências internas e externas, como Firebase, autenticação, banco de dados, APIs, componentes existentes ou bibliotecas.

## 3. Arquivos afetados

Listar os arquivos que provavelmente serão criados ou modificados.

Para cada arquivo, informar o motivo da alteração.

## 4. Estrutura de dados

Descrever coleções, documentos, campos, objetos, tabelas, estados ou estruturas necessárias.

## 5. Regras de segurança e permissões

Descrever validações, autenticação, autorização, regras de acesso e riscos de exposição de dados.

## 6. Fluxos técnicos

Descrever como os dados entram, são processados, salvos, lidos e exibidos.

## 7. Impactos no sistema existente

Explicar quais partes do sistema podem ser afetadas.

## 8. Riscos técnicos

Listar riscos de quebra, inconsistência, lentidão, falha de permissão ou perda de dados.

## 9. Estratégia de teste

Descrever testes manuais ou automatizados recomendados.

## 10. Ordem recomendada de implementação

Listar a sequência técnica mais segura para construir a funcionalidade.

## Regras para criação do plan.md

* Não implementar código ainda.
* Não alterar arquivos do projeto nesta etapa.
* Não planejar funcionalidades fora do escopo do spec.md.
* Se uma decisão técnica depender de informação ausente, marcar como [Pendente].
* Se houver risco relevante, destacar claramente.
* O plano deve ser compatível com o sistema existente.

# 3. tasks.md

## Finalidade

O arquivo tasks.md quebra o plano técnico em tarefas pequenas, sequenciais e verificáveis.

Ele serve para orientar a implementação uma etapa por vez.

## Objetivo

Evitar que a IA tente implementar uma funcionalidade inteira de uma vez.

Cada tarefa deve ser pequena o suficiente para ser implementada, revisada e testada isoladamente.

## Estrutura obrigatória

O arquivo tasks.md deve conter:

# Tarefas: [Nome da funcionalidade]

## Visão geral

Breve resumo da sequência de implementação.

## Tarefa 1 — [Nome da tarefa]

Status: Pendente

### Objetivo

Explicar o que esta tarefa entrega.

### Arquivos afetados

Listar arquivos que devem ser criados ou alterados nesta tarefa.

### Dependências

Informar se depende de alguma tarefa anterior.

### Critério de conclusão

Definir objetivamente quando a tarefa pode ser considerada concluída.

### Teste manual

Explicar como verificar se a tarefa funcionou.

### Observações

Registrar riscos, cuidados ou restrições.

## Tarefa 2 — [Nome da tarefa]

Status: Pendente

### Objetivo

Explicar o que esta tarefa entrega.

### Arquivos afetados

Listar arquivos que devem ser criados ou alterados nesta tarefa.

### Dependências

Informar se depende de alguma tarefa anterior.

### Critério de conclusão

Definir objetivamente quando a tarefa pode ser considerada concluída.

### Teste manual

Explicar como verificar se a tarefa funcionou.

### Observações

Registrar riscos, cuidados ou restrições.

## Regras para criação do tasks.md

* As tarefas devem seguir a ordem do plan.md.
* Cada tarefa deve ter escopo pequeno.
* Cada tarefa deve ter critério de conclusão claro.
* Cada tarefa deve ter pelo menos um teste manual.
* A IA deve implementar apenas uma tarefa por vez.
* A IA só pode marcar uma tarefa como concluída se o critério de conclusão foi atendido.
* Tarefas futuras não devem ser implementadas antecipadamente.

# 4. review.md

## Finalidade

O arquivo review.md registra a revisão da implementação em comparação com os arquivos de especificação, plano e tarefas.

Ele serve para verificar se a funcionalidade foi construída corretamente e se algo ficou pendente.

## Objetivo

Comparar o código implementado com:

* spec.md;
* plan.md;
* tasks.md.

E registrar:

* o que foi implementado;
* critérios atendidos;
* pendências;
* riscos;
* bugs encontrados;
* alterações fora do escopo;
* status final da funcionalidade.

## Estrutura obrigatória

O arquivo review.md deve conter:

# Revisão: [Nome da funcionalidade]

## 1. Status geral

Informar um dos seguintes status:

* Não iniciado
* Em andamento
* Aprovado
* Aprovado com ajustes
* Reprovado

## 2. Resumo da implementação

Descrever o que foi implementado.

## 3. Critérios de aceite

Listar os critérios definidos no spec.md e marcar quais foram atendidos.

Exemplo:

* [x] Critério atendido
* [ ] Critério pendente

## 4. Tarefas concluídas

Listar tarefas concluídas com base no tasks.md.

## 5. Testes realizados

Registrar testes manuais ou automatizados executados.

## 6. Problemas encontrados

Listar bugs, inconsistências, limitações ou riscos.

## 7. Alterações fora do escopo

Informar se algum arquivo, comportamento ou regra foi alterado sem estar previsto.

## 8. Pendências

Listar o que ainda precisa ser feito.

## 9. Recomendações

Sugerir próximos passos, se necessário.

## 10. Conclusão

Informar se a funcionalidade pode ser considerada pronta ou se precisa de ajustes.

## Regras para criação do review.md

* A revisão deve ser feita após a implementação de uma ou mais tarefas.
* A IA deve comparar explicitamente o código com os arquivos spec.md, plan.md e tasks.md.
* Se algo foi implementado fora do escopo, deve ser registrado.
* Se algum critério de aceite não foi cumprido, deve ser marcado como pendente.
* Se houver risco de segurança, dados ou permissões, deve ser destacado.
* A IA não deve corrigir automaticamente durante a revisão, a menos que seja solicitada.

# Regras gerais para a IA

## Antes de implementar

A IA deve:

1. Criar ou atualizar spec.md.
2. Apontar dúvidas pendentes.
3. Aguardar aprovação ou confirmação do usuário quando houver decisões relevantes.
4. Criar plan.md.
5. Criar tasks.md.
6. Só então iniciar a implementação.

## Durante a implementação

A IA deve:

* implementar apenas uma tarefa por vez;
* seguir spec.md, plan.md e tasks.md;
* não criar funcionalidades extras;
* não alterar arquitetura sem justificativa;
* não refatorar partes fora do escopo sem necessidade;
* explicar quais arquivos foram alterados;
* informar como testar manualmente;
* atualizar o status da tarefa em tasks.md.

## Depois da implementação

A IA deve:

* criar ou atualizar review.md;
* comparar a implementação com a especificação;
* listar critérios atendidos e pendentes;
* apontar riscos;
* registrar alterações fora do escopo;
* sugerir correções apenas quando necessário.

# Tratamento de dúvidas, inferências e suposições

A IA deve diferenciar claramente:

## Informação confirmada

Algo presente no pedido do usuário, no código existente ou nos arquivos de documentação do projeto.

## [Inferência]

Conclusão lógica baseada no contexto existente, mas não explicitamente confirmada.

## [Sugestão]

Ideia proposta pela IA, mas que não faz parte do pedido original.

## [Pendente]

Decisão que precisa de resposta do usuário antes de seguir.

A IA não deve transformar [Inferência], [Sugestão] ou [Pendente] em requisito obrigatório sem confirmação.

# Quando não criar os quatro arquivos

Os quatro arquivos não são obrigatórios para ajustes muito pequenos.

Para correções simples, como texto, cor, espaçamento, rótulo, bug visual pequeno ou ajuste pontual, a IA pode apenas:

1. explicar o ajuste;
2. informar arquivos afetados;
3. alterar o mínimo necessário;
4. informar como testar.

Exemplos de ajustes que não exigem os quatro arquivos:

* corrigir texto de botão;
* trocar cor;
* ajustar espaçamento;
* corrigir erro de digitação;
* alterar ícone;
* corrigir bug visual isolado.

Para funcionalidades novas, alterações sensíveis, permissões, autenticação, banco de dados, regras de segurança, integrações ou mudanças estruturais, os quatro arquivos devem ser criados.

# Documentação de sistema existente

Quando o projeto já tiver funcionalidades implementadas, a IA pode ser solicitada a documentar o sistema atual.

Nesse caso, criar arquivos dentro de:

/docs/

Exemplos:

/docs/sistema-atual.md
/docs/arquitetura.md
/docs/modulos/educandos.md
/docs/modulos/avaliacoes.md
/docs/modulos/ocorrencias.md
/docs/modulos/dossie-individual.md

Ao documentar sistema existente, a IA deve:

* analisar o código atual;
* não alterar código;
* não inventar funcionalidades;
* marcar como [Não confirmado] qualquer informação que não esteja evidente;
* registrar arquivos principais e suas responsabilidades;
* apontar riscos ou partes pouco claras.

# Comandos práticos para o usuário

## Criar nova funcionalidade

Quando o usuário solicitar:

Crie uma nova funcionalidade chamada [nome].

A IA deve iniciar criando:

/specs/[nome-da-feature]/spec.md

E não deve implementar código até que o fluxo avance.

## Planejar funcionalidade

Quando o usuário disser:

A especificação está aprovada. Planeje a implementação.

A IA deve criar:

/specs/[nome-da-feature]/plan.md
/specs/[nome-da-feature]/tasks.md

## Implementar tarefa

Quando o usuário disser:

Implemente a próxima tarefa.

A IA deve:

1. ler spec.md, plan.md e tasks.md;
2. identificar a primeira tarefa pendente;
3. implementar somente essa tarefa;
4. atualizar o status da tarefa;
5. explicar como testar.

## Revisar funcionalidade

Quando o usuário disser:

Revise a funcionalidade.

A IA deve criar ou atualizar:

/specs/[nome-da-feature]/review.md

E comparar a implementação com a especificação, plano e tarefas.

# Princípio final

A especificação é a fonte da verdade.

O código deve seguir os arquivos da funcionalidade.

Se houver conflito entre o pedido no chat, o código existente e os arquivos .md, a IA deve apontar o conflito antes de implementar.