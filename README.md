# 🐧 Pinguim Pet

Leve um pinguim cheio de personalidade para dentro do VS Code.
Ele vive no seu Explorer, reage ao que você faz, muda com o clima, caça comida, conversa, joga com você e transforma o editor em um cantinho mais divertido.

## 🎬 Demonstração

### Mini games

![Minigame Runner](https://raw.githubusercontent.com/Fabiano-Vaz/pinguin/main/assets/gif%20readme/game.gif)

- Pressione `Space` para iniciar o Runner.
- Pressione `M` para abrir a Memória Gelada.

### IA do Pinguim

![IA do Pinguim](https://raw.githubusercontent.com/Fabiano-Vaz/pinguin/main/assets/gif%20readme/ia.gif)

## 🆕 Novidades da versão 2.3

- **👕 Guarda-roupa**: 8 roupas e 10 acessórios de cabeça comprados com peixes.
- Novas peças: camisetas de Minion, Cruzeiro e Naruto, cabelo com bandana do Naruto
  e peruca rosa da Anya (Spy × Family).
- Navegação do guarda-roupa por setas `‹` e `›`, com prévia grátis antes de comprar.
- Poses redesenhadas em HTML/CSS, sem SVG, com as roupas acompanhando as animações.
- Nova personalidade local, com humor, necessidades e rotinas encadeadas.
- Estoque de peixes com validade de 24 horas por peixe, salvo entre sessões.

## ✨ Por que instalar

- Dá vida ao seu VS Code sem atrapalhar seu fluxo.
- Tem comportamento dinâmico e imprevisível (não fica repetitivo).
- Recompensa a interação com mini games integrados ao sistema de peixes.
- Permite personalizar o pinguim com roupas e acessórios comprados com peixes.
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

- HUD de estoque de peixes, salvo no VS Code mesmo ao fechar e reabrir.
- Cada peixe expira 24 horas depois de ser ganho; ganhar mais não renova os anteriores.
- Compras, alimentação e jogos gastam os peixes mais antigos primeiro.
- Sem consumo automático por fome por padrão; o presente inicial de 5 peixes é dado uma única vez.
- Botões rápidos para comer, pescar e acessar os mini games.
- Queda de peixe no cenário para coleta.
- Prioridade automática para caça/comida quando necessário.
- Sessão de pesca com ganho progressivo de peixes.
- Frases de fome e convite para jogar quando está sem peixe.
- O estoque também funciona como recompensa e recurso nos mini games.

### Guarda-roupa

- 8 roupas e 10 acessórios de cabeça, combináveis livremente.
- Prévia grátis no próprio painel; o peixe só é descontado ao clicar em **Comprar**.
- Cada peça custa `10` peixes e, depois de comprada, pode ser vestida sem novo custo.
- O visual escolhido acompanha o pinguim em todas as poses e no Runner.
- Na pose caveirinha, os acessórios ficam ocultos temporariamente.

### Minigame Runner integrado

- Jogo de corrida em tela cheia dentro da própria extensão.
- Obstáculos variados e dificuldade progressiva.
- Pulo responsivo e movimentação fluida.
- Pontuação + recorde salvos.
- Você ganha peixes ao evoluir no jogo.
- Ao perder, o Runner consome `5` peixes.
- Se houver menos de `5`, todo o estoque restante é consumido.
- A tela de fim de jogo informa quantos peixes foram perdidos.

### Memória Gelada

- Tabuleiro com pares de itens de neve e inverno.
- Contador de jogadas, tempo e pares encontrados.
- Cartas acertadas permanecem viradas e destacadas no tabuleiro.
- Cada par encontrado adiciona `2` peixes ao estoque.
- Cada tentativa errada remove `1` peixe.
- O estoque de peixes permanece visível no painel da partida.
- O consumo automático de peixes fica pausado enquanto o jogo está aberto.
- Se o estoque chegar a zero, a partida termina em game over.
- Após o game over, saia do jogo para o pinguim voltar a pescar.
- Layout responsivo para o painel lateral.

## 🎮 Controles principais

### Fora do jogo

- `V`: pulo especial (toques repetidos aumentam o impulso, como tentativa de voo).
- `M`: abrir ou fechar o jogo da memória.

### Menu de mini games

- Clique em `Mini games`, abaixo do botão `Pescar`.
- Escolha `Runner` ou `Memória` no submenu.
- Os atalhos de teclado continuam disponíveis.

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

### No Guarda-roupa

- Clique em `👕 Guarda-roupa` para abrir o painel.
- Use `‹` e `›` em **Roupa** e **Cabeça** para ver as peças; a prévia é grátis.
- Clique em `Comprar` para adquirir a peça ou em `Vestir` se ela já for sua.
- Escolha `Sem roupa` ou `Sem acessório` e clique em `Retirar` para tirar a peça.
- `×` ou `Esc`: fechar o painel.

## 🚀 Como usar

1. Instale a extensão.
2. Abra o VS Code.
3. Use o comando `Pinguim: Mostrar no Explorador`.

## ⚙️ Configuração disponível

| Propriedade                 | Padrão | O que faz                                                     |
| --------------------------- | ------ | ------------------------------------------------------------- |
| `pinguin.autoOpenOnStartup` | `true` | Abre o painel do pinguim automaticamente ao iniciar o VS Code |


## Desenvolvimento das animações

As 29 artes antes armazenadas em SVG agora usam camadas HTML e CSS. Os contornos
estão em `css/modules/artwork.css`, com `clip-path: path(...)`, elipses, gradientes,
máscaras CSS e 130 animações `@keyframes`. Não há SVG embutido, canvas ou imagens
rasterizadas substituindo as poses. Pequenas diferenças de suavização de bordas,
gradientes e texto podem ocorrer entre a renderização CSS e a referência original.

- `src/artwork/artwork-templates.ts`: camadas de cada pose e suas dimensões originais.
- `src/artwork/artwork.ts`: seleção, cache dos templates e ajuste ao tamanho disponível.
  O observador de tamanho é desconectado quando o elemento sai da página.
- `src/manifest.ts`: identificadores `css:idle`, `css:running`, etc. Apenas arquivos
  reais passam pelo resolvedor de URIs da extensão. Substituições de imagens pelo
  consumidor continuam suportadas.

A lógica de comportamento, interações e deslocamento continua em TypeScript. As
animações internas das poses são CSS, inclusive as mordidas no peixe e os movimentos
da vara de pesca. Guarda-chuva, boneco de neve e raios também usam HTML/CSS.
Os cenários PNG e os obstáculos de helicóptero em GIF continuam como arquivos.

Para revisar as poses, execute `npm run dev` e abra `/artwork-preview.html`.
A galeria permite mudar o tamanho, pausar e reiniciar as animações, incluindo as
poses extras `pondering` e `happyJump`. Ela também respeita a preferência do sistema
por movimento reduzido. A galeria é uma ferramenta de desenvolvimento e não é
incluída na extensão empacotada.


## Personalidade e movimento

O pinguim usa uma IA comportamental local, sem API, conexão externa ou cobrança.
Ela escolhe rotinas conforme energia, curiosidade, carinho, calma, proximidade do
cursor, chuva e estoque de peixes. A memória da sessão evita repetir imediatamente
a mesma rotina ou fala. Não é um modelo de linguagem nem um chat generativo.

- Clique simples: carinho, com reações tímidas ou carinhosas conforme a afinidade.
- Duplo clique: um salto de alegria.
- Alimentação: use **Comer** ou os peixes no cenário; encostar o cursor não gasta peixe.
- O sono recupera energia; brincar e caminhar consomem energia.
- Rotinas têm uma sequência coerente: observar, explorar e descansar; preparar um
  salto e comemorar; ou se acomodar, dormir e acordar.

A caminhada tem aceleração, frenagem e velocidade independente da taxa de quadros.
As passadas acompanham a velocidade. As trocas de pose e de direção são diretas,
como no comportamento original, sem rotação interpolada, atraso ou efeitos extras
entre ações. Uma interação nova cancela as reações pendentes, e a preferência por
movimento reduzido é respeitada pelas animações internas das poses.

Organização:

- `src/personality/personality-brain.ts`: necessidades, humor, memória e decisão por pontuação.
- `src/personality/routines.ts`: intenções, sequências e falas.
- `src/services/behavior-selection-service.ts`: ligação entre contexto e plano de ação.
- `src/motion/locomotion.ts`: deslocamento em pixels por segundo.
- `src/penguin/personality.ts`: ligação com carinho, alimentação e atualização do pet.

O painel de depuração existente mostra humor, necessidades e intenção atual.

## Guarda-roupa e base para acessórios

O botão **👕 Guarda-roupa** permite combinar **8 roupas e 10 acessórios de cabeça**, todos em HTML/CSS.
Cabeça e corpo são vendidos separadamente.

| Categoria | Peças |
| --------- | ----- |
| Roupa     | Darth Vader, Batman, Palhaço Pipoquinha, Patinho de borracha, Moletom turbo, Camiseta Minion, Camiseta Cruzeiro, Camiseta Naruto |
| Cabeça    | Capacete do Vader, Máscara do Batman, Peruca de circo, Viking do gelo, Gorrinho framboesa, Gorrinho aurora, DJ do iceberg, Patinho na cabeça, Naruto: cabelo e bandana, Peruca da Anya |

Compras da coleção anterior são convertidas em peças da coleção nova sem custo.
Cada peça custa **10 peixes**, descontados apenas ao clicar em **Comprar**.
Experimentar é grátis; peças compradas podem ser vestidas novamente sem cobrança.
As compras e o look são salvos localmente e acompanham o pet e o Runner.
Na pose caveirinha, todos os acessórios ficam temporariamente ocultos.
Cabeça e mangas usam os grupos animados do próprio desenho, com modelagens para
frente, lado, costas e deitado. As trocas entre ações continuam diretas.

O catálogo e o inventário ficam separados da renderização, com APIs para conceder,
equipar e remover itens. Novas variações dos modelos existentes precisam apenas de uma entrada no catálogo. A loja usa o saldo de peixes do próprio jogo.
As peças são escolhidas por setas `‹` e `›`, com a opção sem peça no início da lista.
Ao abrir o painel, a seleção começa na peça que o pinguim está usando.
O painel compacto mantém as duas categorias, suas setas e os botões visíveis sem rolagem
em telas pequenas. Em painéis muito baixos, a prévia fica oculta para dar espaço
à navegação.

Veja [como criar peças, integrar a loja e ajustar encaixes](docs/accessories.md).
Para abrir a galeria e experimentar todas as roupas e poses, execute
`npm run dev:artwork` na pasta do projeto. O comando inicia o servidor e abre o navegador.
Com `npm run dev` já rodando, acesse `http://localhost:5173/artwork-preview.html`
(ou a porta indicada no terminal). Abrir o HTML diretamente por `file://` exibe
as instruções de acesso, pois o navegador não executa os módulos TypeScript sozinho.

## Executar o projeto em desenvolvimento

No VS Code, abra a pasta do projeto, selecione **Executar Pinguim Pet** em
**Executar e Depurar** e pressione **F5**. A tarefa **Pinguim: compilar** executa
`npm run build` antes de iniciar, incluindo o código da extensão e da webview.
Se a compilação falhar, corrija o erro mostrado no terminal antes de continuar.

A janela de desenvolvimento usa `--disable-extensions` para isolar o pinguim das
outras extensões instaladas. Essa opção vale para a sessão de teste; não desinstala
extensões nem altera as preferências globais. O pinguim em desenvolvimento continua
habilitado. Para testar apenas a interface no navegador, execute `npm run dev` e
abra o endereço mostrado no terminal.

Outros comandos úteis:

| Comando                | O que faz                                              |
| ---------------------- | ------------------------------------------------------ |
| `npm test`             | Executa os testes automatizados                        |
| `npm run lint`         | Verifica os tipos da extensão e executa os testes      |
| `npm run dev:artwork`  | Abre a galeria de poses e roupas no navegador          |
| `npm run package:vsix` | Compila e gera `release/pinguin-pet-<versão>.vsix`     |
