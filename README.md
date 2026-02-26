# 🐧 Pinguim Pet

Um pinguim interativo no painel **Explorer** do VS Code, com IA de comportamento, clima dinâmico, reações ao usuário e minigame runner.

## ✨ Funcionalidades

### 🎭 Estados visuais do pinguim

- Idle (sentado)
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

### 🧠 Comportamento e interações

- Caminhada autônoma com variação de direção e profundidade visual
- Reações ao mouse (curiosidade, fuga, perseguição e aproximação)
- Balões de fala com frases contextuais
- Interações por clique e double-click
- Arrastar e soltar com reação própria
- Modo de reclamação após spam de cliques
- Queda de peixe e prioridade automática para caça/comida
- Cursor de peixe com lógica de “comer cursor”
- Guarda-chuva animado com posicionamento e inclinação dinâmica

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
