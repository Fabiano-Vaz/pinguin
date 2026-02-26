(() => {
  window.PenguinPet = window.PenguinPet || {};

  window.PenguinPet = window.PenguinPet || {};

window.PenguinPet.phrases = {
  idle: [
    "Tá pensando ou tá debugando mentalmente?",
    "Esse olhar é de quem esqueceu um ;",
    "Compilando ideias... ⏳",
    "Se olhar fixamente pro código ele se resolve sozinho?",
    "Hmm… isso tem cara de bug escondido.",
    "Respira. Não é culpa sua. (provavelmente)",
    "Você parece inteligente digitando assim.",
    "Eu confio em você, dev.",
  ],

  running: [
    "Deploy em produção!!! CORRE!",
    "É hotfix! É HOTFIX!",
    "Foge do bug!!",
    "Pipeline passou? NÃO?!",
    "Rollback! Rollback!",
  ],

  jumping: [
    "Funcionou de primeira?! 😮",
    "SEM ERRO NO CONSOLE!!",
    "Testes verdes!! 🟢🟢🟢",
    "Era só limpar o cache! EU SABIA!",
    "Deploy sem erro? Milagre!",
  ],

  dancing: [
    "Build passou!!! 🎉",
    "Sem conflito de merge!",
    "PR aprovado!!",
    "Cliente disse 'perfeito'!!!",
    "Hoje é dia de commitar feliz.",
  ],

  sleeping: [
    "npm install tá rodando... zzz",
    "Docker build demora mesmo...",
    "Enquanto compila eu descanso...",
    "CI/CD trabalhando por nós...",
  ],

  scared: [
    "VOCÊ RODOU EM PRODUÇÃO?!",
    "Cadê o backup?!",
    "Apagou a tabela errada?!",
    "Isso não era pra acontecer...",
    "Quem mexeu na ENV?!",
  ],

  crying: [
    "Mas ontem tava funcionando...",
    "Eu não toquei nessa parte 😭",
    "Quem fez esse código?",
    "Stack trace infinito...",
    "Erro 500… de novo não…",
  ],

  angry: [
    "Quem fez esse if aninhado?!",
    "Isso aqui precisava MESMO ser assim?",
    "Comentário: 'arrumar depois'… sério?",
    "Variável chamada x1FinalFinalMesmo?",
    "Isso não é gambiarra… é arte moderna.",
  ],

  scratching: [
    "Hmm... isso tem cara de escopo errado...",
    "Será que é cache?",
    "Deixa eu pensar mais um pouco...",
    "Tem algo estranho aqui...",
    "Operação debug silencioso.",
  ],

  waving: [
    "Até amanhã, dev!",
    "Não esquece de dar git push!",
    "Salva antes de sair!",
    "Commit pequeno é commit feliz!",
    "Vai descansar, o bug espera.",
  ],

  shy: [
    "Eu vi você errando… mas finjo que não.",
    "Todo mundo erra um ponto e vírgula.",
    "Relaxa… eu também não sei voar.",
    "Foi só um errinho bobo...",
  ],

  peeking: [
    "Você tá no StackOverflow, né?",
    "Isso aí é chatGPT aberto?",
    "Copiou e colou… confessa.",
    "Testando direto em produção? 👀",
  ],

  laughing: [
    "HAHAHAHAHA!",
    "Era só um ; mesmo!",
    "Você passou 40 minutos nisso?",
    "Bug resolvido com restart 😂",
    "KEK KEK KEK!",
  ],

  thinking: [
    "Será que é problema de escopo?",
    "Tá faltando await aqui...",
    "Isso tem cara de race condition...",
    "Cache ou banco?",
    "Tá no front… certeza.",
  ],

  eating: [
    "Hmmm… peixinho e café ☕",
    "Dev vive de café e esperança.",
    "Sem café não tem deploy.",
    "Alimentando o cérebro pra debugar.",
  ],

  flying: [
    "Hoje eu viro tech lead!",
    "Escalabilidade infinita!!",
    "Microserviços, baby!",
    "Cloud resolve tudo… né?",
    "Bate as asas da arquitetura!",
  ],

  turningBack: [
    "Psst... tô revisando seu commit.",
    "Hm? Tinha console.log aqui?",
    "Só conferindo se não quebrou nada...",
    "Nada a ver aqui. Pode passar.",
    "Olha o que achei nesse diff...",
  ],
};

  window.PenguinPet.behaviors = [
    () => [
      { type: "walk" },
      { type: "act", state: "thinking", duration: 3000 },
    ],
    () => [
      { type: "walk" },
      {
        type: "sequence",
        steps: [
          {
            state: "dancing",
            duration: 1400,
            anim: "dance 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
            speak: true,
          },
          { state: "default", duration: 650 },
          { state: "peeking", facing: "right", duration: 900 },
          { state: "peeking", facing: "left", duration: 900 },
          {
            state: "dancing",
            duration: 1400,
            anim: "dance 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
          },
          {
            state: "flying",
            duration: 1200,
            anim: "bounce 1s ease-in-out infinite",
          },
          { state: "default", duration: 800 },
        ],
      },
    ],
    () => [
      { type: "walk" },
      { type: "act", state: "sleeping", duration: 20000 },
      { type: "walk" },
    ],
    () => [
      { type: "walkShort" },
      { type: "act", state: "sleeping", duration: 14000 },
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
      { type: "walkShort" },
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
        anim: "dance 1.05s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
      },
    ],
    () => [
      { type: "walkFast" },
      { type: "walk" },
      { type: "act", state: "waving", duration: 2000 },
    ],
    () => [
      { type: "flyMove", duration: 1800 },
      { type: "walkShort" },
      { type: "walk" },
    ],
    () => [
      { type: "walk" },
      { type: "act", state: "turningBack", duration: 2500 },
      { type: "walk" },
    ],
    () => [
      { type: "walkFast" },
      { type: "act", state: "turningBack", duration: 3500 },
      { type: "act", state: "sleeping", duration: 8000 },
      { type: "walk" },
    ],
    () => [
      { type: "walkEdge" },
      { type: "act", state: "sleeping", duration: 12000 },
      { type: "walkShort" },
    ],
  ];
})();
