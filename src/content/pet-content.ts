window.PenguinPet = window.PenguinPet || {};
window.PenguinPet.phrases = {
  idle: ["uai, sô", "de boa, viu", "oxente, cansei", "bah, na paz"],

  running: [
    "tô indo, uai",
    "bora, meu rei",
    "vamo nessa, tchê",
    "sem pressa, sô",
  ],

  jumping: ["ó o pulim", "ixe, fui", "bah, pulei", "um pulin só"],

  dancing: [
    "ô trem bão",
    "rebolando, visse",
    "bah, que barbaridade",
    "dançandim, uai",
  ],

  sleeping: ["capotado, sô", "mimir, viu", "bah, apaguei", "só o bagaço"],

  scared: ["nó, credo", "oxente!", "bah!", "vixe Maria!"],

  crying: ["ai, sô…", "ô dó, viu", "oxente, macho", "bah, triste"],

  beaten: [
    "para com isso, uai",
    "oxente, me respeite",
    "bah, pega leve",
    "cê tá doido, sô",
    "ôxe, assim não",
  ],

  angry: [
    "ô trem chato",
    "oxente, viu",
    "bah, me estressei",
    "tô invocado, sô",
  ],

  scratching: ["uai…", "oxe, pensando", "bah, sei não", "que trem é esse?"],

  waving: ["oi, sô", "opa, meu rei", "e aí, tchê", "ô de casa"],

  shy: [
    "que vergonha, sô",
    "oxe, pare",
    "bah, sem graça",
    "num olha assim não",
  ],

  peeking: [
    "tô só oiando",
    "só espiando, viu",
    "bah, de cantinho",
    "oxe, só vendo",
  ],

  laughing: [
    "hehe, sô",
    "oxente, ri foi muito",
    "bah, muito bom",
    "trem engraçado",
  ],

  thinking: [
    "matutando, uai",
    "pensando, viu",
    "bah, deixa eu ver",
    "oxe, peraí",
  ],

  eating: ["peixim bão", "oxente, delícia", "bah, bom demais", "nhac nhac, sô"],

  full: ["bucho cheio", "vixe, comi muito", "bah, lotado", "encheu, sô"],

  fullSleep: ["coma de peixe, uai", "oxe, deu sono", "bah, dormi"],

  fishing: [
    "vamo pescá, sô",
    "bora, meu rei",
    "bah, atrás de peixe",
    "oxe, lá vou eu",
  ],

  flying: [
    "quase voei, uai",
    "oxe, subi",
    "bah, asinha firme",
    "ô trem difícil",
  ],

  turningBack: [
    "quem vem lá, uai",
    "oxe, tô vendo",
    "bah, desconfiei",
    "tem trem aí",
  ],

  dropped: [
    "de novo, sô?",
    "oxente, me derrubou",
    "bah, assim não",
    "pega leve, vivente",
  ],

  love: [
    "gosto docê",
    "ôxe, te quero bem",
    "bah, tu é especial",
    "cê é um trem bão",
  ],

  rant: [
    "para de clicá, uai!",
    "oxe, assim não dá!",
    "bah, me errou!",
    "num amola, sô!",
  ],

  fishLow: [
    "tá acabando, sô",
    "oxe, pouco peixe",
    "bah, tá no fim",
    "só restim, uai",
  ],

  fishLast: ["último peixim!", "oxe, só um!", "bah, o derradeiro!"],

  fishEmpty: [
    "sem peixe, sô",
    "oxe, acabou foi tudo",
    "bah, zerou",
    "cadê meu peixim?",
  ],

  fishRage: [
    "quero peixe, uai",
    "oxe, me dá peixe",
    "bah, tô com fome",
    "peixeeee, sô!",
  ],

  fishHudFishingPrompt: ["bora pescá, uai", "oxe, eu vou", "bah, partiu peixe"],

  loveSymbol: ["♥", "♡", "<3"],

  snowmanFlirt: [
    "cê é um trem bão",
    "oxe, que charme",
    "bah, lindo demais",
    "friozinho gostoso, né",
  ],

  shootingStarWish: [
    "quero peixe, uai",
    "oxe, faz esse favor",
    "bah, me manda sorte",
    "um peixim já tava bom",
  ],

  cruzeiro: ["zêrooo!", "uai, é o cabuloso!", "bah, dale zêro!"],
};

window.PenguinPet.behaviors = [
  // Apenas fica parado por um bom tempo
  () => [{ type: "act", state: "idle", duration: 6000 }],
  // Parado, depois olha pra trás discretamente
  () => [
    { type: "act", state: "idle", duration: 4000 },
    { type: "act", state: "turningBack", duration: 1800 },
  ],
  // Caminha um pouco e para
  () => [{ type: "walkShort" }],
  // Caminha, pensa e fica parado
  () => [{ type: "walk" }, { type: "act", state: "thinking", duration: 2500 }],
  // Soneca curta
  () => [
    { type: "walkShort" },
    { type: "act", state: "sleeping", duration: 25000 },
  ],
  // Soneca longa
  () => [
    { type: "walk" },
    { type: "act", state: "sleeping", duration: 50000 },
    { type: "walkShort" },
  ],
  // Soneca muito longa (comportamento mais comum de dia)
  () => [
    { type: "walkShort" },
    { type: "act", state: "sleeping", duration: 75000 },
  ],
  // Coça a cabeça e continua
  () => [
    { type: "walk" },
    { type: "act", state: "scratching", duration: 2000 },
    { type: "walkShort" },
  ],
  // Vai até a borda e espreita
  () => [
    { type: "walkEdge" },
    { type: "act", state: "peeking", duration: 2200 },
  ],
  // Dança de leve e para
  () => [
    { type: "walkShort" },
    {
      type: "sequence",
      steps: [
        {
          state: "dancing",
          duration: 1200,
          anim: "dance 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        },
        { state: "default", duration: 500 },
      ],
    },
  ],
  // Acena discretamente
  () => [
    { type: "walkShort" },
    { type: "act", state: "waving", duration: 1600 },
  ],
  // Caminha rápido, para e olha em volta
  () => [
    { type: "walkFast" },
    { type: "act", state: "peeking", duration: 2000 },
  ],
  // Voo curto e volta
  () => [{ type: "flyMove", duration: 1600 }, { type: "walkShort" }],
  // Olha pra trás e dorme
  () => [
    { type: "walkFast" },
    { type: "act", state: "turningBack", duration: 2000 },
    { type: "act", state: "sleeping", duration: 35000 },
  ],
  // Apenas fica parado por muito tempo
  () => [{ type: "act", state: "idle", duration: 10000 }],
  // Vai até a borda e dorme lá
  () => [
    { type: "walkEdge" },
    { type: "act", state: "sleeping", duration: 45000 },
    { type: "walkShort" },
  ],
  // Sessao de pesca: 30s rendendo peixes ao longo do tempo
  () => [
    { type: "walkEdge" },
    { type: "act", state: "fishing", duration: 15000 },
    { type: "walkShort" },
  ],
];
