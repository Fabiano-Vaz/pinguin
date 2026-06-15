# 🐧 Pinguim Pet

Leve um pinguim cheio de personalidade para dentro do VS Code.
Ele vive no seu Explorer, reage ao que você faz, muda com o clima, caça comida, conversa, joga com você e transforma o editor em um cantinho mais divertido.

## 🎬 Demonstração

### Mini games

![Minigame Runner](https://raw.githubusercontent.com/Fabiano-Vaz/pinguin/main/assets/gif%20readme/game.gif)

- Pressione `Space` para iniciar o Runner.
- Pressione `M` para abrir a Memória Gelada.

<h1 align="left">Pinguim Pet</h1>

![IA do Pinguim](https://raw.githubusercontent.com/Fabiano-Vaz/pinguin/main/assets/gif%20readme/ia.gif)

## ✨ Por que instalar

- Dá vida ao seu VS Code sem atrapalhar seu fluxo.
- Tem comportamento dinâmico e imprevisível (não fica repetitivo).
- Recompensa a interação com mini games integrados ao sistema de peixes.
- Funciona como um “companheiro de mesa” enquanto você programa.

## 💙 Tudo que ele faz

### Personalidade viva

- Anda sozinho pela tela com movimentação natural.
- Reage ao mouse (curiosidade, aproximação, fuga, perseguição).
- Fala com balões contextuais.
- Responde a clique, double-click e arrastar/soltar.
- Pode ficar bravo se você exagerar nos cliques.
- Tem momentos especiais e reações surpresa.

### Visual rico (muitos estados)

- Sentado, correndo, correndo abaixado, pulando, voando.
- Dançando, dormindo, assustado, chorando, bravo.
- Coçando a cabeça, dando tchau, envergonhado, espiando.
- Gargalhando, pensando/apaixonado, de costas, caveirinha.
- Pescando no gelo com animações detalhadas.
- Comendo peixe com feedback visual de consumo real.

### Clima e efeitos no cenário

- Neve, chuva, vento e relâmpagos.
- Partículas e efeitos de clique.
- Eventos climáticos que mudam o humor e o comportamento do pinguim.
- Guarda-chuva dinâmico com animações e reações físicas.

### Sistema de peixe e rotina inteligente

- HUD de estoque de peixes.
- Queda de peixe no cenário para coleta.
- Prioridade automática para caça/comida quando necessário.
- Sessão de pesca com ganho progressivo de peixes.
- Frases de fome e convite para jogar quando está sem peixe.
- O estoque também funciona como recompensa e recurso nos mini games.

### Minigame Runner integrado

- Jogo de corrida em tela cheia dentro da própria extensão.
- Obstáculos variados e dificuldade progressiva.
- Pulo responsivo e movimentação fluida.
- Pontuação + recorde salvos.
- Você ganha peixes ao evoluir no jogo.
- Ao perder, o Runner consome até `5` peixes ou todo o estoque disponível.

### Memória Gelada

- Tabuleiro com pares de itens de neve e inverno.
- Contador de jogadas, tempo e pares encontrados.
- Cartas acertadas permanecem viradas e destacadas no tabuleiro.
- Cada par encontrado adiciona `3` peixes ao estoque.
- Cada tentativa errada remove `1` peixe.
- O HUD de peixes permanece visível durante a partida.
- O consumo automático de peixes fica pausado enquanto o jogo está aberto.
- Se o estoque chegar a zero, a partida termina em game over.
- Após o game over, saia do jogo para o pinguim voltar a pescar.
- Layout responsivo para o painel lateral.

## 🎮 Controles principais

### Fora do jogo

- `V`: pulo especial (toques repetidos aumentam o impulso, como tentativa de voo).
- `M`: abrir ou fechar o jogo da memória.
- `Mini games`: botão abaixo de `Pescar` para escolher entre Runner e Memória.

### No Runner

- `Space`: iniciar.
- `Space`, `↑` ou `W`: pular/reiniciar.
- `↓` ou `S`: abaixar.
- `Esc`: sair do runner.

### Na Memória Gelada

- Clique nas cartas para encontrar os pares.
- Encontre pares para ganhar peixes e evite erros para não perder o estoque.
- Use `Embaralhar novamente` para iniciar uma nova rodada.
- `M` ou `Esc`: sair do jogo.

## 🚀 Como usar

1. Instale a extensão.
2. Abra o VS Code.
3. Use o comando `Pinguim: Mostrar no Explorador`.

## ⚙️ Configuração disponível

| Propriedade                 | Padrão | O que faz                                                     |
| --------------------------- | ------ | ------------------------------------------------------------- |
| `pinguin.autoOpenOnStartup` | `true` | Abre o painel do pinguim automaticamente ao iniciar o VS Code |
