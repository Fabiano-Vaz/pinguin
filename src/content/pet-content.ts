window.PenguinPet = window.PenguinPet || {};
window.PenguinPet.phrases = {
  idle: [
    "tá tranquilo por aqui...",
    "de boa, respirando o ar condicionado",
    "tô só te fazendo companhia, uai",
    "calma, que o dia tá bom",
  ],

  running: [
    "vou dar uma voltinha",
    "bora explorar um pouquinho",
    "tô de passagem, sô",
    "andando com estilo",
  ],

  jumping: ["ó o pulim", "ixe, fui", "pulei", "um pulin só"],

  dancing: [
    "reboladinho de felicidade",
    "trem bão demais!",
    "dançando pro dia melhorar",
    "olha o passinho",
  ],

  sleeping: ["capotado...", "mimir, viu", "apaguei", "só o bagaço"],

  scared: ["nó, credo", "oxente!", "vixe Maria!"],

  crying: [
    "tô triste agora...",
    "ai, dói um pouquinho",
    "não merecia isso, uai",
    "tá doendo o bico...",
  ],

  beaten: [
    "ei, vai com calma...",
    "tá me zoando, é?",
    "para, que eu fico chateadinho",
    "assim você me derruba de vez",
  ],

  angry: [
    "tô um pouquinho irritadinho...",
    "hmmpf...",
    "não gostei não",
    "tá me estressando, viu",
  ],

  scratching: [
    "pensando aqui...",
    "que ideia será...",
    "matutando alto",
    "tô bolando um plano",
  ],

  waving: [
    "oi oi! 👋",
    "e aí, meu humano preferido",
    "tô aqui te vendo codar",
    "olááá!",
  ],

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
    "só dando uma espiadinha",
    "tô de olho no seu progresso",
    "curioso por natureza",
    "o que você tá fazendo aí?",
  ],

  laughing: [
    "hehehe, muito bom!",
    "tá me fazendo rir, sô",
    "ksksks",
    "essa foi boa demais",
  ],

  thinking: [
    "deixa eu pensar...",
    "ideia vindo...",
    "tô bolando aqui",
    "peraí que tá quase",
  ],

  ating: [
    "peixim fresquinho, delícia!",
    "nham nham nham ✨",
    "obrigado pelo peixe!",
    "tá uma maravilha",
  ],

  full: ["bucho cheio", "vixe, comi muito", "bah, lotado", "encheu, sô"],

  fullSleep: [
    "coma de peixe ativada zZz",
    "agora vou tirar um cochilo merecido",
    "tô no modo off",
  ],

  fishing: [
    "vou tentar pescar pra gente",
    "bora ver se mordeu",
    "pescando com carinho",
    "torce pra eu pegar um grandão",
  ],

  flying: [
    "quase voei de verdade!",
    "asa bateu forte",
    "tô me sentindo leve",
    "voou baixinho, mas voou",
  ],

  turningBack: [
    "tem alguém aí?",
    "só verificando...",
    "tô de olho no perímetro",
    "quem tá passando?",
  ],

  dropped: [
    "ei, cuidado comigo...",
    "quase me machuquei, uai",
    "você me derrubou de novo...",
    "tô meio tonto agora",
  ],

  love: [
    "gosto muito de você, sabia?",
    "você é meu humano favorito",
    "cê me faz feliz, sô",
    "❤️ tô aqui pra te animar",
    "tu é especial pra mim",
  ],

  rant: [
    "para de me clicar tanto!",
    "ei, tá me perturbando...",
    "assim eu fico nervoso",
    "respeita o pinguim!",
  ],
  fishLow: [
    "tô comendo pouco, hein...",
    "os peixinhos estão acabando",
    "preciso repor o estoque",
  ],

  fishLast: ["é o último peixim...", "só mais um restinho", "última boquinha"],

  fishEmpty: [
    "acabou meu peixe...",
    "tô com fome, sô",
    "não tem mais nenhum...",
    "me ajuda a pescar?",
  ],

  fishRage: [
    "quero peeeixe!",
    "tô morrendo de fome aqui!",
    "peixinho pelo amor de deus",
    "bah, me dá um peixe vai",
  ],

  fishHudFishingPrompt: [
    "bora pescar juntos?",
    "vou tentar pegar uns peixes",
    "partiu repor o estoque!",
  ],

  loveSymbol: ["♥", "♡", "<3"],

  snowmanFlirt: [
    "que boneco charmoso",
    "ele é quase tão bonito quanto eu",
    "friozinho gostoso né",
    "tá elegante esse bonequinho",
  ],

  shootingStarWish: [
    "quero mais peixes...",
    "faz meu humano codar feliz",
    "que hoje seja um dia bom",
    "estrela, me ajuda aí",
  ],

  cruzeiro: ["É O CRUZEIRO, PORRA!", "dale zêrooo!", "vai, rapaz!"],
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
