// Changelog voltado ao usuário, em pt-BR — mantenha as entradas curtas e sem
// jargão técnico. A PRIMEIRA entrada é a versão atual (usada no rótulo do rodapé
// e no anúncio automático de novidades no Discord após o deploy).
//
// O registro técnico detalhado fica em CHANGELOG.md, na raiz do projeto.

export type ChangelogEntry = {
  version: string;
  date: string; // AAAA-MM-DD
  changes: string[];
  /** Crédito de quem reportou/ajudou — destacado no fim da entrada. */
  credit?: string;
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.3.8",
    date: "2026-09-30",
    changes: [
      "Descrições de 10 itens do Conjunto de EXP atualizadas com o texto mais recente do jogo. A Bolsa do Baby Shark agora mostra os efeitos corretos de HP, SP e conversão de dano em SP.",
    ],
  },
  {
    version: "0.3.7",
    date: "2026-09-15",
    changes: [
      "Os espaços de Encantamento (Topo) e Encantamento (Baixo) só ficam liberados com um item que aceita o encantamento equipado: o Chapéu de Oficial-LT no Topo e um dos Balões Poring no Baixo. Tirar ou trocar o item remove o encantamento junto.",
    ],
  },
  {
    version: "0.3.6",
    date: "2026-09-15",
    changes: [
      "Passe o mouse sobre um item (no slot, na lista de escolha, na Lista de Equipamentos ou nas tabelas) para ver a descrição completa do jogo, com as cores do cliente.",
      "Novos itens no Conjunto de EXP, da colaboração com o Baby Shark: Bolsa do Baby Shark (capa, +10%), [Visual] Cabeça do Baby Shark (+5%) e as cartas Baby Shark e Família Tubarão (+15%). O visual e as cartas só dão EXP durante o evento.",
      "Novo espaço de Carta (Capa) na montagem do conjunto, para as cartas do Baby Shark.",
      "Encantamentos agora contam: o Encantamento (Baixo) dos Balões Poring (Mestre dos Mestres +5%, ou Mestre de uma raça +5%) e o Encantamento (Topo) do Chapéu de Oficial-LT (Medalha de Experiência +10%, ou Medalha de uma raça +15%; +4% e +7% no nv. 175+). O encantamento só soma se o item certo estiver equipado.",
      "As Medalhas do Chapéu de Oficial-LT têm um seletor de grau (D, C, B, A) no próprio slot: no Grau B a Medalha de Experiência chega a +16% e as de raça a +24%. O grau também vai no link compartilhado.",
      "Amigo Cinnamoroll saiu da lista de Capa: o item ainda não chegou ao RO LATAM.",
      "Novos acessórios: Ventilador Portátil-LT e Ventilador Quebrado-LT (+10% até o nv. 174, +5% no 175+; exigem nv. 100).",
      "As setas de girar o personagem estavam invertidas: agora ← gira para a esquerda e → para a direita.",
      "Carta Am Mut agora vai no calçado, como no jogo (estava no espaço de carta da armadura).",
      "Correções nos Escudos e Grevas Sombrios de nível: o Novato vale 5% no +10 e o Avançado 3%, e só na faixa de nível em que podem ser usados. As Grevas do Iniciante, do Novato e Avançada também dão EXP próprio, que não era contado.",
    ],
  },
  {
    version: "0.3.5",
    date: "2026-08-18",
    changes: [
      "O Espírito da Chung E com slot de carta entrou na lista de Topo do Conjunto de EXP — é o mesmo chapéu que já estava lá, na versão que aceita carta.",
      "Correção no Espírito da Chung E: aparecia como 1% de EXP, quando o certo é 5% no refino +10 (o bônus sobe +1% a cada 2 refinos).",
    ],
  },
  {
    version: "0.3.4",
    date: "2026-08-16",
    changes: [
      "O rodapé de todas as telas ganhou dois links novos: \"Reportar um problema\", para mandar erro ou sugestão sem depender do Discord, e \"Acompanhar os reportes\", para ver o que já foi enviado e em que pé está.",
    ],
  },
  {
    version: "0.3.3",
    date: "2026-08-11",
    changes: [
      "Nova classe na prévia do personagem da calculadora de Conjunto de EXP: Druida, a quarta classe dos Dorams.",
      "Nomes de classe corrigidos para os do jogo: Arquimágico (estava \"Magus\"), Poeta (\"Maestro\"), Assassino (\"Executor\"), Hiperaprendiz (\"Hyper Novice\"), Mestre Celestial (\"Sky Emperor\"), Asceta (\"Soul Ascetic\") e Guerrilheiro (\"Night Watch\").",
      "As quartas classes mais recentes voltam a mostrar o emblema da classe na lista, no lugar do bonequinho que aparecia como substituto.",
    ],
  },
  {
    version: "0.3.2",
    date: "2026-07-25",
    changes: [
      "Os itens dos eventos do Kumamon e das Pipocas saíram da calculadora de Conjunto de EXP: os eventos acabaram e os efeitos não valem mais. Com isso, os espaços de Visual (Meio) e Visual (Capa) deixam de aparecer, já que ficaram sem itens.",
    ],
  },
  {
    version: "0.3.1",
    date: "2026-07-23",
    changes: [
      "Novo item na calculadora de Conjunto de EXP: Snorkel (Aluguel), um chapéu de espaço médio que dá +5% de EXP contra monstros da raça Peixe.",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-07-09",
    changes: [
      "Nova calculadora: Conjunto de EXP! Monte o equipamento que dá mais +% de EXP ao derrotar monstros, veja o total por faixa de nível, os bônus de conjunto e uma prévia do personagem.",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-08",
    changes: [
      "Nova calculadora do Martelo de Refino Sombrio: descubra quantos martelos você precisa para alcançar o refino desejado.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-07",
    changes: [
      "Lançamento do RagCalc com as calculadoras de encantamento de insígnia do Chapéu Memorável e da Diadema Temporal.",
    ],
  },
];

export const APP_VERSION = CHANGELOG[0]!.version;
