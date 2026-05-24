# Checklist de Tarefas - Selah Modular SPA & Diário de Bênçãos

Checklist passo a passo para a execução da nova arquitetura SPA e do Diário de Bênçãos.

---

## Fase 1: Fundação SPA e Refatoração de UI
- [ ] 1. Criar o diretório `modules/` na raiz do projeto para armazenar os arquivos JavaScript dinâmicos.
- [ ] 2. Refatorar o arquivo `index.html`:
  - [ ] Remover toda a marcação interna da timeline, filtros, formulário de devocionais e modais, deixando apenas o container `<div id="spaContent"></div>`.
  - [ ] Atualizar a barra lateral (`sidebar-nav`) com os links utilizando hash (ex: `#registros`, `#oracoes`, `#igreja`, `#bencaos`).
  - [ ] Adicionar o novo item "Bênçãos" (`#bencaos`) na barra lateral.

---

## Fase 2: Modularização dos Módulos JS Existentes
- [ ] 3. Criar o módulo `modules/registros.js`:
  - [ ] Desenvolver a função `render()` contendo todo o HTML que antes residia em `index.html`.
  - [ ] Migrar toda a lógica de devocionais de `script.js` para este arquivo: `fetchAll`, `renderFeed`, `renderChart`, Quill Editor (Registros), `TagManager` (Keywords) e os modais de edição.
  - [ ] Exportar as funções necessárias para inicialização reativa após a injeção do HTML no DOM.
- [ ] 4. Criar os módulos placeholders `modules/oracoes.js` e `modules/igreja.js`:
  - [ ] Criar layouts dinâmicos e premium com mensagens atrativas de "Em breve" contendo ilustrações integradas e botões.

---

## Fase 3: Desenvolvimento do Diário de Bênçãos
- [ ] 5. Criar o módulo `modules/bencaos.js`:
  - [ ] Desenvolver a interface HTML reativa: formulário simplificado de bênçãos (Título, Data, Relato Quill, Tags), timeline cronológica de bênçãos, contadores de estatísticas de gratidão e filtros (pesquisa por texto e data).
  - [ ] Implementar a lógica de banco de dados integrada ao Firestore (coleção `blessings`).
  - [ ] Instanciar o `TagManager` focado nas tags de bênçãos e o editor Quill específico desta tela.
  - [ ] Adicionar lógica de edição rápida e exclusão segura com modais customizados.

---

## Fase 4: O Roteador Central
- [ ] 6. Refatorar o `script.js` para agir estritamente como o motor central:
  - [ ] Implementar a lógica de escuta à mudança de hash (`hashchange`).
  - [ ] Programar o gerenciamento de roteamento seguro (validar contra o array de `features` do Firestore).
  - [ ] Criar a função para alternar classes `active` na sidebar dinamicamente de acordo com a aba aberta.
  - [ ] Importar e carregar de forma sob demanda o módulo correspondente injetando no `#spaContent` e disparando suas respectivas funções de inicialização.

---

## Fase 5: Limpeza e Otimização PWA
- [ ] 7. Apagar os arquivos HTML estáticos obsoletos do projeto:
  - [ ] Excluir `oracoes.html` da pasta.
  - [ ] Excluir `igreja.html` da pasta.
- [ ] 8. Atualizar o Service Worker `sw.js` para remover o cache desses arquivos deletados e incluir os novos caminhos JS em `modules/*`.
- [ ] 9. Testar fluxos de login com contas de permissões limitadas, garantindo que as rotas SPA e a exibição/ocultação de abas funcionem de forma ultra-segura.
- [ ] 10. Atualizar o `walkthrough.md` documentando toda a migração arquitetônica e a nova funcionalidade.
