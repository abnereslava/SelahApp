# Tarefas: Login com Google & Migração Temporária

Este documento divide o plano de implementação do Google Login por popup e a ferramenta de migração temporária no Hub Administrativo em tarefas pequenas, sequenciais e testáveis.

---

## Visão geral

O desenvolvimento se concentrará em atualizar a documentação e especificações com os pontos de atenção relativos ao bloqueio de popups mobile, seguido pela criação da interface HTML da ferramenta de migração no `admin.html` e a lógica de atualização em lote no `admin.js`.

---

## Tarefa 1 — Atualização de Documentos e Registro de Alertas

Status: Concluída

### Objetivo
Registrar os alertas de usabilidade do login por pop-up em navegadores móveis específicos e PWA standalone em toda a documentação, alinhando as especificações oficiais.

### Arquivos afetados
*   `docs/sistema-atual.md` (Aviso adicionado)
*   `specs/login-google/spec.md` (Especificação atualizada)
*   `specs/login-google/plan.md` (Plano técnico atualizado)

### Dependências
Nenhuma.

### Critério de conclusão
*   Presença de bloco formal de atenção (`[!WARNING]`) e detalhamento da limitação em `docs/sistema-atual.md` e `specs/login-google/spec.md`.
*   Plano técnico e especificações alinhadas à decisão oficial de manter popups (`signInWithPopup`).

### Teste manual
1. Ler os documentos modificados e atestar que a documentação técnica reflete com fidelidade a decisão oficial do pop-up e registra os devidos pontos de atenção mobile.

---

## Tarefa 2 — Interface Visual do Painel de Migração (`admin.html`)

Status: Pendente

### Objetivo
Inserir a estrutura visual responsiva e premium (tons terrosos e dourados) da ferramenta de migração manual de dados no rodapé do Hub Administrativo (`admin.html`).

### Arquivos afetados
*   `admin.html`

### Dependências
Tarefa 1 concluída.

### Critério de conclusão
*   Bloco HTML modular e independente criado no rodapé da página.
*   Presença de comentários claros `<!-- INÍCIO DA ÁREA DE MIGRAÇÃO TEMPORÁRIA -->` delimitando toda a área para deleção simplificada no futuro.
*   Presença de: input de texto para o UID legado, botão "Detectar UIDs Legados", botão "Iniciar Migração" e contêiner `#migrationLogs` para logs de console interativos na tela.
*   Estilos integrados ao design system terroso e de vidro.

### Teste manual
1. Acessar a página `/admin.html` deslogado ou logado e verificar se a nova seção de migração manual aparece perfeitamente renderizada no rodapé com cantos arredondados, botões dourados e tipografia Playfair Display.

---

## Tarefa 3 — Lógica de Detecção e Atualização em Lote (`admin.js`)

Status: Pendente

### Objetivo
Escrever a lógica em `admin.js` para escanear registros legados e realizar a atualização reativa de `userId` nas coleções de devocionais e bênçãos do Firestore, imprimindo logs reativos.

### Arquivos afetados
*   `admin.js`

### Dependências
Tarefa 2 concluída.

### Critério de conclusão
*   Código modular delimitado por comentários `// INÍCIO DA ÁREA DE MIGRAÇÃO TEMPORÁRIA`.
*   Botão "Detectar UIDs" realiza busca no Firestore na coleção `devotionals` por documentos cujos UIDs de criador não correspondam ao UID ativo de Abner ou a convidados whitelisted ativos. Exibe os UIDs detectados como botões/links clicáveis no painel de log para preenchimento imediato.
*   Botão "Iniciar Migração" realiza a busca de todos os devocionais e bênçãos pertencentes ao UID antigo informado no input, e atualiza-os individualmente e em sequência com o UID de Abner atual do Google Auth.
*   Exibição reativa de progresso de migração em tempo real na tela (Ex: *"Migrando devocional: 4/18..."*).
*   Logs limpos confirmando conclusão.

### Teste manual
1. No painel admin, rodar a detecção e certificar que ela traz UIDs antigos.
2. Fornecer um UID antigo fictício e atestar o log de migração em tempo real.
3. Verificar no console do Firestore se a conversão do campo `userId` ocorreu com sucesso.
