(() => {
  window.PenguinPet = window.PenguinPet || {};

  window.PenguinPet.phrases = {
    idle: ["...", "hmm.", "*olha ao redor*", "tô por aqui."],

    running: ["*trotando*", "...", "*corre um pouco*"],

    jumping: ["*hop*", "...", "*saltinho*"],

    dancing: ["*balança levemente*", "♪ ♩ ♪", "..."],

    sleeping: ["zzz...", "zz...", "...zzz"],

    scared: ["!"],

    crying: ["...", "*soluço*", "sniff."],

    angry: ["humph.", "*resmunga baixinho*", "..."],

    scratching: ["*coça a cabeça*", "hmm...", "...", "*pensativo*"],

    waving: ["*acena*", "o/", "..."],

    shy: ["*esconde o rosto*", "...", "*tímido*"],

    peeking: ["*espia*", "...", "*curioso*"],

    laughing: ["heh.", "*risinho*", "heh heh."],

    thinking: ["...", "*pensa*", "hmm..."],

    eating: ["*nom nom*", "*come*", "mmm."],
    full: [
      "SOCORRO...comi muitos peixinhos",
      "Buchinho cheio",
      "Acho que comi demais",
    ],
    fullSleep: ["Vou tirar um cochilinho e ja volto."],
    fishing: [
      "aff, vou ter que pescar...",
      "ninguem me da peixe, ne...",
      "la vou eu pescar de novo.",
      "tomara que venha um peixao.",
    ],

    flying: ["*bate as asinhas*", "...", "*flap flap*"],

    turningBack: ["*olha pra trás*", "...", "*espreita*"],

    // Frases especiais (eventos específicos)
    dropped: [
      "Se me jogar novamente eu não volto",
      "Isso doeu...",
      "*olhar de julgamento*",
    ],

    love: ["Te amo!", "♥", "*cora*"],

    rant: [
      "PARA P#!@ !!!!",
      "PARAAA!!!",
      "NÃO QUERO MAAAAIISS",
      "PARA DE CLICAR NESSA M#$%@!",
    ],

    fishLow: [
      "Meus peixinhos estao acabando...",
      "Sobram poucos peixinhos!",
      "Ja esta quase no fim dos peixinhos.",
    ],

    fishLast: ["Ultimo peixinho!"],

    fishEmpty: [
      "Estou com fome... quero mais peixinhos!",
      "Acabaram os peixinhos. Quero mais!",
      "Sem peixe...",
      "Vamos jogar para ganhar peixe?",
    ],

    fishRage: [
      "QUERO PEIXEEE!!!!",
      "CADE MEU PEIXE?! QUERO AGORA!",
      "SEM PEIXE DE NOVO NAO! QUERO PEIXEEE!!!!",
    ],

    fishHudFishingPrompt: [
      "Ta me mandando ir pescar éh!?",
      "Quer peixe? Entao vou pescar!",
      "Blz... la vou eu pescar.",
    ],

    loveSymbol: ["♥"],

    snowmanFlirt: [
      "Oi, boneca... seu sorriso derrete meu gelo.",
      "Se eu for de gelo, voce e meu verao.",
      "Com voce ate nevasca vira romance.",
      "Posso ficar aqui te admirando pra sempre?",
      "Voce caiu do ceu junto com esses floquinhos?",
    ],

    shootingStarWish: [
      "Vamos fazer um pedido!",
      "Olha uma estrela cadente!",
      "Pede um desejo comigo!",
    ],
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
    () => [
      { type: "walk" },
      { type: "act", state: "thinking", duration: 2500 },
    ],
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
})();
