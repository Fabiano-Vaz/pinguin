  window.PenguinPet = window.PenguinPet || {};

  window.PenguinPet.phrases = {
    idle: [
      "…… zzzzs",
      "tô vivão… mais ou menos",
      "*bocejo gigante*",
      "alguém me ama hoje ou é só mais um dia ruim?",
    ],

    running: [
      "*trotando com preguiça*",
      "tô indo… mas sem pressa",
      "*suspiro enquanto corre*",
    ],

    jumping: [
      "*pulinho sem vontade*",
      "aff… por que eu faço isso?",
      "*hop meia-boca*",
    ],

    dancing: [
      "*balança devagar tipo 'tô nem aí'*",
      "♪ só porque você tá olhando ♪",
      "tá… dançando um pouquinho… feliz agora?",
    ],

    sleeping: [
      "ZzzZZzZ… me deixa…",
      "ronc ronccc",
      "…… apagado até segunda ordem",
    ],

    scared: ["AI MEU DEUS NÃO FAZ ISSO!!", "!!!", "*se joga no chão de susto*"],

    crying: ["…… sniff…", "*fungando dramaticamente*", "ninguém gosta de mim…"],

    beaten: [
      "PARA DE ME BATER, CARA!!",
      "Ô MÃO PESADA! PARA COM ISSO AGORA!",
      "EI! CHEGA DE PORRADA, TÁ MALUCO?!",
      "SE CONTINUAR ME BATENDO EU VOU SURTAR!",
      "ME RESPEITA! PARA DE ME BATER!",
    ],

    angry: [
      "Tá me irritando de propósito né?",
      "*resmunga alto*",
      "TÔ DE SACO CHEIO!!!",
    ],

    scratching: [
      "*coça a cabeça com força*",
      "tô tentando entender minha vida…",
      "…… por que eu existo mesmo?",
    ],

    waving: [
      "*aceno preguiçoso*",
      "… oi… tô aqui ainda…",
      "o/ (mas sem ânimo)",
    ],

    shy: [
      "*esconde a cara com as nadadeiras*",
      "…… não olha pra mim assim",
      "*vermelho de vergonha*",
    ],

    peeking: [
      "*espia de canto*",
      "tô só olhando… não tô curioso não",
      "*curiosidade level 9000*",
    ],

    laughing: [
      "heheheh…",
      "*risadinha contida*",
      "tá… foi engraçado… pode parar agora",
    ],

    thinking: ["…… pensando na vida", "hmm……", "*olhar perdido no vazio*"],

    eating: [
      "*nom nom nom com vontade*",
      "peixe é vida",
      "mmmh… melhor coisa do mundo",
    ],

    full: [
      "SOCORRO EU VOU EXPLODIR DE PEIXE",
      "bucho lotado… não cabe nem ar",
      "comi demais e agora tô arrependido… mas faria de novo",
    ],

    fullSleep: ["Tô entrando em coma alimentar… até mais"],

    fishing: [
      "aff… lá vou eu de novo ser explorador de gelo",
      "ninguém me dá peixe de graça nessa vida né…",
      "pescar é sofrimento disfarçado de hobby",
      "se vier filé mignon eu perdoo o universo",
    ],

    flying: [
      "*bate asinha com esforço*",
      "sou um pinguim voador… por 3 segundos",
      "*flap flap cansado*",
    ],

    turningBack: [
      "*olha desconfiado pra trás*",
      "tô sentindo que vão me clicar de novo…",
      "*olhar de quem já sofreu*",
    ],

    // Frases especiais
    dropped: [
      "Tá me jogando de novo? Sério isso?",
      "Dói, sabia? … emocionalmente também",
      "*olhar de profunda decepção e julgamento*",
      "Mais uma vez e eu deleto minha existência",
    ],

    love: [
      "…… te amo, tá? Não conta pra ninguém",
      "♥♥♥ (mas finge que não viu)",
      "*abraço imaginário desajeitado*",
      "você é meu peixe favorito da vida",
    ],

    rant: [
      "PARA DE CLICAR EM MIM CAR**LHO!!!",
      "EU NÃO SOU BRINQUEDO NÃO!!!",
      "TÁ ACHANDO QUE EU GOSTO DISSO???",
      "VAI CLICAR NA TUA MÃE!!!",
    ],

    fishLow: [
      "meus peixinhos… tão indo embora…",
      "só mais uns 3… não me abandona assim",
      "tá acabando o estoque… socorro",
    ],

    fishLast: ["ÚLTIMO PEIXINHO DO APOCALIPSE!!!"],

    fishEmpty: [
      "…… sem peixe = pinguim morto por dentro",
      "Tô morrendo de fome e você aí de boa?",
      "Cadê meu amor em forma de peixe???",
      "Vamos jogar ou eu entro em greve?",
    ],

    fishRage: [
      "QUERO PEIXE AGORA OU EU GRITO",
      "PEIXEEEEEEEEEEEE!!!!!!",
      "VOCÊ TÁ ME MATANDO DEVAGAR SEM PEIXE",
      "É SÓ UM PEIXINHO… NÃO Custa NADA",
    ],

    fishHudFishingPrompt: [
      "Tá me mandando trabalhar né, seu preguiçoso?",
      "Beleza… vou pescar… mas só por você <3",
      "Se eu voltar sem peixe a culpa é sua",
    ],

    loveSymbol: ["♥", "♡", "<3 (mas de verdade)"],

    snowmanFlirt: [
      "você é frio… mas derrete meu coraçãozinho",
      "se eu te abraçar eu viro água… vale o risco?",
      "posso te admirar até virar estátua de gelo?",
      "você caiu do céu ou é só mais um floco perfeito?",
    ],

    shootingStarWish: [
      "faz um pedido comigo… mas pede peixe pra mim tá?",
      "estrela cadente! Pede pra eu nunca ficar sem peixe",
      "vamos desejar juntos… eu começo: PEIXE ETERNO",
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
