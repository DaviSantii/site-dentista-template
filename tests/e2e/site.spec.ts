import { test, expect, type Page } from "@playwright/test";

async function canvasPintado(page: Page, seletor: string) {
  return page.evaluate((sel) => {
    const c = document.querySelector<HTMLCanvasElement>(sel)!;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let soma = 0;
    for (let i = 0; i < d.length; i += 4 * 97) soma += d[i] + d[i + 1] + d[i + 2];
    return soma > 0;
  }, seletor);
}

test("topo segue a rolagem e o botão do fim é clicável", async ({ page }, info) => {
  const erros: string[] = [];
  page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
  page.on("pageerror", (e) => erros.push(e.message));

  // o link abre numa aba nova; responde localmente para o teste não sair para a internet
  await page.context().route(/wa\.me|whatsapp\.com/, (r) => r.fulfill({ body: "ok" }));
  await page.goto("/");
  const hero = page.locator("#topo");
  await expect(hero).toHaveClass(/is-ready/, { timeout: 15000 });
  await expect(page.locator("#topo h1")).toBeVisible();
  await page.waitForTimeout(400);
  expect(await canvasPintado(page, ".hero__canvas")).toBe(true);

  const altura = await page.evaluate(() => document.querySelector<HTMLElement>("#topo")!.offsetHeight);
  const tela = await page.evaluate(() => window.innerHeight);
  for (const f of [0, 0.25, 0.47, 0.7]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((altura - tela) * f));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `test-results/hero-${info.project.name}-${Math.round(f * 100)}.png` });
  }

  // no fim da rolagem do topo, o botão do WhatsApp está à vista e recebe o clique
  await page.evaluate((y) => window.scrollTo(0, y), altura - tela);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `test-results/hero-${info.project.name}-100.png` });
  const cta = page.locator("#topo .beat--cta a");
  await expect(cta).toBeVisible();
  const [popup] = await Promise.all([page.context().waitForEvent("page", { timeout: 5000 }), cta.click({ noWaitAfter: true })]);
  expect(popup.url()).toContain("wa.me");
  await popup.close();

  expect(erros).toEqual([]);
});

test("a imagem acompanha a rolagem suavizada, sem pular para o fim", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#topo")).toHaveClass(/is-ready/, { timeout: 15000 });
  const altura = await page.evaluate(() => document.querySelector<HTMLElement>("#topo")!.offsetHeight);
  // um salto grande de rolagem: logo depois a frase final ainda não pode estar inteira
  await page.evaluate((y) => window.scrollTo(0, y), altura);
  await page.waitForTimeout(50);
  const cedo = await page.locator("#topo .beat--cta").evaluate((el) => Number(getComputedStyle(el).opacity));
  await page.waitForTimeout(1500);
  const depois = await page.locator("#topo .beat--cta").evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(cedo).toBeLessThan(1);
  expect(depois).toBe(1);
});

test("etapas animam a forma até o quadro de cada uma, nos dois sentidos", async ({ page }, info) => {
  await page.goto("/");
  const sec = page.locator("#processo");
  await page.evaluate(() => document.querySelector("#processo")!.scrollIntoView());
  await expect(sec).toHaveClass(/is-ready/, { timeout: 20000 });
  const steps = sec.locator("[data-step]");
  // um clique segura a alternância automática por 8 s, tempo de sobra para cada passo do teste
  await steps.nth(0).click();
  await expect(sec).not.toHaveClass(/is-moving/, { timeout: 8000 });
  // espera os quadros terminarem de baixar para a animação passar por todos
  await page.waitForTimeout(2500);
  await expect(sec.locator("video")).toHaveCount(0);
  expect(await canvasPintado(page, ".process__canvas")).toBe(true);
  await expect(steps.nth(0)).toHaveClass(/is-active/);
  await page.screenshot({ path: `test-results/processo-${info.project.name}-1.png` });

  // amostra do canvas para comparar quadros
  const assinatura = () =>
    page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>(".process__canvas")!;
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      let soma = 0;
      for (let i = 0; i < d.length; i += 4 * 211) soma += d[i] * 3 + d[i + 1] * 5 + d[i + 2] * 7;
      return soma;
    });
  const inicio = await assinatura();

  // 1 para 3: anima pelo caminho todo (passa por imagens diferentes do início e do fim)
  await steps.nth(2).click();
  await expect(sec).toHaveClass(/is-moving/);
  await page.waitForTimeout(1100);
  const meioDoCaminho = await assinatura();
  await expect(sec).not.toHaveClass(/is-moving/, { timeout: 8000 });
  await page.waitForTimeout(200);
  const fim = await assinatura();
  expect(meioDoCaminho).not.toBe(inicio);
  expect(meioDoCaminho).not.toBe(fim);
  await page.screenshot({ path: `test-results/processo-${info.project.name}-3.png` });

  // 3 para 2: volta animando até o quadro perolado
  await steps.nth(1).click();
  await expect(sec).toHaveClass(/is-moving/);
  await expect(sec).not.toHaveClass(/is-moving/, { timeout: 8000 });
  await page.waitForTimeout(200);
  const dois = await assinatura();
  expect(dois).not.toBe(fim);
  await page.screenshot({ path: `test-results/processo-${info.project.name}-2.png` });

  // 2 para 1: volta animando até o início, e para exatamente no mesmo quadro
  await steps.nth(0).click();
  await expect(sec).toHaveClass(/is-moving/);
  await expect(sec).not.toHaveClass(/is-moving/, { timeout: 8000 });
  await page.waitForTimeout(200);
  expect(await assinatura()).toBe(inicio);
  await expect(steps.nth(0).locator("button")).toHaveAttribute("aria-pressed", "true");
});

