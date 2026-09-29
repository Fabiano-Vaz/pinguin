# Roupas e acessórios

Abra **👕 Guarda-roupa** para experimentar, comprar e vestir fantasias e acessórios de cabeça.
Cada peça custa **10 peixes**. Selecionar uma opção muda somente a prévia: o saldo
só é debitado no botão **Comprar**. A compra já veste a peça. Itens comprados podem
ser vestidos ou retirados de graça; saldo insuficiente bloqueia novas compras.

As compras e o look são salvos localmente na mesma webview/origem. O Runner usa
o mesmo look; na pose **caveirinha**, roupas e acessórios ficam ocultos e reaparecem
quando o pinguim volta ao normal. A galeria `/artwork-preview.html` permite revisar
as 27 poses do pinguim; 26 recebem acessórios e a caveirinha fica sem roupa.
A galeria tem inventário de teste separado e não libera produtos no jogo.

O painel usa um layout compacto: prévia pequena com saldo/preço ao lado e botões
na mesma linha dos seletores. Roupa e acessório ficam visíveis sem rolagem nos painéis
pequenos testados, a partir de 180 × 180 px. Em alturas de até 220 px, a prévia
decorativa fica oculta para priorizar as opções e as compras. Enquanto o painel
está aberto, o consumo automático de peixes por fome fica pausado.

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `src/wardrobe/catalog.ts` | IDs estáveis, nomes, cores, estampa e tipo de cada peça |
| `src/wardrobe/wardrobe-store.ts` | Inventário, equipar/remover, assinaturas e persistência versionada |
| `src/wardrobe/pose-rigs.ts` | Encaixes de cabeça, corpo e mangas em cada pose |
| `src/wardrobe/render-outfit.ts` | Aplicação da roupa na árvore animada da pose |
| `css/modules/wardrobe.css` | Modelagens frontal, lateral, de costas e deitado; interface |
| `src/wardrobe/wardrobe-panel.ts` | Guarda-roupa do pet |
| `src/wardrobe/wardrobe-controls.ts` | Seletores compartilhados com a galeria |

## Coleção divertida

São cinco roupas (Darth Vader, Batman, Palhaço Pipoquinha, Patinho de borracha e
Moletom turbo) e oito acessórios: capacete do Vader, máscara do Batman, peruca de
circo, capacete viking, gorrinhos framboesa e aurora, fone DJ do iceberg e chapéu de
patinho. Todas as combinações entre os dois slots são permitidas.

As seis peças da coleção anterior são convertidas por `legacyAccessoryIds` ao
restaurar uma compra v2: oceano → Vader, carinho → palhaço, camiseta menta → Batman,
boné sol → patinho. A conversão preserva propriedade e equipamento sem cobrar nem
conceder peças que não haviam sido compradas. O próximo salvamento grava os novos IDs.

## Nova variação de roupa ou acessório

Adicione um produto ao `accessoryCatalog`. Não é necessário desenhar cada pose:

```ts
{
  id: "suit-lavender", // único e permanente; não reutilizar para outro produto
  name: "Moletom lavanda",
  slot: "body",
  kind: "tshirt",
  color: "#9274c4",
  accent: "#fff1ff",
  motif: "bolt", // "panel", "bat", "clown", "duck", "bolt" ou "none"
}
```

Para cabeça, use `slot: "head"` e um dos modelos `helmet`, `cowl`, `wig`, `viking`,
`beanie`, `headphones` ou `duck`, com `motif: "none"`. As cores usam `#RRGGBB`.
O renderizador cria partes semânticas e o CSS define a silhueta específica de cada
modelo; todos herdam os mesmos encaixes animados. Fones preservam o cabelo visível.
O catálogo é validado ao criar o store: IDs duplicados, cores inválidas e pares
incompatíveis de slot/tipo são rejeitados. Nomes entram na interface como texto.
Nenhum produto precisa fornecer HTML, JavaScript, SVG ou coordenadas de poses.

## Compra com peixes

O preço único fica em `ACCESSORY_PRICE`, no store. A interface injeta a economia
existente do jogo como `FishWallet`, sem manter uma segunda contagem de peixes:

```ts
import { getWardrobe } from "./src/wardrobe/wardrobe-store.ts";
const wardrobe = getWardrobe();
const wallet = {
  balance: () => runtime.getFishStock(),
  spend: (amount: number) => runtime.consumeFishStock(amount),
  subscribe: (listener: () => void) => runtime.subscribeFishStock(listener),
};

// Chamar SOMENTE no clique explícito em Comprar:
const result = wardrobe.purchase("suit-vader", wallet);
if (result === "purchased" || result === "owned") wardrobe.equip("suit-vader");
// Outros resultados: "insufficient" e "unknown"; nenhum cobra peixes.
wardrobe.unequip("body");
```

