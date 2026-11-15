# Site cinematográfico para dentista

Site estático para consultório odontológico com vídeo guiado pela rolagem, etapas interativas e agendamento pelo WhatsApp. Começou como projeto freelance para um cliente real; este repositório é a versão base, com dentista, textos e fotos fictícios.

**Demonstração ao vivo:** https://site-dentista-template.davi-santiago-6-68d.workers.dev

![Topo com o vídeo guiado pela rolagem](docs/capturas/topo.webp)

## Resumo

| | |
|---|---|
| Papel | Desenvolvimento completo: arquitetura, front-end, testes, desempenho e publicação |
| Stack | TypeScript, Vite, GSAP (ScrollTrigger), Canvas 2D, Vitest, Playwright, ffmpeg, Cloudflare Workers |
| Testes | 21 unitários (Vitest) e 14 de ponta a ponta (Playwright, desktop e iPhone 13) contra o build de produção |
| Desempenho | Lighthouse 92 no celular e 99 no desktop no site entregue, CLS perto de zero |
| Acessibilidade | 96 no Lighthouse, `prefers-reduced-motion`, contraste WCAG AA conferido |

## O problema

O cliente queria que o topo do site fosse um vídeo que avança conforme a pessoa rola a página, e que uma seção mostrasse a transformação de um dente em três etapas clicáveis. As duas coisas precisavam ser fluidas no celular, sem atrasar a primeira tela.

## Como resolvi, e o que ficou pelo caminho

A animação passou por cinco versões até chegar na atual. Cada uma foi testada na prática no navegador, e as que não serviram estão documentadas em `docs/arquitetura.md`.

1. **Quadros num canvas ligados direto à rolagem, com Lenis.** Travava: um giro da roda pulava vários quadros de uma vez.
2. **Botões tocando trechos do vídeo.** Pouco fluido, e o vídeo parava em pontos intermediários que não ficavam bons parados.
3. **Vídeo nativo tocando sozinho.** Fluido, mas sem a interação que o cliente queria.
4. **Rolagem suavizada (a solução do topo).** A rolagem só define o alvo. Um laço próprio de `requestAnimationFrame` leva a posição até ele com aproximação exponencial, independente da taxa de quadros da tela, e desenha os dois quadros vizinhos misturados pela parte fracionária. Um giro brusco da roda vira movimento contínuo, sem degrau.
5. **Etapas com o mesmo desenhador de quadros.** Vídeo nativo não toca ao contrário com fluidez, então as etapas usam o canvas com um tween do GSAP de duração proporcional à distância. A forma anima para a frente e para trás, e um clique no meio da animação parte de onde ela está. Sem clique, as etapas se alternam sozinhas a cada 2 s enquanto a seção está na tela; depois de um clique, a escolhida fica 8 s antes de a alternância voltar.

O código separa a lógica pura (cálculo de recorte, ordem de carga, suavização, mistura de quadros, duração das etapas, mensagem do WhatsApp) da parte que mexe na página. A lógica pura é toda coberta por teste unitário.

## Desempenho

- O pôster é o LCP, e a primeira frase já vem visível no HTML, sem esperar o JavaScript.
- As fontes carregam sem bloquear a primeira pintura.
- Os 190 quadros de cada vídeo só começam a baixar depois do `load`, em ordem de pontas e passos (16, 8, 4, 2, 1) com 6 downloads simultâneos. Enquanto um quadro não chega, aparece o vizinho carregado mais próximo.
- Cache imutável para quadros e imagens.
- O histórico das medições, incluindo as regressões e como foram corrigidas (o LCP no celular chegou a 6,2 s numa versão inicial), está em `docs/arquitetura.md`.

## Testes

Os testes de ponta a ponta rodam contra o build de produção e conferem o comportamento, não só a renderização:

- a imagem acompanha a rolagem suavizada, sem pular para o fim num salto grande;
- o botão de agendamento no fim do topo recebe clique (o link é interceptado, o teste não sai para a internet);
- cada etapa passa por quadros intermediários antes de parar, nos dois sentidos, e voltar à primeira para no mesmo quadro do início;
- as etapas se alternam sozinhas e esperam 8 s depois de um clique;
- com movimento reduzido, o conteúdo aparece parado e as etapas trocam sem animação;
- os links de WhatsApp têm número e mensagem válidos, e não há erro no console.

```bash
npm test
npx playwright install chromium
npm run test:e2e
```

## Rodar e publicar

```bash
npm ci
npm run dev
npm run deploy   # Cloudflare Workers com assets estáticos; precisa de npx wrangler@4 login
```

Os quadros e as imagens das etapas saem dos vídeos com ffmpeg (`libwebp`):

```bash
npm run quadros -- caminho/topo.mp4 brilho 190 0.85
npm run quadros -- caminho/etapas.mp4 forma 190 0.85
npm run etapas -- caminho/etapas.mp4 forma 0.85 0 3.875 7.85
```

## Estrutura

```
src/sequence.ts      desenho de quadros no canvas e controle pela rolagem
src/steps.ts         etapas clicáveis e alternância automática
src/beats.ts         frases do topo conforme o progresso
src/whatsapp.ts      link com mensagem pronta e cumprimento pela hora
src/reveal.ts        entradas e parallax
scripts/             extração de quadros e imagens com ffmpeg
tests/               Vitest (unit) e Playwright (e2e)
docs/                arquitetura, design, personalização e créditos
```

## Direitos autorais

© 2026 Davi Santiago. Todos os direitos reservados.

Este repositório é público só para consulta, como portfólio. Ele não tem licença de uso: não é permitido copiar, modificar, distribuir ou usar comercialmente o código, no todo ou em parte, sem autorização por escrito. Para licenciamento, uso comercial ou contratação, fale comigo: davi.santiago.6@gmail.com

As fotos de pessoas são do Unsplash e seguem a licença do Unsplash (lista em `docs/creditos.md`). Detalhes em `LICENSE`.
