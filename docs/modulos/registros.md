# Especificação Técnica: Módulo de Registros — Selah

Este documento descreve detalhadamente o funcionamento funcional e técnico do módulo **Registros**, que é a funcionalidade central ativa do aplicativo **Selah** atualmente.

---

## 1. Objetivo do Módulo

O módulo de **Registros** permite aos usuários documentar sua jornada espiritual e leituras diárias. A aplicação oferece flexibilidade na escrita (estilo livre ou perguntas estruturadas), categorização por palavras-chave, encadeamento de estudos (trilhas de leitura), tarefas práticas associadas, buscas avançadas e relatórios estatísticos visuais.

---

## 2. Componentes da Interface (Dashboard)

A página principal (`index.html`) é dividida em três painéis colapsáveis (Acordeões) para otimizar o espaço em telas menores:

1.  **Novo Registro / Editando Registro:** Painel de entrada de dados contendo o formulário principal.
2.  **Meus Registros:** Painel de consulta e filtragem alimentado pela base de dados do usuário.
3.  **Estatísticas:** Painel de gráficos analíticos sobre o histórico de leituras.

---

## 3. Formulário de Cadastro e Edição

### A. Campos Principais
*   **Título do Registro:** Campo de texto simples. Obrigatoriedade validada pelo HTML (`required`).
*   **Data Inicial:** Campo de data (`type="date"`). É inicializado automaticamente com a data corrente ao abrir ou limpar o formulário.
*   **Passagem Principal:** Citação bíblica do texto base lido (Ex: "Mateus 6:33").
*   **Tipo de Registro:** Menu de seleção com opções tipificadas para fins de estatística:
    *   *Devocional, Culto Doméstico, Aula, EBD, Pregação, Anotações Gerais e Outros.*
*   **Autoria (Opcional):** Campo oculto sob tag `<details>`, usado para registrar o autor da ministração ou livro.
*   **Passagens Relacionadas (Opcional):** Campo oculto sob tag `<details>`, usado para citações de apoio.

---

### B. Sistema de Autocomplete ("Continuação de...")
Permite conectar o devocional atual a um registro anterior, criando uma conexão encadeada.
*   **Funcionamento:** À medida que o usuário digita no input `#continuationSearch`, o sistema varre a lista local `allRecords` procurando termos coincidentes no Título ou na Passagem Principal.
*   **Dropdown dinâmico:** Exibe até 10 correspondências em tempo real com Título e Data.
*   **Seleção:** Clicar em um item preenche o input visual com o título e armazena o ID interno do registro pai no campo oculto `#continuationOf`.

---

### C. Gerenciador de Palavras-chave (`TagManager`)
Controla a inserção de tags para categorização. Está encapsulado na classe Javascript `TagManager` com as seguintes características:
*   **Limite Estrito:** Permite no máximo **3 palavras-chave** por registro. Se o usuário tentar inserir mais, exibe um alerta personalizado em tela.
*   **Indexação Inteligente:** As tags são normalizadas internamente em letras minúsculas (para evitar duplicatas como "Graça" e "graça"), mas mantêm a grafia original da primeira vez que foram cadastradas usando um mapa de indexação global (`globalKeywordIndex`).
*   **Interatividade Teclado/Foco:** O usuário adiciona tags digitando e pressionando `Enter` ou `,` (vírgula). Teclas de seta (`ArrowUp` / `ArrowDown`) navegam por sugestões baseadas nas tags já existentes no histórico do usuário. A tecla `Backspace` no campo vazio remove a última tag chip inserida.
*   **Design Premium:** As tags ativas aparecem como "Chips" elegantes na cor terrosa com um pequeno botão visual `X` para remoção.

---

### D. Formato do Registro (Livre vs. Orientado)
Um seletor do tipo toggle altera dinamicamente a estrutura de anotação de texto utilizando o editor de texto rico **Quill.js**:

*   **Formato Livre:**
    *   Exibe um único editor Quill (`#quillEditorLivre`).
    *   O usuário escreve de forma flexível utilizando formatação básica de fontes e cores.