Uma compra duplicada retorna `owned` sem debitar novamente. O saldo é verificado
pela própria economia no momento do clique. O HUD e o saldo da loja acompanham
as mudanças por assinatura, inclusive quando o pet ganha peixes enquanto a loja
está aberta. `grant()` continua disponível para recompensas e testes; o catálogo
da loja não usa `starter`, para que todas as peças precisem ser compradas.

A prévia recebe um `WardrobeStore` separado pelo segundo argumento de
`createArtwork(asset, store)`. Selecionar, fechar e reabrir o painel não concede
itens, não muda a roupa real e não gasta peixes.

`WardrobeStore` recebe um `WardrobeStorage` com `load()` e `save(snapshot)`. O padrão
usa `penguin.wardrobe.v2` e snapshots `{ version: 2, owned, equipped }`. Os exemplos
gratuitos da versão 1 não são tratados como compras; o registro antigo é preservado
mas não carregado pela loja. IDs desconhecidos, versões incompatíveis e slots
errados são ignorados. Falha de armazenamento mantém o inventário da sessão.
O saldo usa `FishStockLedger` com lotes `{ amount, expiresAt }`: cada ganho dura
24 horas, inclusive com o VS Code fechado. O host salva `penguin.fish-stock.v1`
no `ExtensionContext.globalState`; a prévia no navegador usa `localStorage`.
Compras consomem os lotes mais antigos primeiro. Expirações atualizam o HUD e a
loja automaticamente, e o saldo é validado novamente antes de gastar. Reabrir ou
ganhar peixes não renova prazos nem repõe o presente inicial de 5 peixes. O consumo
automático por fome está desativado por padrão.

## Como os encaixes acompanham os movimentos

O desenho base continua sendo HTML/CSS. O rig traduz as camadas numéricas internas
para três conceitos: cabeça, superfície do corpo e mangas. A peça é filha do grupo
que já anima aquela parte, herdando rotação, deslocamento, escala e direção.
Não existe um segundo relógio de animação para roupas.

- A camiseta usa o contorno real do corpo e fica atrás das asas.
- Cada manga recorta o contorno de sua asa e acompanha seu movimento individual.
- O acessório fica no grupo da cabeça e ajusta a silhueta à perspectiva;
  chapéus ocultam os cabelos e o fone mantém o arco aberto com cabelo visível.
- Corrida e salto do Runner usam o contorno lateral real do corpo e da barriga,
  com manga recortada sobre a asa original. A pesca tem um contorno próprio,
  ombro separado e manga presa ao braço animado que segura a vara.
- Na corrida abaixada, a roupa cobre também o trecho de ombro que faz parte do
  recorte da cabeça, evitando uma borda preta sobre a camiseta quando ela gira.
- A pose deitada tem proporções próprias. De costas, a estampa frontal fica oculta.
- Nas duas poses que respiram apenas pelo torso, a roupa e a parte visível da
  barriga são colocadas dentro desse mesmo grupo animado.
- A aba pode ultrapassar o limite original da arte durante a corrida abaixada.
  Isso é apenas visual; não altera tamanho, velocidade ou colisões do jogo.

Trocar roupa atualiza somente as camadas de acessórios. Trocar de ação continua
sendo imediato, como solicitado; o sistema não adiciona giro, interpolação nem
atraso entre poses. Retirar as peças restaura as camadas originais. Ao remover um
`penguin-artwork` da página, sua assinatura do guarda-roupa é encerrada.

Guarda-chuva, boneco de neve e caveirinha não recebem acessórios.
Imagens externas fornecidas pela API de override também não recebem peças:
para um desenho personalizado ter acessórios, ele precisa de um template HTML/CSS
com seu próprio rig.

## Nova modelagem ou nova pose

Uma cor/estampa nova só precisa de um item de catálogo. Para um tipo diferente
(óculos, cachecol, mochila etc.), amplie `AccessorySlot`/`Accessory.kind`, a validação,
o renderizador e os encaixes necessários. Defina suas camadas de oclusão para
frente, lado e costas; não apenas uma imagem fixa sobre o pet.

Ao adicionar ou redesenhar uma pose, atualize `pose-rigs.ts` com as camadas reais do
template, as coordenadas locais da cabeça e as asas. Nunca use coordenadas de tela
ou copie keyframes para um acessório. `tests/wardrobe.test.ts` exige cobertura de
todas as poses e verifica a existência dos encaixes/superfícies referenciados.

Antes de concluir um item/modelagem, confira a galeria com ambas as peças, nos dois
sentidos, em 68/120/260 px e em diferentes fases da animação. Revise também corpo
cheio, sono, cabeça inclinada, braços erguidos, costas, pesca e corrida abaixada.
Rode os testes, o build e a checagem de tipos da webview.
