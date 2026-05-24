# Arquitetura Técnica — Selah

Este documento descreve a arquitetura de software, o stack tecnológico, a modelagem de dados e as convenções técnicas do aplicativo **Selah**.

---

## 1. Stack Tecnológico

O aplicativo Selah adota uma arquitetura baseada em front-end nativo (SPA parcial em HTML5) com serviços serverless no backend:

*   **HTML5 & CSS3:** Utilização de tags semânticas, layout baseado em Flexbox/Grid CSS, e variáveis CSS customizadas para garantir adaptabilidade visual (modo claro/escuro integrado em tons terrosos).
*   **Javascript ES6+:** Programação assíncrona baseada em módulos (import/export), manipulação reativa do DOM e persistência local/em nuvem.
*   **Firebase SDK v10.8.1 (Client-side):**
    *   **Firebase Authentication:** Login seguro de usuários por E-mail e Senha.
    *   **Firebase Cloud Firestore:** Banco de dados NoSQL baseado em documentos e coleções em tempo real.
*   **Quill.js v1.3.6:** Editor de texto enriquecido (Rich Text) integrado na interface para digitação livre e formatação de texto (Negrito, Itálico, Sublinhado, Cores, Cabeçalhos).
*   **Chart.js:** Renderização de gráficos dinâmicos e responsivos (Doughnut e Barras) no cliente.
*   **Phosphor Icons:** Biblioteca de ícones vetoriais dinâmicos para controle visual estético e intuitivo.

---

## 2. Modelagem do Banco de Dados (Firestore Schema)

Todos os registros são salvos em uma única coleção no Firestore chamada `devotionals`. Cada documento dentro desta coleção representa um registro individual de devocional/leitura com a seguinte modelagem:

```typescript
interface DevotionalRecord {
  id?: string;                        // ID autogerado pelo Firebase Firestore
  userId: string;                     // ID do usuário logado (Firebase Auth UID)
  title: string;                      // Título do registro (Ex: "O Bom Pastor")
  date: string;                       // Data do devocional (Formato: YYYY-MM-DD)
  continuationOf: string | null;      // ID do registro anterior (Trilha de Continuidade)
  mainPassage: string;                // Passagem bíblica principal (Ex: "João 3:16")
  recordType: string;                 // Tipo de registro (Ex: "devocional", "pregacao", "ebd", etc.)
  author: string | null;              // Autor ou pregador associado ao estudo (opcional)
  relatedPassages: string | null;     // Outras passagens conectadas ao estudo (opcional)
  keywords: string[];                 // Array com até 3 palavras-chave (indexadas em lowercase)
  recordFormat: 'livre' | 'orientado';// Formato das anotações
  content: {                          // Conteúdo dependente do formato escolhido
    texto?: string;                   // Se recordFormat == 'livre' (HTML gerado pelo Quill)
    questions?: {                     // Se recordFormat == 'orientado'
      q: string;                      // Pergunta orientadora (Ex: "O que a passagem revela sobre Deus?")
      a: string;                      // Resposta rica formatada (HTML do Quill)
    }[];
  };
  actions: {                          // Lista de tarefas práticas ou orações geradas pelo estudo
    type: 'pedidos_oracao' | 'acoes_pessoas' | 'metas_espirituais' | 'gratidao' | 'jejum' | 'outros';
    description: string;              // Descrição da ação prática
    date: string;                     // Data limite para conclusão (YYYY-MM-DD)
  }[];
  links: {                            // Referências externas adicionadas pelo usuário
    title: string;                    // Título descritivo do link
    url: string;                      // URL completa (https://...)
  }[];
  createdAt: string;                  // Timestamp ISO de criação (Ex: "2026-05-23T22:00:00Z")
  updatedAt: string;                  // Timestamp ISO da última alteração
}
```

---

## 3. Arquitetura do PWA (Offline & Instalação)

O aplicativo foi preparado para instalação nativa no celular ou desktop seguindo as regras de Progressive Web Apps:

### A. Manifesto (`manifest.json`)
*   Define a experiência de uso como `standalone` (sem barras do navegador, emulando um app nativo).
*   Trava a visualização padrão na vertical (`orientation: portrait`).
*   Define as cores de barra e fundo em `#2B1E17` (Rich Dark Chocolate) para manter consistência visual imediata.
*   Entrega os ícones necessários em resoluções `192x192` e `512x512` pixels.

### B. Service Worker (`sw.js`)
*   **Estratégia Utilizada:** *Network First, falling back to Cache* (Rede Primeiro, senão Cache).
*   **Fluxo de Funcionamento:**
    1. O Service Worker intercepta requisições locais (arquivos estáticos `index.html`, `style.css` e `script.js`).
    2. Tenta fazer o fetch diretamente da internet (GitHub Pages, Vercel ou servidor local).
    3. Em caso de conexão ativa, atualiza silenciosamente o cache local (`selah-pwa-v4`) com a última versão recebida.
    4. Se o usuário estiver offline (sem sinal de internet), o interceptador falha na rede e imediatamente entrega os arquivos estáticos cacheados localmente no navegador do celular, garantindo que o app abra.
*   **[Não confirmado / Limitação]** Como os dados residem inteiramente na nuvem do Firestore e as CDNs dependem de requisições externas, o app possui suporte a leitura offline apenas dos arquivos que estruturam a casca da tela; o login e a visualização ou gravação de novos devocionais requerem conexão ativa.

---

## 4. Arquitetura de Design System (Vanilla CSS)

O visual do Selah é estilizado a partir de variáveis CSS globais definidas em `:root` no arquivo `style.css`. O design prioriza tons sofisticados, cantos arredondados, elevação visual através de sombras suaves e transições elegantes.

### Paleta de Cores (Tokens CSS)
*   `--primary-color`: `#2B1E17` (Marrom terroso fechado - tom de grão de café / couro rústico).
*   `--primary-light`: `#3F2E23` (Versão mais clara para estados de foco).
*   `--secondary-color`: `#FBF9F6` (Fundo quente estilo papel creme / pergaminho moderno).
*   `--bg-color`: `#F4F0EA` (Fundo principal suave).
*   `--text-main`: `#1D1612` (Texto principal escuro de alta legibilidade).
*   `--text-muted`: `#7E6E65` (Texto secundário e legendas).
*   `--border-color`: `#E3DACF` (Bordas finas e sutis).

### Tipografia
*   **Playfair Display:** Utilizada para títulos marcantes, cabeçalhos de seções e citações, oferecendo uma atmosfera literária clássica.
*   **Inter:** Utilizada para o corpo do texto, formulários, controles e menus, otimizando a leitura rápida e legibilidade no mobile.

---

## 5. Convenções de Documentação (SDD)

O Selah adota as diretrizes do fluxo SDD baseados na documentação histórica do Blizpay. Qualquer evolução do sistema ou implementação de novos recursos deve obedecer rigorosamente a sequência de quatro arquivos em `/specs/`:
1.  **`spec.md`:** Levantamento funcional puro de produto.
2.  **`plan.md`:** Planejamento arquitetural e técnico.
3.  **`tasks.md`:** Quebra lógica de micro-tarefas granulares de codificação.
4.  **`review.md`:** Auditoria técnica pós-escrita antes da homologação final.
