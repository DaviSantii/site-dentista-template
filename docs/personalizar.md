# Como personalizar para um novo cliente

Este é o modelo base: mesma estrutura do site entregue, com dentista, textos, fotos e contatos fictícios. Para um cliente novo, parto de uma cópia do projeto e troco tudo da lista abaixo.

## O que é fictício e precisa ser trocado

| Onde | O que está no modelo | Trocar por |
|---|---|---|
| `index.html`, `<title>`, descrição, Open Graph | Dr. Rafael Lemos | nome do cliente, cidade e bairros (ajuda no SEO local) |
| `index.html`, JSON-LD | nome, descrição, CRO, endereços de exemplo, Instagram genérico | dados reais |
| Cabeçalho e rodapé | "Rafael Lemos", CRO-UF 00000 | nome e CRO do cliente |
| Topo, última frase | "Dr. Rafael Lemos · CRO-UF 00000" e frase de especialidades | nome, CRO e especialidades reais |
| Sobre | foto de banco de imagens, texto e trajetória genéricos | foto do cliente e trajetória real (formação, cursos, pós) |
| Tratamentos | cinco tratamentos de odontologia estética | o que o cliente realmente faz |
| Resultados | seis fotos de sorrisos de banco de imagens, marcadas como ilustrativas | antes e depois reais, com autorização dos pacientes e dentro das regras do CFO |
| Depoimentos | quatro textos ilustrativos | relatos reais com autorização, com inicial ou nome |
| Unidades | "Centro" e "Zona Sul", endereços de exemplo, foto de banco de imagens | endereços, link exato do Google Maps e foto da clínica |
| CTA final | recorte de banco de imagens (`public/img/doutor.webp` e `.png`) | recorte de uma foto do cliente (fundo liso ajuda) |
| `src/main.ts` | `initWhatsApp("5500000000000", "Dr. Rafael")` | número com DDI e DDD, e como o cliente quer ser chamado na mensagem |
| `index.html`, links `data-cta` | link com o número `5500000000000` e "Olá, Dr. Rafael!" | o mesmo link com o número real (vale quando o JS não roda) |
| `tests/e2e/site.spec.ts` e `tests/unit/whatsapp.test.ts` | número e nome do modelo | número e nome do cliente |
| `package.json` | `site-dentista-template` | nome do projeto do cliente |
| `index.html` e `public/robots.txt` | `noindex` e `Disallow: /`, para a demonstração não aparecer no Google | tirar os dois quando o site do cliente for ao ar no domínio definitivo |

Os vídeos do topo e da seção "Como funciona" e as imagens de apoio dos tratamentos não identificam ninguém e podem ficar, ou ser trocados pelos do cliente (veja o README).

Depois de trocar, rode `npm test` e `npm run test:e2e`, e confira as capturas em `test-results/`. Antes de publicar, `FECHAMENTO=1 npm run test:e2e` falha se sobrar algum `[[preencher`.

## Fotos de banco de imagens

Todas vêm do Unsplash, cuja licença permite uso comercial sem atribuição obrigatória (lista em `docs/creditos.md`). Mesmo assim, são pessoas reais: no site do cliente, troque por fotos dele e dos pacientes dele. No scrub do dentista havia um nome bordado, que foi apagado da foto para não identificar a pessoa.
