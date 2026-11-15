# Design

## Direção

Modelo de site para dentista de odontologia estética e harmonização facial. O dentista do modelo (Dr. Rafael Lemos, CRO-UF 00000) e as unidades (Centro e Zona Sul) são fictícios.

Os dois vídeos mostram a mesma forma clara, opaca como porcelana crua, que ganha brilho e translucidez. A leitura é direta: dente opaco virando dente tratado, sem mostrar boca nem paciente. O site segue essa ideia de material e luz, num fundo claro e quente tirado do próprio vídeo, em vez do fundo escuro mais comum em sites desse tipo. Os vídeos têm fundo cinza claro, e um site escuro criaria uma moldura pesada em volta deles.

Nicho na tabela de partida: clínica estética e saúde (tom calmo e confiável, CTA "Agendar avaliação").

## Tom de voz

Calmo, direto, sem promessa de resultado. Frases curtas no topo, texto corrido nas seções. O texto fala de avaliação e planejamento antes de procedimento, e evita superlativos, números inventados e qualquer coisa que soe como garantia (o Código de Ética Odontológica restringe esse tipo de anúncio).

## Paleta

Extraída do vídeo `Glow_reveals_porcelain_glaze` com `palettegen` (8 cores: #5A4D3E, #8C8376, #989184, #A19A8C, #ABA497, #B5AEA1, #BEB8AC, #DDD9CF) e das imagens de apoio (fundo em torno de #DFD7CC).

| Token | Hex | Uso |
|---|---|---|
| `--bg` | #ECE7DF | fundo da página, tom de porcelana clara |
| `--surface` | #E0D9CE | faixa de depoimentos, placeholders |
| `--fg` | #29231D | texto principal, botões |
| `--muted` | #675D52 | texto secundário |
| `--accent` | #73552F | itálicos, números, rótulos; derivado do #5A4D3E do vídeo |
| `--line` | #CBC2B5 | divisórias |
| `--video` | #B4ACA0 | fundo atrás do vídeo no desktop |
| `--video-mobile` | #A99F93 | fundo atrás do vídeo de etapas no celular |
| `--light` | #F1ECE4 | texto sobre fundo escuro |

Contraste (WCAG):

| Par | Razão |
|---|---|
| fg sobre bg | 12,6 |
| muted sobre bg | 5,2 |
| accent sobre bg | acima de 4,9 |
| fg sobre o vídeo (#B4ACA0) | 6,9 |
| fg sobre surface | 11,1 |
| muted sobre surface | 4,6 |
| light sobre fg | 13,2 |

O texto secundário (`--muted`) não é usado sobre o vídeo, onde o contraste cairia para 2,9.

## Tipografia

Instrument Serif (títulos, frases do topo, números da seção Sobre) e Figtree 400/500/600 (corpo, botões, rótulos). Carregadas do Google Fonts com `display=swap` e sem bloquear a primeira pintura.

Títulos com entrelinha entre 0,95 e 1,05, corpo 1,6, larguras de texto entre 38 e 60ch.

## Frases do topo (vídeo "brilho", 190 quadros, guiado pela rolagem)

Uma frase por vez, em Instrument Serif grande, à esquerda. Cada uma aparece num intervalo do progresso da rolagem do topo (0 a 1), com fade de 0,04 nas bordas.

| Progresso | Momento do vídeo | Frase |
|---|---|---|
| 0 a 0,12 | forma opaca parada | Todo sorriso tem uma *forma natural.* (h1) |
| 0,18 a 0,32 | clarão de luz à esquerda | A luz mostra o que pede *cuidado.* |
| 0,39 a 0,57 | camada líquida cobrindo a forma | Cada camada no tom exato do *seu dente.* |
| 0,63 a 0,76 | forma brilhante com fumaça | Brilho de porcelana, sem cara de *artificial.* |
| 0,83 até o fim | forma lisa e brilhante | Nome, CRO, especialidades e botão de WhatsApp (clicável) |

## Etapas do processo (vídeo "forma", clicáveis)

As três etapas ficam em lista, ao lado da imagem, que ocupa a coluna da direita até a borda da tela e se funde ao fundo na borda esquerda; nela a forma se transforma até o quadro da etapa escolhida. Cada etapa é um botão; a ativa fica com opacidade 1 e o fio lateral em `--accent`, as outras com 0,45 (0,8 no hover). Acima da lista, a dica "Escolha uma etapa para ver a mudança."

| Etapa | Quadro do vídeo |
|---|---|
| 01 Avaliação | início, forma opaca |
| 02 Planejamento | 3,875 s, perolada e acetinada |
| 03 Tratamento e retorno | fim, lisa e brilhante |

## Ordem das seções

1. Topo com o vídeo "brilho" guiado pela rolagem (400vh).
2. Sobre o dentista: foto de consultório, texto, trajetória em lista curta e ficha com CRO, especialidades, unidades e pós-graduação. Vem logo depois do topo, para quem chega conhecer o doutor primeiro.
3. Tratamentos em cinco cartões pequenos lado a lado (foto quadrada, número, título e texto curto), numa faixa com rolagem lateral e barra fina em `--accent` embaixo: lentes e facetas, clareamento, prótese e implantes, harmonização facial, lábios.
4. Faixa em tela cheia com parallax (copo d'água com hortelã) e a frase "Saúde vem antes da estética".
5. Como funciona: três etapas em lista, ao lado da imagem em tela cheia da coluna, em que a forma anima até a etapa ativa. As etapas se alternam sozinhas a cada 2 s; um clique escolhe a etapa e segura a alternância por 8 s.
6. Resultados: seis fotos ilustrativas de sorrisos em grade (3 colunas no desktop, 2 no celular), com título e uma linha de legenda cada, e link para mais casos no perfil.
7. Depoimentos: quatro textos ilustrativos, com a inicial e o procedimento.
8. Unidades: duas unidades com endereço de exemplo, uma delas com foto de consultório.
9. CTA final: fundo limpo tirado do próprio vídeo, sem o objeto; foto do dentista em PNG recortado, centralizada na metade esquerda, com a borda esquerda e a base sumindo em degradê; texto e botão à direita. No celular o texto vem em cima e a foto fecha a seção, centralizada.
10. Rodapé com nome, CRO, especialidades e aviso de que resultados variam.

## Imagens de apoio

| Arquivo | Conteúdo | Onde |
|---|---|---|
| lentes | lâminas translúcidas empilhadas | Lentes e facetas |
| escala-de-cor | escala de cor em arco | Clareamento |
| espelho | espelho clínico sobre linho | Prótese |
| pedras | pedras empilhadas com hortelã | Harmonização facial |
| orquidea | orquídea sobre linho | Lábios |
| agua-hortela | copo d'água com hortelã | Faixa com parallax |

## Movimento

Topo: a rolagem define o alvo, e a imagem chega até ele com suavização de 0,14 s e mistura entre quadros vizinhos, sem degrau nem salto. A página rola de forma nativa.

Etapas: escolher uma etapa anima a forma do quadro atual até o da etapa, para a frente ou para trás (vídeo inteiro em 4,5 s, `power2.inOut`). Sem clique, a seção avança sozinha para a etapa seguinte 2 s depois de chegar em cada uma; depois de um clique, espera 8 s.

As entradas das outras seções são ligadas à rolagem: 1 s com `power3.out` e deslocamento de 36 px, parallax de -8% a 8%. Nada gira nem pisca.

Com `prefers-reduced-motion`, o topo mostra o pôster com todas as frases, e as etapas trocam a imagem parada, sem animar.

## Celular

O vídeo é paisagem e o assunto fica à direita. No celular o topo usa um recorte 8:9 próprio, desenhado pela largura no alto da tela, com as bordas esticadas para o fundo continuar sem emenda; as frases ficam embaixo. Na seção de etapas a imagem fica presa logo abaixo do cabeçalho e só a etapa ativa mostra o texto. Botão flutuante de WhatsApp à direita.

## Fotos de pessoas

As fotos do dentista, dos sorrisos e do consultório são do Unsplash (veja `docs/creditos.md`) e servem só para demonstração. O fundo do CTA final (`fundo-final.webp`) foi montado a partir do primeiro quadro do vídeo do topo: a metade esquerda, sem o objeto, espelhada e desfocada, com grão leve.
