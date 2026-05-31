# Plano Técnico: Redesign das Áreas de Registro e Visualização (Registros e Bênçãos)

## 1. Resumo da solução

O redesign será aplicado diretamente nos módulos `registros.js` e `bencaos.js`, substituindo o HTML renderizado pelos módulos e adicionando estilos específicos em `style.css`. A estrutura de dados (Firestore) e a lógica de negócio (salvar, editar, excluir, filtrar) não serão alteradas — apenas a camada de apresentação.

**Formulário (inline aprimorado):** O `<details>` accordion atual será mantido como container, mas reformulado visualmente: campos com estilo underline (só borda inferior), labels flutuantes animadas, agrupamento por seções com ícones maiores, e botão de salvar mais proeminente.

**Lista (compacta expansível):** Cada item renderiza como um card compacto (título + data formatada + chip de tipo). Ao tocar/clicar, o card expande inline com animação de accordion mostrando o conteúdo completo (Quill HTML) e as ações (editar, excluir). Um botão "Ler" abre o modo leitura dedicado.

**Modo leitura:** Overlay de tela cheia com fundo escuro, tipografia grande (Playfair Display 1.2rem+), padding generoso, título em destaque dourado, e botão de fechar no canto superior.

## 2. Dependências

- `modules/registros.js` — HTML e lógica de renderização
- `modules/bencaos.js` — HTML e lógica de renderização
- `style.css` — estilos dos novos componentes
- Firestore (sem alteração)
- Quill (sem alteração, apenas reposicionado no layout)
- Phosphor Icons (sem alteração)

## 3. Arquivos afetados

| Arquivo | Motivo |
|---|---|
| `modules/registros.js` | Redesenho completo do HTML renderizado (formulário + lista) |
| `modules/bencaos.js` | Redesenho completo do HTML renderizado (formulário + lista) |
| `style.css` | Novos estilos: `.field-underline`, `.record-card`, `.record-card.expanded`, `.reading-overlay`, `.skeleton-card`, `.empty-state` |

## 4. Estrutura de dados

Sem alteração na estrutura do Firestore. Os mesmos campos são lidos e escritos.

Campos de Registros: `title`, `date`, `continuationOf`, `mainPassage`, `recordType`, `authors`, `relatedPassages`, `keywords`, `content` (Quill delta), `userId`, `createdAt`.

Campos de Bênçãos: `title`, `date`, `keywords`, `content` (Quill delta), `userId`, `createdAt`.

## 5. Regras de segurança e permissões

- Sem alteração nas regras de segurança.
- As queries Firestore filtradas por `userId` permanecem idênticas.

## 6. Fluxos técnicos

### Formulário redesenhado

```
Usuário abre a aba
→ container .collapsible-section renderiza com novos estilos underline
→ label flutua acima do campo ao receber foco (CSS :focus-within)
→ campos opcionais (Autoria, Passagens Relacionadas, Palavras-chave) agrupados em seção colapsável única "Detalhes adicionais"
→ botão "Salvar" com ícone e texto, estilo primário dourado, largura total no mobile
```

### Lista compacta com expansão

```
Firestore retorna lista de registros
→ para cada item: renderizar .record-card com título, data formatada, chip de tipo
→ toque no card: toggle classe .expanded
  → card expande com animação max-height: 0 → max-height: 2000px (CSS transition)
  → conteúdo Quill exibido dentro do card expandido
  → botões: Editar | Excluir | Ler
→ botão "Ler": abre .reading-overlay com título, data e conteúdo completo
```

### Skeleton loader

```
Enquanto getDocs() está pendente
→ renderizar 3x .skeleton-card com barras pulsando
→ ao resolver: substituir skeletons pelos .record-card reais
```

### Estado vazio

```
Se lista retorna vazia:
→ renderizar .empty-state com ícone ph-book-open e mensagem encorajadora
```

### Modo leitura

```
Clicar em "Ler":
→ criar .reading-overlay dinamicamente no body
→ injetar título, data, conteúdo Quill formatado
→ botão fechar: remover overlay com fade-out
→ ESC: fechar overlay
```

## 7. Impactos no sistema existente

- A lógica de edição (pré-preenchimento do formulário ao clicar em "Editar") deve ser mantida — a mudança é apenas visual no formulário, a função `populateForm()` existente continuará funcionando.
- O editor Quill será inicializado no mesmo ponto do código, apenas com novo container HTML.
- A lógica de filtro (busca por keyword, datas) deve ser preservada — apenas o HTML dos filtros será redesenhado.
- As estatísticas de bênçãos (total, este mês, tag principal) devem ser mantidas, redesenhadas visualmente como cards menores no topo.

## 8. Riscos técnicos

- **Editor Quill em accordion:** ao expandir o formulário, o Quill pode precisar de `quill.update()` ou re-inicialização se o container estava oculto. Verificar.
- **max-height para expansão de card:** se o conteúdo do card for muito longo, `max-height: 2000px` pode criar delay perceptível. Alternativa: `grid-template-rows: 0fr → 1fr`.
- **Overlay e teclado virtual no iOS:** o `.reading-overlay` com `position: fixed` pode ser deslocado pelo teclado virtual. Garantir que não há inputs no overlay.
- **Re-renderização da lista:** a lista atual re-renderiza completamente ao salvar/editar. O estado de qual card estava expandido se perde. Isso é aceitável por ora, mas registrar como pendência futura.

## 9. Estratégia de teste

- Criar novo registro → verificar campos, salvar, verificar aparece na lista.
- Editar registro → verificar pré-preenchimento, salvar, verificar atualização na lista.
- Excluir registro → verificar confirmação e remoção.
- Expandir card → verificar conteúdo correto e animação.
- Abrir modo leitura → verificar tipografia e conteúdo.
- Fechar modo leitura com botão e com ESC.
- Estado vazio → remover todos os registros, verificar mensagem.
- Skeleton → simular conexão lenta, verificar aparência.
- Filtro → aplicar filtro por keyword, verificar resultados.
- Testar em mobile (375px) e desktop (1024px+).

## 10. Ordem recomendada de implementação

1. Criar estilos CSS novos em `style.css` (cards, formulário underline, overlay, skeleton, empty state).
2. Redesenhar o HTML do formulário em `registros.js` (mantendo todos os `id` dos campos).
3. Redesenhar o HTML da lista em `registros.js` (substituindo a renderização de cards).
4. Implementar modo leitura em `registros.js`.
5. Adicionar skeleton loader em `registros.js`.
6. Adicionar estado vazio em `registros.js`.
7. Replicar as mesmas mudanças em `bencaos.js` (adaptando para os campos específicos).
