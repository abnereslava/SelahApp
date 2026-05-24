# Glossário SDD (Specification-Driven Development)

Guia rápido e conciso para consulta imediata sobre a estrutura de documentação do **Blizpay**.

---

## 📁 As Pastas do Projeto

### `/docs/`
* **Para que serve:** Centralizar a **verdade atual** do sistema.
* **O que guarda:** Manuais de infraestrutura (Firebase, regras de segurança, índices), diagramas de arquitetura global, esquemas de modelagem de dados e regras conceituais ativas da plataforma.

### `/specs/`
* **Para que serve:** Guardar o histórico de **evolução** do sistema por ciclo ou recurso.
* **O que guarda:** Subpastas dedicadas para cada funcionalidade criada ou refatorada (ex: `/specs/admin-hub/`), registrando todo o ciclo de vida da feature de ponta a ponta.

---

## 📄 O Ciclo de 4 Arquivos de uma Spec
Dentro de cada pasta em `/specs/`, a vida de uma funcionalidade é documentada em 4 fases sequenciais:

`spec.md` ➔ `plan.md` ➔ `tasks.md` ➔ `review.md`

### 1. `spec.md` (A Especificação)
* **Foco:** **O QUE** e **POR QUE** (Visão de Negócio/Produto).
* **Uso rápido:** Descreve a funcionalidade em linguagem natural: regras de negócio, usuários envolvidos, fluxos de tela e critérios de aceitação. 
* *Regra:* **Zero código** ou decisões de infraestrutura.

### 2. `plan.md` (O Plano Técnico)
* **Foco:** **COMO** (Visão de Engenharia/Arquitetura).
* **Uso rápido:** Traduz a especificação em passos técnicos: lista de arquivos que serão afetados, novas chaves de banco, impactos de segurança e estratégia de validação.

### 3. `tasks.md` (As Tarefas)
* **Foco:** **QUANDO** (O Kanban Técnico Ativo).
* **Uso rápido:** Lista de micro-tarefas sequenciais e independentes. Cada tarefa possui seu status (`Pendente` / `Concluído`), critérios de conclusão de código e passo a passo de teste manual.

### 4. `review.md` (A Revisão)
* **Foco:** **VALIDADO** (A Auditoria de Fechamento).
* **Uso rápido:** Relatório pós-implementação: valida o código entregue contra os critérios da especificação original, registra os testes efetuados, pontua recomendações de monitoramento e define o status geral (ex: Aprovado).