test("etapas se alternam sozinhas e esperam 8 s depois de um clique", async ({ page }) => {
  await page.goto("/");
  const sec = page.locator("#processo");
  await page.evaluate(() => document.querySelector("#processo")!.scrollIntoView());
  await expect(sec).toHaveClass(/is-ready/, { timeout: 20000 });
  const steps = sec.locator("[data-step]");

  // sem clique: depois de 2 s parada, vai para a etapa seguinte
  await expect(steps.nth(1)).toHaveClass(/is-active/, { timeout: 6000 });
  await expect(sec).not.toHaveClass(/is-moving/, { timeout: 8000 });
  await expect(steps.nth(2)).toHaveClass(/is-active/, { timeout: 5000 });

  // com clique: fica parada na etapa escolhida por 8 s depois de chegar, e então retoma
  await steps.nth(0).click();
  await expect(sec).not.toHaveClass(/is-moving/, { timeout: 8000 });
  const chegada = Date.now();
  await page.waitForTimeout(6500);
  await expect(steps.nth(0)).toHaveClass(/is-active/);
  await expect(sec).not.toHaveClass(/is-moving/);
  await expect(steps.nth(1)).toHaveClass(/is-active/, { timeout: 4000 });
  expect(Date.now() - chegada).toBeGreaterThan(7500);
});

test("página inteira para conferência", async ({ page }, info) => {
  await page.goto("/");
  // desce aos poucos para disparar as entradas animadas
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
  for (const sec of ["#tratamentos", "#resultados", "#sobre", ".voices", "#unidades", ".final", ".footer"]) {
    await page.locator(sec).first().screenshot({ path: `test-results/secao-${info.project.name}-${sec.replace(/\W/g, "")}.png` });
  }
});

test("com movimento reduzido mostra frases e troca etapas sem animação", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:4174/");
  await expect(page.locator(".hero__poster")).toBeVisible();
  await expect(page.locator(".beat").last()).toHaveCSS("opacity", "1");
  await page.locator("#processo [data-step]").nth(1).click();
  await expect(page.locator("#processo [data-still]").nth(1)).toHaveCSS("opacity", "1");
  await ctx.close();
});

test("todos os CTAs e links externos têm destino válido", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator("a[data-cta]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(3);
  for (const h of hrefs) {
    expect(h).toMatch(/^https:\/\/wa\.me\/5500000000000\?text=/);
    expect(decodeURIComponent(h!.split("text=")[1])).toMatch(/^(Bom dia|Boa tarde|Boa noite), Dr\. Rafael! Gostaria de agendar uma avaliação\.$/);
  }

  const internos = await page.locator('a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
  for (const h of internos) {
    if (h === "#") continue;
    expect(await page.locator(h).count(), `âncora ${h}`).toBe(1);
  }
  await expect(page.locator("h1")).toHaveCount(1);
});

test("sem marcadores [[preencher]] na página", async ({ page }) => {
  test.skip(!process.env.FECHAMENTO, "só roda no fechamento, com FECHAMENTO=1, depois que o cliente mandar os dados");
  await page.goto("/");
  const html = await page.content();
  expect(html).not.toContain("[[preencher");
});
