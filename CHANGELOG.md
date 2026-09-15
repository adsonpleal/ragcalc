# Changelog

Todas as mudanças relevantes do projeto estão registradas aqui. O formato é
baseado, de forma flexível, no [Keep a Changelog](https://keepachangelog.com/);
o versionamento é informal enquanto o projeto está pré-1.0. O texto voltado ao
usuário (e a fonte do anúncio automático no Discord após o deploy) fica em
`src/changelog.ts`.

## [0.3.7] — 2026-09-15

### Alterado

- **Slots de encantamento só abrem com um item-base que aceita o encantamento.**
  Sem ele o slot fica esmaecido, não abre o seletor e diz o que falta ("Requer
  Chapéu de Oficial-LT", "Requer um Balão Poring"); as linhas do encantamento
  nas tabelas também ficam desabilitadas. Tirar ou trocar o item-base por um que
  não aceita remove o encantamento e o grau dele, e um link compartilhado com
  encantamento órfão é limpo ao abrir. Com isso some a exibição de encantamento
  "inativo" (+0% com aviso) da 0.3.6, que deixou de ser alcançável;
  `computeBreakdown` continua zerando um encantamento sem base.

## [0.3.6] — 2026-09-15

### Adicionado

- **Descrição do item ao passar o mouse**, no molde do popover do
  latam-ro-calc: cartão branco (as cores `^RRGGBB` do cliente são pensadas para
  fundo claro), largura de leitura (`min(90vw, 34rem)`), rolagem própria acima
  de 85vh e continua aberto com o ponteiro em cima, para rolar e copiar.
  Aparece ao lado do alvo (direita, senão esquerda, senão abaixo) e sempre dentro
  da janela; 350 ms para abrir, 150 ms de folga para atravessar até ele, Esc
  fecha. Desligado em telas sem hover. Gatilho é qualquer `[data-desc-id]`
  (slot preenchido, linha do seletor, Lista de Equipamentos, tabelas), por
  delegação no root, porque a tela re-renderiza com `innerHTML`.
  - `src/components/item-tooltip.ts` (popover), `src/lib/item-desc.ts`
    (`formatItemDescription`: cores, `<NAVI>` sem coordenadas, escape de HTML).
  - `src/lib/exp-descriptions.json`, gerado por
    **`tools/sync-item-descriptions.mjs`** a partir de `/raw/items.json` do
    ragassets, só com os ids de `exp-items.json`. Carregado por `import()`:
    vira um chunk próprio (94 kB, 12 kB gzip) que só baixa no primeiro hover.
  - 171 de 177 itens têm texto; os 6 sem descrição no cliente mostram um aviso.
  - A skill `sync-with-ragassets` passa a cobrir esse arquivo.
- **Itens da colaboração Baby Shark** no Conjunto de EXP, que chegaram na
  atualização do cliente de 2026-09-14: Bolsa do Baby Shark (480824, capa, 10%),
  [Visual] Cabeça do Baby Shark (401367, 5%), Carta Baby Shark (300834) e Carta
  Família Tubarão (300835), 15% cada. Os três últimos trazem o bônus sob
  `[Durante o Evento]` no cliente, então saem quando o evento acabar, como os do
  Kumamon e das Pipocas.
- **Pool `cartaCapa`** (slot "Carta (Capa)"), sob a Capa na grade principal.
  Permalinks são por id, então links antigos não mudam.
- **Ventilador Portátil-LT** (490374) e **Ventilador Quebrado-LT** (490375):
  10% até o nv. 174, 5% no 175+, nível necessário 100 (então 0 na faixa ≤99).
  Os ids já existiam, mas até esta atualização a descrição do cliente era só o
  texto de ambientação, sem efeitos.

- **Encantamentos que dependem do item-base.** Campo opcional `requires` em
  `ExpItem` (ids aceitos como base); `computeBreakdown` zera o item e marca
  `inactive` quando nenhum deles está equipado, e a tela mostra +0% com o
  motivo. Dois pools novos, como sub-slots na grade principal:
  - `encantoBaixo` — 3º slot dos 10 Balões Poring (19143, 19146–19154; não os
    Balões da Família Poring): Mestre dos Mestres (311004, +5%) e Mestre
    <raça> (310994–311003, +5% contra a raça).
  - `encantoTopo` — 4º slot do **Chapéu de Oficial-LT** (400445, adicionado ao
    Topo com 0% próprio): Medalha de Experiência (312406, 10% até o nv. 174 / 4%
    no 175+) e Medalha de <raça> (312407–312416, 15% / 7%). Nv. necessário 100,
    então 0 na faixa ≤99.

  Tabelas de encanto e chances vêm das predefinições `Balões_Poring` e
  `Chapeu_Oficial` do bROWiki; os valores, das descrições do cliente.
- **Seletor de grau** no slot de encanto cujo item tem `gradeBonus` (hoje, as
  Medalhas do Chapéu de Oficial-LT). `exp` guarda o valor sem grau e
  `gradeBonus` os adicionais de "Grau X ou mais", que se somam: Medalha de
  Experiência +1/+2/+3 (16% no Grau B até o nv. 174), Medalhas de raça +1/+3/+5
  (24%). Grau A recebe o mesmo que B, porque o cliente não tem faixa própria
  para ele. O grau não soma numa faixa em que o item vale 0 (≤99, o chapéu
  exige nv. 100). `itemExp()` em `exp-math.ts` faz a conta; `computeBreakdown`
  e `totalExp` recebem os graus por id de item. O grau vai no permalink como
  `gd=encantoTopo.B`, por slot, então trocar de Medalha mantém o grau do chapéu.

### Removido

- **Amigo Cinnamoroll** (480245, capa, 10%). O item ainda não existe no LATAM: o
  cliente não tem nome nem descrição para ele (`name: null` em `/raw/items.json`)
  e o mercado nunca o viu. Não fazia parte de nenhum conjunto. Volta quando o
  cliente trouxer o item.

### Corrigido

- **Setas de girar o personagem invertidas.** `bodyDir` sobe no sentido oposto
  ao que as setas mostravam; os passos de ← e → foram trocados (`data-rot`).

Achados conferindo os 149 itens contra `/raw/items.json` do ragassets:

- **Carta Am Mut** (4245) estava em `cartaArmadura`; o cliente diz "Equipa em:
  Calçado".
- **Escudo/Greva Sombria do Novato** (24213/24212): +1% a cada **2** refinos,
  não por refino — 5% no +10, não 10%.
- **Escudo/Greva Sombria Avançada** (24215/24214): +1% a cada **3** refinos (3%
  no +10) e nível 100–149, então a faixa ≤99 passa a 0, e o conjunto também
  deixa de valer nela.
- **Grevas do Iniciante, do Novato e Avançada** estavam com 0% ("sem EXP
  próprio"); cada uma tem o mesmo bônus por refino do escudo do par.
- `view` preenchido onde o cliente tem sprite e o arquivo tinha `null`:
  Protetor das Marés e Protetor de Preamar (870), Lápis Vermelho (931), Asas de
  Anjo (38), Coroa do Líder (93). Os parceiros de conjunto passam a aparecer na
  prévia do personagem.
- Ressalvas do Elmo do Dragão e do Protetor de Preamar reescritas com o texto do
  cliente (a posição "a confirmar" é Topo).

## [0.3.5] — 2026-08-18

### Adicionado

- **Espírito da Chung E com slot** (id 19136) na lista de Topo do Conjunto de
  EXP. É o mesmo chapéu do 19135 já listado, na versão com slot de carta vendida
  pelo NPC do item mall (`Spirit_Of_Chung_E_`, `slots: 1`), com o mesmo bônus de
  EXP. Segue a convenção dos outros pares de mesmo nome (13001/13030,
  19117/19118): nome idêntico, diferença explicada em `caveats`.

### Corrigido

- **Espírito da Chung E** (id 19135) valia 1% em todas as faixas, sem ressalva.
  O bônus é de +1% **a cada 2 refinos**, então o valor certo pela convenção do
  arquivo — que registra o item no refino máximo praticável — é 5% no +10, como
  já era feito nas dez Mochilas de Amistr, que têm exatamente a mesma mecânica.
  O item estava assim desde o commit que criou a calculadora.

### Sincronizado

- `src/lib/classes.json` regerado do ragassets após a atualização do cliente de
  2026-08-18: **sem mudanças** (85 classes). A atualização trouxe só 19 sprites
  novos, todos de monstro (`geffen_mage_1..12`, `fei_kanabian`, `golem`,
  `fenrir`, `md_airboat_boss`, `giant_honet`), nenhum equipamento.

### Corrigido (interno)

- `tools/sync-classes.mjs` perdeu o shebang `#!/usr/bin/env node`. O Node ignora
  shebang, mas o transform do vite-node não, então
  `tools/sync-classes.test.mjs` quebrava na coleta com
  `SyntaxError: Invalid or unexpected token` e **nunca chegou a rodar** desde que
  foi escrito. Com isso, os 9 testes do arquivo passaram a rodar de fato — entre
  eles o que garante que `src/lib/classes.json` é exatamente a saída do script.
  O script sempre foi chamado como `node tools/sync-classes.mjs`, então nada
  dependia do shebang.

## [0.3.4] — 2026-08-16

### Adicionado

- Links de **"Reportar um problema"** e **"Acompanhar os reportes"** no rodapé,
  apontando para o rastreador unificado das ferramentas do RO LATAM
  (`https://issues.latam-tools.com.br`, filtrado por `?projeto=calc`). Até agora
  o projeto não tinha nenhum caminho de report: só o Discord, que continua no
  rodapé — isto é adição, não substituição.
- **`src/lib/site-footer.ts`**, exportando `footerHtml(version)`.

### Alterado

- `src/home.ts`, `src/components/calculator-view.ts`,
  `src/components/exp-view.ts` e `src/components/martelo-view.ts` passam a
  chamar `footerHtml(APP_VERSION)`. A marcação do rodapé estava copiada
  literalmente nos quatro arquivos, então mexer em um só deixava três telas
  para trás — foi exatamente esse risco que motivou a extração.

## [0.3.3] — 2026-08-11

### Adicionado

- **`tools/sync-classes.mjs`** — gera `src/lib/classes.json` a partir de
  `https://assets.latam-tools.com.br/raw/classes.json` (projeto irmão ragassets,
  que extrai a tabela do GRF do cliente LATAM). Aceita `--input` para ler um
  arquivo local, além de `--url` e `--out`. Substitui a cópia manual vinda do
  `public/db/classes.json` do latamvisuais, que era como o arquivo ficava
  desatualizado sem ninguém perceber. Documentado em
  `.claude/skills/sync-with-ragassets/SKILL.md`.
- **Druida** (id 4308), a quarta classe dos Dorams, que faltava na lista.
- Testes: `tools/sync-classes.test.mjs` (transformação, sobre uma fatia real da
  tabela de origem em `tools/fixtures/classes-raw.json`, sem rede) e
  `src/lib/classes.test.ts` (saída de `CLASSES` fixada por classe).

### Alterado

- `src/lib/classes.json` passa a conter só o que o app consome
  (`{id, jt, name, group, genders}`): 22.8 kB → 8.1 kB. As paletas de cor de
  roupa eram herança da cópia do latamvisuais e nunca foram lidas aqui — o que
  o app usa delas (existe sprite masculino/feminino?) virou `genders`, calculado
  na geração em vez de a cada carga da página.
- `group` é classificação nossa (não existe na origem) e agora mora em `GROUPS`,
  em `tools/sync-classes.mjs`, que também fixa a ordem da lista. Uma classe nova
  na origem sem grupo faz o script falhar em vez de escrever a tabela.
- Nomes corrigidos para os rótulos do próprio cliente LATAM: Arquimágico
  (era `Magus`), Poeta (`Maestro`), Assassino (`Executor`), Hiperaprendiz
  (`Hyper Novice`), Mestre Celestial (`Sky Emperor`), Asceta (`Soul Ascetic`) e
  Guerrilheiro (`Night Watch`).

### Removido

- `JOB_ICON_FALLBACK` em `src/lib/classes.ts`. Ele existia porque a cópia manual
  não trazia o `renderId` e o ragassets não servia `/icons/job/<id>.png` para as
  quartas classes expandidas; hoje serve para 4302–4308, e o id do arquivo já é
  o `renderId`. As classes que caíam no fallback voltam ao emblema de classe em
  vez do render de sprite.

## [0.3.2] — 2026-07-25

### Removido

- **Itens dos eventos do Kumamon e das Pipocas** na Calculadora de Conjunto de
  EXP — os eventos acabaram e os efeitos foram deletados: `[Visual] Pipocas
  Saltitantes` (31518), `[Visual] Peruca de Pipoca` (31736), `[Visual] Capuz de
  Kumamon` (400799), `[Visual] Pipoquinho` (410069) e `[Visual] Mochila de
  Kumamon` (480559), além do bônus de conjunto Capuz + Mochila de Kumamon (+5%).

### Alterado

- Os espaços cujo conjunto de itens ficou vazio deixam de ser exibidos na grade
  e nas tabelas por espaço (`SLOTS` agora filtra os pools sem itens em
  `src/lib/exp-data.ts`). Na prática, somem Visual (Meio) e Visual (Capa).
  Links compartilhados antigos continuam funcionando: ids desconhecidos já eram
  ignorados na leitura do permalink.

## [0.3.1] — 2026-07-23

### Adicionado

- **[Aluguel] Snorkel** (item 19275) na Calculadora de Conjunto de EXP —
  chapéu de espaço médio que dá EXP +5% contra a raça Peixe. Detectado na
  atualização do cliente (GRF) extraindo os itens com bônus de EXP do
  `iteminfo_new.lub`.

## [0.3.0] — 2026-07-09

### Adicionado

- **Calculadora de Conjunto de EXP** (`calc/exp`). Monta um conjunto de
  equipamentos que maximiza o "+% de EXP ao derrotar monstros": grade de espaços
  de equipamento, tabelas de itens por espaço, regras de bônus de conjunto,
  totais por faixa de nível, link compartilhável e uma prévia do personagem via
  ragassets com seletores de classe, gênero, ação e rotação.
- **Anúncio de novidades no Discord após o deploy.** O `tools/post-novidades.mjs`
  publica a entrada mais recente de `src/changelog.ts` como um embed no canal
  #novidades após um deploy bem-sucedido. Integrado ao
  `.github/workflows/deploy.yml`, disparado apenas quando a versão no topo do
  changelog muda. Requer o segredo de repositório `DISCORD_BOT_TOKEN`.

## [0.2.0] — 2026-05-08

### Adicionado

- **Calculadora do Martelo de Refino Sombrio** (`calc/martelo`).

## [0.1.0] — 2026-05-07

### Adicionado

- Lançamento inicial com as calculadoras de encantamento de insígnia do Chapéu
  Memorável e da Diadema Temporal.