*   **Formato Orientado (Perguntas Orientadoras):**
    *   Exibe um conjunto de blocos de perguntas dinâmicas. Por padrão, inicializa com 5 perguntas base:
        1.  *Qual é o contexto da passagem?*
        2.  *Sobre o que a passagem fala?*
        3.  *O que a passagem revela sobre Deus?*
        4.  *O que a passagem revela sobre o ser humano?*
        5.  *Como posso aplicar essa passagem na minha vida?*
    *   Cada pergunta orientadora é um elemento colapsável independente.
    *   **Edição de Perguntas:** O usuário pode clicar no título de qualquer pergunta para editá-la.
        *   *Adaptação Mobile:* Para evitar distorções de teclado virtual e cortes visuais em telas pequenas, clicar no título da pergunta em dispositivos de largura $\le 768px$ abre um modal de edição centralizado (`#editQuestionModal`) contendo uma área de digitação confortável.
    *   **Customização:** É possível adicionar novas perguntas dinamicamente através do botão "+ Adicionar Pergunta" ou remover as existentes clicando no ícone de lixeira, o que reconstrói os editores Quill locais sem perder os dados já inseridos.

---

### E. Modal "Ações e Links"
Acessado via botão `#btnOpenActionsModal`, abre uma caixa de diálogo em painel duplo:
*   **Ações:** Permite programar resoluções práticas do devocional classificando-as por tipo (Oração, Prática, Meta, Gratidão, Jejum, Lembrete) com descrição e data alvo de cumprimento.
*   **Links Relacionados:** Permite anexar referências ou vídeos da web associando Título e URL.
*   Os itens adicionados entram em listas temporárias locais e são salvos na nuvem junto com o registro principal.

---

## 4. Consulta de Registros ("Meus Registros")

### A. Filtros Avançados
Os registros carregados da nuvem podem ser refinados através de um painel de filtros rápidos:
*   **Busca Textual:** Filtra termo-chave ou passagem bíblica (pesquisa case-insensitive no título, passagem principal e tags).
*   **Tipo de Registro:** Dropdown que filtra por categorias (Devocional, Pregação, etc.).
*   **Filtro por Autor:** Filtra estudos digitando o nome do autor associado.
*   **Período Temporal:** Inputs de data inicial e data final para filtrar um intervalo de tempo.
*   **Botão de Sorteio ("Sortear Aleatório"):** Ao clicar no ícone de shuffle (`#btnRandom`), o sistema sorteia um registro aleatório do feed atual e abre o modal de visualização detalhada. Excelente ferramenta para rever anotações antigas.

---

### B. Visualização Detalhada (Modal de Leitura)
Ao clicar no card de qualquer registro, abre-se o modal `#viewModal` contendo os dados formatados em HTML limpo de leitura:
*   **Visualização das Trilhas (Chain Logic):** Se o devocional possuir conexões ("continuação de"), o sistema executa um algoritmo recursivo bidirecional em Javascript:
    1.  Caminha para trás no histórico buscando registros ancestrais através do campo `continuationOf`.
    2.  Caminha para a frente buscando registros descendentes que referenciem o ID do registro atual ou de seus filhos.
    3.  Monta uma linha do tempo horizontal estilizada ("Trilha: Registro 1 $\rightarrow$ Registro 2 $\rightarrow$ Registro Ativo"). Os registros da trilha aparecem como tags clicáveis, permitindo ao usuário navegar rapidamente por toda a sequência de estudos encadeados sem fechar o modal.
*   **Ações Rápidas no Cabeçalho:** O modal exibe diretamente botões discretos no topo para:
    *   **Editar:** Carrega todos os dados de volta para o formulário principal, fecha o modal, abre a aba de edição e rola a tela até o topo com efeito visual suave.
    *   **Excluir:** Dispara um modal de confirmação personalizado (`#customConfirmModal`). Caso aceito, remove o registro da nuvem silenciosamente e recarrega o feed.

---

## 5. Estatísticas Visuais

Utilizando a biblioteca **Chart.js**, o Selah fornece análises gráficas do histórico espiritual do usuário:

*   **Gráfico por Tipo de Registro (Doughnut):** Mostra a divisão proporcional dos registros salvos (Ex: 60% Devocionais, 20% Cultos Domésticos, etc.).
*   **Gráfico de Livros Mais Frequentes (Barras Horizontais/Verticais):**
    *   **Lógica de Extração:** O sistema utiliza a expressão regular `/^(\d?\s*[A-Za-zÀ-ÿ]+(?:[\s-][A-Za-zÀ-ÿ]+)*)/` para capturar a primeira palavra (e número opcional, como "1 Coríntios" ou "João") inserida no campo "Passagem Principal".
    *   **Resultado:** Exibe no formato de barras os 10 livros da Bíblia mais lidos pelo usuário, com ordenação automática de quantidade.
