# 🐧 Pinguim Pet

Um pinguim animado no painel **Explorer** do VS Code, com comportamento autônomo e interações visuais.

## ✨ Funcionalidades

| Recurso | Descrição |
| --- | --- |
| 🎭 Estados emocionais | Vários estados com SVG dedicado (correndo, dançando, dormindo, assustado, etc.) |
| 💘 Visual apaixonado frequente | `pinguin-apaixonado.svg` usado em estados recorrentes (`shy` e `thinking`) |
| 🤖 Movimento contínuo | O pinguim se move de forma mais ativa, com menos tempo parado |
| 🦘 Pulos mais realistas | Saltos mais curtos, sutis e naturais |
| 😄 Risada em sequência | Ao rir: ri, volta ao normal, e ri novamente |
| ⏱️ Emoções mais longas | Estados emocionais permanecem mais tempo na tela |
| 💬 Balões ocasionais | Mensagens aparecem apenas de vez em quando (aprox. 5 min entre oportunidades) |
| 🖱️ Interações | Reage ao mouse, clique e arrasto |
| ❄️ Neve e partículas | Neve no fundo e efeito de partículas ao clicar |

## 🚀 Como usar

1. Instale a extensão.
2. Abra o VS Code: o painel do pinguim pode abrir automaticamente no **Explorer**.
3. Para abrir manualmente: `Ctrl+Shift+P` → `Pinguim: Mostrar no Explorador`.

## ⚙️ Configuração

| Propriedade | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `pinguin.autoOpenOnStartup` | `boolean` | `true` | Abre automaticamente o painel do pinguim ao iniciar o VS Code |

## 🎮 Interações disponíveis

- Mover o mouse perto do pinguim.
- Clicar no pinguim para reação aleatória.
- Arrastar e soltar o pinguim no painel.
- Deixar ele agir sozinho no modo autônomo.

## 🛠️ Tecnologias

- JavaScript (Vanilla)
- HTML + CSS
- SVGs para estados do personagem

## 🧱 Estrutura de código

- `js/pet-shared.js`: fonte única de verdade para assets e config padrão.
- `js/pet-config.js`: aplica overrides de ambiente (navegador/VS Code) sem duplicar regras.
- `js/pet-penguin.js`: núcleo da classe `Penguin` + loop de atualização.
- `js/pet-penguin-*.js`: módulos por responsabilidade (`state`, `speech`, `motion`, `ai`, `interactions`).
- `extension.js` e `index.html`: apenas injetam contexto do ambiente (URLs/config) e reutilizam o mesmo núcleo.
