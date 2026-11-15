# Arquitetura

## Stack

Site estático: Vite 8 + TypeScript sem framework, GSAP 3 com ScrollTrigger, Vitest para as funções puras e Playwright para os testes de ponta a ponta contra o build de produção. Sem backend; o contato é feito pelo WhatsApp.

```
index.html                  marcação de todas as seções, SEO e JSON-LD
src/main.ts                 monta o topo, as etapas e as entradas
src/sequence.ts             quadros num canvas: desenho com mistura (createFramePlayer) e controle pela rolagem do topo
src/beats.ts                frases do topo conforme o progresso
src/steps.ts                etapas clicáveis e alternância automática, animando a forma até o quadro de cada etapa
src/reveal.ts               entradas, parallax, cabeçalho
src/styles.css              tokens e layout
scripts/extrair-quadros.sh  quadros WebP do topo e das etapas
scripts/extrair-etapas.sh   imagens paradas das etapas (reserva e movimento reduzido)
public/frames/{brilho,forma}/{desktop,mobile}/0001.webp ...
public/img/                 pôsteres, quadros das etapas, imagens de apoio e fotos de banco de imagens
```

## Histórico das decisões

A animação passou por cinco versões antes da atual, todas validadas e descartadas:

1. Topo e etapas ligados à rolagem com quadros num canvas e Lenis. A rolagem ficou travada: cada giro da roda pulava vários quadros de uma vez.
2. Botões circulares tocando trechos. Pouco fluido, e o vídeo parava em pontos intermediários feios.
3. Vídeo nativo tocando sozinho. Fluido, mas sem interação.
4. Topo de volta à rolagem, com suavização própria e todos os quadros; etapas como botões que tocavam o vídeo até três quadros escolhidos. O topo ficou; nas etapas o vídeo deixava cortes e um degradê escuro na borda da imagem.
5. Etapas com três imagens paradas num quadro, trocando com fade. Sem corte nem degradê, mas a troca de foto não mostrava a transformação.
6. Etapas com os quadros do vídeo num canvas dentro de um quadro 4:5: o clique anima a forma até o quadro da etapa. A animação ficou; o quadro pequeno não.
7. Atual: topo igual ao 4; etapas com a animação do 6, e a imagem volta a ocupar a coluna inteira até a borda da tela, fundida ao fundo da página na borda esquerda.

## Topo: rolagem suavizada

O vídeo "brilho" (7,93 s, 24 fps) foi extraído inteiro: 190 quadros, sem pular nenhum.

| Variante | Resolução | Quadros | Peso |
|---|---|---|---|
| desktop | 1280x712 | 190 | 3,1 MB |
| celular | recorte 632x712 (foco_x 0,85) | 190 | 2,4 MB |

A rolagem não desenha nada diretamente. O ScrollTrigger só atualiza o alvo (posição do quadro, fracionária). Um laço de `requestAnimationFrame` próprio leva a posição atual até o alvo com aproximação exponencial (`approach`, constante de 0,14 s, independente da taxa de quadros da tela) e para quando chega. A cada passo, `blendPair` desenha o quadro inteiro de baixo e o seguinte por cima com opacidade igual à parte fracionária, então a imagem anda sem degrau mesmo com rolagem lenta. Um giro brusco da roda vira movimento contínuo em vez de salto. As frases do topo usam o mesmo progresso suavizado, então texto e imagem andam juntos.

A página rola de forma nativa (sem Lenis). A seção do topo tem 400vh, com a imagem presa no alto (`position: sticky`).

O botão do WhatsApp da última frase recebe clique quando está visível: `applyBeats` liga `pointer-events` só quando a opacidade passa de 0,6, e o container das frases não bloqueia cliques.

Carregamento: o pôster (primeiro quadro) é o LCP no celular, e a primeira frase vem visível no HTML. Os quadros só começam a baixar no `load`, na ordem pontas, depois passos de 16, 8, 4, 2 e 1, com 6 downloads simultâneos. Enquanto um quadro não chega, aparece o vizinho carregado mais próximo.

No celular o quadro é desenhado pela largura, no alto, com a primeira e a última linha esticadas até as bordas do canvas para o fundo continuar sem emenda.

## Etapas: clique anima até o quadro da etapa

O vídeo "forma" (7,93 s) também foi extraído inteiro, 190 quadros (desktop 1280x712, 2,7 MB; celular 632x712, 2,0 MB). Cada etapa corresponde a um quadro:

| Etapa | Quadro | Segundo | Aparência |
|---|---|---|---|
| 01 Avaliação | 0 | 0 | forma opaca, porcelana crua |
| 02 Planejamento | 93 | 3,875 | perolada e acetinada, já sem partes foscas |
| 03 Tratamento e retorno | 189 | 7,875 | lisa e brilhante |

O ponto do meio foi escolhido numa folha de contato entre 2,9 e 4,9 s: antes de 3,8 s ainda há restos foscos que não ficam bem parados.

