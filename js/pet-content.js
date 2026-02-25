(() => {
  window.PenguinPet = window.PenguinPet || {};

  window.PenguinPet.phrases = {
    idle: [
      "Oi! Tudo bem?",
      "Alguém me chamou?",
      "Tô aqui... só sendo fofo.",
      "Hm... e agora?",
      "Tô esperando o Wi-Fi carregar a vida.",
      "Bom dia! Ou boa tarde. Tanto faz.",
    ],
    running: [
      "WHEEE! Não me para!",
      "Correr é minha terapia!",
      "Alguém soltou o pinguim!!",
    ],
    jumping: [
      "YAAAY!",
      "Eu consigo voar... quase.",
      "Olha eu aqui em cima!",
      "Pulo, logo existo!",
      "Mais alto! MAIS ALTO!",
      "Oba oba oba!",
    ],
    dancing: [
      "Isso é vida, minha gente!",
      "Ninguém me para na pista!",
      "La la laaaa! 🎵",
      "Dança, pinguim, dança!",
    ],
    sleeping: [
      "Zzz...",
      "Tô só descansando os olhos...",
      "Sonhando com peixe fresco...",
      "Zzz... mais cinco minutinhos...",
    ],
    scared: [
      "AHHH! QUE FOI ISSO?!",
      "Minha alma saiu pelo bico!!",
      "Eu vi alguma coisa! Juro!",
      "Socorroooo!",
      "Faz isso não!!",
    ],
    crying: [
      "Buááá!",
      "Tô bem... tô bem... não tô.",
      "Snif snif... que vida dura...",
      "Alguém me dá um abraço?",
      "Tô chorando, mas com estilo.",
      "Isso não foi legal não... 😢",
    ],
    angry: [
      "GRRRR!",
      "Tô com a cabeça fumegando aqui!",
      "Quem fez isso?! QUEM FOI?!",
      "Não, não e NÃO!",
      "Caramba! Que tombo foi esse?!",
      "Ei! Mais cuidado comigo, pô!",
      "Que queda desnecessária... droga!",
    ],
    scratching: [
      "Coça coça coça...",
      "Hmm... tô pensando ou coçando?",
      "Esse lugar coça todo dia...",
      "Não olha assim pra mim.",
      "Operação coça-cabeça em andamento.",
    ],
    waving: [
      "Tchau tchau! 👋",
      "Até a próxima aventura!",
      "Volte sempre! Tenho saudade fácil.",
      "Vai com Deus! E com peixe.",
      "Flau flau! (é tchau em pinguinês)",
      "Até logo, amiguinho!",
    ],
    shy: [
      "Ui... que situação...",
      "Eu? Não... não sou eu não...",
      "Que vergonhinha...",
      "Tô vermelho embaixo da pena.",
      "Fica de boas... eu fico de corado.",
      "Não olha pra mim assim!",
    ],
    peeking: [
      "Psiu... tá seguro?",
      "O que é isso ali?!",
      "Espreitando com discrição total.",
      "Eu vi alguma coisa suspeita...",
      "Curioso? Eu? Jamais. (mentira)",
      "Quem é esse ser misterioso?",
    ],
    laughing: [
      "HAHAHAHAHA!",
      "Para! Para que eu vou morrer!",
      "Isso foi hilário demais!!",
      "Tô morrendo de rir aqui!",
      "Minha barriga tá doendo de rir!",
      "KEK KEK KEK!",
    ],
    thinking: ["Te amo!", "Acho que apaixonei!", "Vc é um xuxuzinho!"],
    eating: [
      "Hmmm... peixinho!",
      "Nhac nhac nhac!",
      "Isso sim e vida!",
      "Mais peixe, por favor!",
    ],
    flying: [
      "Vou conseguir! Só mais um pouquinho!",
      "Os pinguins PODEM voar. Hoje é o dia!",
      "Bate! Bate! BATE as asas!",
      "Eu juro que tô saindo do chão...",
      "A gravidade é fake news!",
      "Weeeeee!! (quase)",
    ],
  };

  window.PenguinPet.behaviors = [
    () => [{ type: "walk" }, { type: "act", state: "thinking", duration: 3000 }],
    () => [
      { type: "walk" },
      {
        type: "act",
        state: "dancing",
        duration: 3000,
        anim: "dance 0.7s ease-in-out infinite",
      },
      { type: "act", state: "laughing", duration: 2000 },
    ],
    () => [
      { type: "walk" },
      { type: "act", state: "sleeping", duration: 20000 },
      { type: "walk" },
    ],
    () => [
      { type: "walkEdge" },
      { type: "act", state: "peeking", duration: 3000 },
      { type: "walk" },
    ],
    () => [
      { type: "walk" },
      { type: "act", state: "scratching", duration: 2500 },
      { type: "walk" },
    ],
    () => [
      { type: "walkFast" },
      { type: "act", state: "scared", duration: 1500, anim: "shake 0.6s ease" },
      { type: "act", state: "shy", duration: 2000 },
      { type: "walk" },
    ],
    () => [
      { type: "jumpMove", duration: 1300 },
      { type: "act", state: "waving", duration: 2000 },
      { type: "walk" },
    ],
    () => [
      { type: "walk" },
      { type: "act", state: "crying", duration: 2500 },
      { type: "act", state: "shy", duration: 2000 },
      { type: "walk" },
    ],
    () => [
      { type: "walk" },
      { type: "act", state: "angry", duration: 2000, anim: "shake 0.5s ease" },
      {
        type: "act",
        state: "dancing",
        duration: 3000,
        anim: "dance 0.7s ease-in-out infinite",
      },
    ],
    () => [
      { type: "walkFast" },
      { type: "walk" },
      { type: "act", state: "waving", duration: 2000 },
    ],
    () => [
      { type: "flyMove", duration: 1800 },
      { type: "jumpMove", duration: 1000 },
      { type: "walk" },
    ],
  ];
})();
