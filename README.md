# 🐧 Pinguim Pet

Um pinguim interativo no painel **Explorer** do VS Code, com IA de comportamento, clima dinâmico, reações ao usuário e minigame runner.

## ✨ Funcionalidades

### 🎭 Estados visuais do pinguim

- Idle (sentado)
- Pescando no gelo
- Correndo
- Correndo abaixado (durante caça de peixe no chão)
- Pulando
- Dançando
- Dormindo
- Assustado
- Chorando
- Bravo
- Coçando a cabeça
- Dando tchau
- Envergonhado
- Espiando
- Gargalhando
- Pensando / apaixonado
- Comendo peixe
- Voando
- De costas
- Caveirinha
- Animações refinadas de pesca (vara, linha, boia, batida de pé e olhos semicerrados)
- Animação de comer peixe com consumo visual único (não reaparece no mesmo ciclo)

### 🧠 Comportamento e interações

- Caminhada autônoma com variação de direção e profundidade visual
- Reações ao mouse (curiosidade, fuga, perseguição e aproximação)
- Balões de fala com frases contextuais
- Interações por clique e double-click
- Arrastar e soltar com reação própria
- Modo de reclamação após spam de cliques
- Queda de peixe e prioridade automática para caça/comida
- Cursor de peixe com lógica de “comer cursor”
- Estoque de peixe com HUD, consumo e reposição em runtime
- Frases de fome/contexto sem peixe (inclui convite para jogar e ganhar peixe)
- Ação de pesca com duração de 30s e ganho progressivo (+1 peixe a cada 10s)
- Sem peixe: 90% de chance de priorizar pesca no próximo comportamento
- Sem peixe: auto-início de pesca após 10s
- Guarda-chuva animado com posicionamento e inclinação dinâmica
- Guarda-chuva com cúpula superior mais achatada (visual atualizado)
- Com chuva ativa, o pinguim não tenta executar voo automático

### 🌦️ Ambiente e efeitos

- Efeitos visuais de neve
- Efeitos de chuva
- Flash/relâmpago e vento
- Partículas e feedbacks de clique

### 🕹️ Runner Game (integrado)

- Minigame runner em tela cheia dentro da própria view
- Física aprimorada de pulo:
  - `jump buffer`
  - `coyote time`
  - gravidade de subida/queda ajustada
  - salto curto ao soltar o botão cedo
- Dificuldade progressiva com aumento gradual de velocidade
- Geração de obstáculos variados (chão e aéreos)
- Spawns com espaçamento mínimo para reduzir situações injustas
- HUD com pontuação e recorde
- Recorde persistido em `localStorage`

## 🎮 Controles do Runner

- `Space`, `↑` ou `W`: iniciar / reiniciar / pular
- `↓` ou `S`: abaixar
- Segurar pulo: salto mais alto
- Soltar cedo: salto curto

## 🚀 Uso no VS Code

1. Instale a extensão.
2. Abra o VS Code.
3. Para abrir manualmente: `Ctrl+Shift+P` -> `Pinguim: Mostrar no Explorador`.

## ⚙️ Configuração

| Propriedade | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `pinguin.autoOpenOnStartup` | `boolean` | `true` | Abre automaticamente o painel do pinguim ao iniciar o VS Code |

## 🧱 Estrutura do projeto

Estrutura atual organizada por domínio e responsabilidade:

```text
src/
├─ app/
│  └─ pet-bootstrap.js              # composição da app (wire-up dos módulos)
├─ runtime/
│  ├─ pet-fish-economy.js           # estoque de peixe, HUD e regras de consumo/reposição
│  └─ pet-environment-events.js     # eventos globais (mouse, clique, clima)
├─ games/
│  └─ runner/
│     ├─ runner-context.js          # estado base, cena e utilitários do runner
│     ├─ runner-obstacles.js        # geração de obstáculos e colisão
│     └─ penguin-runner-game.js     # runtime do runner (loop, input, física)
├─ pet-*.js                         # núcleo do pet (estado, IA, movimento, etc.)
└─ script.js                        # entrypoint leve (delegação para bootstrap)
```

Essa organização já facilita migração futura para framework porque separa:
- `app`: camada de inicialização/composição.
- `runtime`: regras de domínio e eventos do mundo.
- `games`: features independentes (podem virar módulo/lazy feature depois).