O desenho usa o mesmo `createFramePlayer` do topo (canvas, mistura entre quadros vizinhos). Ao clicar numa etapa, um tween do GSAP leva a posição do quadro atual até o quadro da etapa, nos dois sentidos, com `power2.inOut`. A duração é proporcional à distância (`travelDuration`): o vídeo inteiro em 4,5 s, a metade em cerca de 2,2 s, mínimo de 0,9 s. Um clique durante a animação parte de onde a forma está, sem salto. Não há vídeo nessa seção, então não há corte nem reposicionamento.

As etapas também se alternam sozinhas (1, 2, 3 e de volta à 1) enquanto a seção está na tela e a aba está visível. A espera conta a partir da chegada na etapa: 2 s na alternância automática e 8 s depois de um clique, para quem escolheu uma etapa ter tempo de ler. Fora da tela o relógio para e, ao voltar, recomeça a espera que estava valendo. No movimento reduzido não há alternância. No celular, onde só a etapa ativa mostra o texto, o parágrafo ativo tem altura mínima de 4 linhas para a troca não empurrar a página.

O canvas ocupa a coluna da direita inteira, até a borda da tela (foco horizontal 0,92 no desktop, para a forma caber inteira), com um degradê de 22% que funde o fundo da página na borda esquerda. Por baixo dele ficam as três imagens paradas (`extrair-etapas.sh`), que aparecem enquanto os quadros não chegam e no movimento reduzido. Os quadros baixam quando os do topo terminam ou quando a seção chega a 600 px da tela, o que vier primeiro.

No celular o quadro fica preso logo abaixo do cabeçalho enquanto a lista passa, e só a etapa ativa mostra o texto, para a mudança ser vista ao tocar.

## Gerar os arquivos

```bash
npm run quadros -- fonte/Glow_reveals_porcelain_glaze_1d5872a7.mp4 brilho 190 0.85
npm run quadros -- fonte/Tooth_transforms_into_glossy_white_98d192fa.mp4 forma 190 0.85
npm run etapas -- fonte/Tooth_transforms_into_glossy_white_98d192fa.mp4 forma 0.85 0 3.875 7.85
```

Os dois scripts usam o `ffmpeg` do PATH ou o caminho em `FFMPEG` (precisa de `libwebp`). Ambos cortam 4 px no topo e na base, onde os vídeos de origem têm uma faixa preta de 3 px. Os vídeos vieram sem marca d'água visível e sem quadros pretos (conferido com `blackdetect`).

Se mudar o número de quadros, atualize `FRAMES_BRILHO`, `FRAMES_FORMA` e `QUADROS_ETAPAS` em `src/main.ts`.

## Fotos e recorte do dentista

As fotos de pessoas vêm do Unsplash (lista em `docs/creditos.md`, originais fora do repositório) e foram convertidas para WebP. O recorte do dentista para o CTA final foi feito fora do projeto, com a biblioteca Python `rembg` (modelo `isnet-general-use`): o nome bordado no scrub foi apagado antes, a base recebeu um degradê de transparência e restos do fundo perto da cabeça foram limpos à mão. Ficou em `public/img/doutor.webp` (usada no site) e `public/img/doutor.png`. Nada disso roda no build.

O fundo do CTA final (`public/img/fundo-final.webp`) foi gerado a partir do primeiro quadro do topo: a metade esquerda, que não tem o objeto, espelhada, desfocada e com grão leve.

## Movimento reduzido

Com `prefers-reduced-motion: reduce` o topo não usa quadros: mostra o pôster com todas as frases empilhadas. As etapas continuam clicáveis e trocam a imagem parada, sem animar nem alternar sozinhas. As entradas animadas não rodam.

## Cache

Na Cloudflare Pages o cabeçalho vem de `public/_headers`; na Vercel, de `vercel.json`. Os dois definem `Cache-Control: public, max-age=31536000, immutable` para `/frames/*` e `/img/*`. Se trocar um vídeo, mude o nome da pasta ou dos arquivos para não servir a versão velha do cache.

## Testes

- `npm test`: funções puras de `sequence.ts` (recorte, ordem de carga, suavização, mistura de quadros), `beats.ts` e `steps.ts` (duração da animação entre etapas e ordem da alternância).
- `npm run test:e2e`: build de produção na porta 4174, desktop (1440x900) e celular (iPhone 13). Confere que o topo desenha e segue a rolagem; que um salto grande de rolagem é suavizado em vez de pular; que o botão do WhatsApp do fim é clicável (o link é interceptado, o teste não sai para a internet); que o clique nas etapas passa por quadros intermediários antes de parar, nos dois sentidos, e que voltar à etapa 1 para exatamente no quadro do início; que as etapas se alternam sozinhas e esperam 8 s depois de um clique; movimento reduzido; ausência de erros no console; destino dos CTAs e âncoras. Gera capturas em `test-results/`.
- `FECHAMENTO=1 npm run test:e2e`: ativa o teste que falha se sobrar `[[preencher` na página.

## Auditoria de desempenho

No site entregue com esta mesma estrutura, o Lighthouse deu 92 de desempenho no celular e 99 no desktop. Rode de novo em cada cliente, porque as fotos dele mudam o peso.
