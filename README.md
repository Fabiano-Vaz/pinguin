# 🐧 Pinguim Pet para VS Code

Extensão do VS Code com um pinguim animado que anda continuamente enquanto o editor estiver aberto.

## 📁 Estrutura do Projeto

```
pinguim-game/
├── index.html          # Página principal
├── css/
│   └── style.css      # Estilos e animações
├── js/
│   └── script.js      # Lógica do jogo
└── assets/
    └── *.svg          # Imagens do pinguim (14 estados diferentes)
```

## 🚀 Como usar no VS Code

1. Abra esta pasta no VS Code.
2. Pressione `F5` para iniciar a janela de desenvolvimento da extensão.
3. O painel `Pinguim Pet` abre automaticamente (configurável).
4. Se quiser abrir manualmente, execute o comando `Pinguim: Abrir Pet`.

### Configuração

- `pinguin.autoOpenOnStartup`: define se o painel abre sozinho ao iniciar o VS Code (`true` por padrão).

O pinguim possui 14 estados diferentes, cada um com sua própria imagem SVG:

1. **Parado** (`pinguin.svg`) - Estado idle
2. **Correndo** (`pinguin correndo.svg`) - Usado quando anda/corre
3. **Pulando** (`pinguin pulando feliz.svg`) - Quando pula
4. **Dançando** (`pinguin dançando.svg`) - Animação de dança
5. **Dormindo** (`pinguin dormindo.svg`) - Estado relaxado
6. **Assustado** (`pinguin assustado.svg`) - Reação de susto
7. **Chorando** (`pinguin chorando.svg`) - Reação triste
8. **Com Raiva** (`pinguin com raiva.svg`) - Reação irritada
9. **Coçando a Cabeça** (`pinguin coçando a cabecinha.svg`) - Pensativo
10. **Dando Tchau** (`pinguin dando tchau.svg`) - Despedida
11. **Envergonhado** (`pinguin envergonhado.svg`) - Reação tímida
12. **Espiando** (`pinguin espiando curioso.svg`) - Curioso
13. **Gargalhando** (`pinguin gargalhando.svg`) - Rindo
14. **Pensando** (`pinguin pensando.svg`) - Concentrado

## 🎨 Recursos

- ✨ Animações suaves de movimento
- 💬 Balões de fala com frases em português
- ❄️ Neve caindo no fundo
- 🎯 Efeitos de partículas ao clicar
- 📱 Responsivo para dispositivos móveis
- 🎭 14 estados emocionais diferentes
- 🎮 Ações aleatórias automáticas

## 🎮 Interações no painel

- **Mouse**: o pinguim reage à proximidade do cursor
- **Clique no pinguim**: dispara reações aleatórias
- **Comportamento autônomo**: ele anda, para, dança e muda de estado sozinho

## 💻 Tecnologias

- HTML5
- CSS3 (Animações e Grid/Flexbox)
- JavaScript Vanilla (ES6+)
- SVG Assets

## 📝 Notas Técnicas

- O pinguim usa `pinguin correndo.svg` quando se move para esquerda ou direita
- A direção é controlada através de `scaleX(-1)` para espelhar a imagem
- Sistema de estados coordena qual SVG mostrar em cada ação
- Partículas de neve são geradas automaticamente de forma aleatória

## 🎯 Funcionalidades Principais

- **Sistema de Estados**: Cada ação tem um SVG específico
- **Movimento Inteligente**: Usa "correndo" ao andar, outros estados em ações específicas
- **Interatividade**: Responde a mouse, teclado e touch
- **Animações CSS**: Bounce, spin, shake para feedback visual
- **Balões de Fala**: Frases contextuais para cada estado

---

Feito com JavaScript, HTML, CSS e SVG.
