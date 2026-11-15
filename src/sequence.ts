import { ScrollTrigger } from "gsap/ScrollTrigger";

export type Rect = { x: number; y: number; w: number; h: number };

/** Preenche a caixa inteira, cortando o excesso. focusX escolhe que parte da largura fica visível. */
export function coverRect(imgW: number, imgH: number, boxW: number, boxH: number, focusX = 0.5): Rect {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: (boxW - w) * focusX, y: (boxH - h) / 2, w, h };
}

/** Encaixa pela largura (celular, texto abaixo da imagem). anchorY: 0 cola no topo, 1 na base. */
export function widthRect(imgW: number, imgH: number, boxW: number, boxH: number, anchorY = 0): Rect {
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: (boxW - w) / 2, y: (boxH - h) * anchorY, w, h };
}

/** Ordem de download: as duas pontas, depois passos de 16, 8, 4, 2 e 1. */
export function loadOrder(n: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  const push = (i: number) => {
    if (i >= 0 && i < n && !seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
  };
  push(0);
  push(n - 1);
  for (let step = 16; step >= 1; step /= 2) {
    for (let i = 0; i < n; i += step) push(i);
  }
  return order;
}

export function nearestLoaded<T>(index: number, frames: (T | undefined)[]): T | undefined {
  for (let d = 0; d < frames.length; d++) {
    if (frames[index - d]) return frames[index - d];
    if (frames[index + d]) return frames[index + d];
  }
  return undefined;
}

export function frameSrc(name: string, variant: "desktop" | "mobile", i: number): string {
  return `/frames/${name}/${variant}/${String(i + 1).padStart(4, "0")}.webp`;
}

/**
 * Aproxima o valor atual do alvo de forma exponencial, independente da taxa de quadros da tela.
 * tau é o tempo (s) para cobrir cerca de 63% da distância. Encosta no alvo quando falta menos de 0,01.
 */
export function approach(current: number, target: number, dt: number, tau: number): number {
  const next = current + (target - current) * (1 - Math.exp(-dt / tau));
  return Math.abs(target - next) < 0.01 ? target : next;
}

/** Quadros vizinhos a misturar para uma posição fracionária: desenha a, depois b com opacidade t. */
export function blendPair(pos: number, frameCount: number) {
  const p = Math.min(frameCount - 1, Math.max(0, pos));
  const a = Math.floor(p);
  const b = Math.min(a + 1, frameCount - 1);
  return { a, b, t: b === a ? 0 : Math.round((p - a) * 1000) / 1000 };
}

type PlayerOptions = {
  canvas: HTMLCanvasElement;
  frameCount: number;
  src: (i: number) => string;
  /** "cover" preenche o canvas; "width" encaixa pela largura e pinta o resto com fill */
  mode: () => "cover" | "width";
  focusX?: number;
  anchorY?: number;
  fill?: string;
  startAfter?: Promise<unknown>;
  onFirstFrame?: () => void;
};

/**
 * Desenha quadros num canvas a partir de uma posição fracionária, misturando os dois
 * quadros vizinhos. Quem decide a posição (rolagem, clique) fica fora daqui.
 */
export function createFramePlayer(o: PlayerOptions) {
  const ctx = o.canvas.getContext("2d", { alpha: false })!;
  const frames: (ImageBitmap | undefined)[] = new Array(o.frameCount);
  const fill = o.fill ?? "#000";
  let pos = 0;
  let queued = false;

  const placement = (f: ImageBitmap) => {
    const { width: cw, height: ch } = o.canvas;
    return o.mode() === "cover"
      ? coverRect(f.width, f.height, cw, ch, o.focusX ?? 0.5)
      : widthRect(f.width, f.height, cw, ch, o.anchorY ?? 0);
  };

  const draw = () => {
    queued = false;
    const { a, b, t } = blendPair(pos, o.frameCount);
    const fa = frames[a] ?? nearestLoaded(a, frames);
    if (!fa) return;
    const { width: cw, height: ch } = o.canvas;
    const r = placement(fa);
    if (o.mode() === "width") {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, cw, ch);
      // estica a primeira e a última linha do quadro até as bordas, para o fundo continuar sem emenda
      const sx = (r.x / r.w) * -fa.width;
      const sw = (cw / r.w) * fa.width;
      if (r.y > 0) ctx.drawImage(fa, sx, 2, sw, 1, 0, 0, cw, r.y + 1);
      const below = ch - (r.y + r.h);
      if (below > 0) ctx.drawImage(fa, sx, fa.height - 3, sw, 1, 0, r.y + r.h - 1, cw, below + 1);
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(fa, r.x, r.y, r.w, r.h);
    const fb = frames[b];
    if (t > 0 && fb) {
      ctx.globalAlpha = t;
      ctx.drawImage(fb, r.x, r.y, r.w, r.h);
      ctx.globalAlpha = 1;
    }
  };
  const requestDraw = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(draw);
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    o.canvas.width = Math.round(o.canvas.clientWidth * dpr);
    o.canvas.height = Math.round(o.canvas.clientHeight * dpr);
    draw();
  };
  new ResizeObserver(resize).observe(o.canvas);

  const queue = loadOrder(o.frameCount);
  let pending = o.frameCount;
  let resolveDone!: () => void;
  const done = new Promise<void>((r) => (resolveDone = r));
  const worker = async () => {
    while (queue.length) {
      const i = queue.shift()!;
      try {
        const res = await fetch(o.src(i));
        if (!res.ok) throw new Error(String(res.status));
        frames[i] = await createImageBitmap(await res.blob());
        if (i === 0) o.onFirstFrame?.();
        if (Math.abs(i - pos) < 3) requestDraw();
      } catch {
        // quadro ausente: o vizinho carregado mais próximo cobre a falha
      }
      if (--pending === 0) resolveDone();
    }
  };
  Promise.resolve(o.startAfter).then(() => {
    for (let k = 0; k < 6; k++) worker();
  });

  return {
    done,
    get pos() {
      return pos;
    },
    /** Posição em quadros (pode ser fracionária). Desenha no próximo quadro da tela. */
    setPos(p: number) {
      p = Math.min(o.frameCount - 1, Math.max(0, p));
      if (p === pos) return;
      pos = p;
      requestDraw();
    },
  };
}

type ScrollOptions = PlayerOptions & {
  /** seção alta cuja rolagem controla o vídeo */
  section: HTMLElement;
  /** tempo de suavização em segundos: quanto maior, mais macio e mais atrasado em relação à rolagem */
  smoothing?: number;
  /** recebe o progresso já suavizado (0 a 1), para o texto andar junto com a imagem */
  onRender?: (p: number) => void;
};

/**
 * Vídeo controlado pela rolagem. A rolagem só define o alvo; um laço próprio leva a
 * posição até ele com suavização, então um giro brusco da roda vira movimento contínuo.
 */
export function initScrollSequence(o: ScrollOptions) {
  const player = createFramePlayer(o);
  const last = o.frameCount - 1;
  const tau = o.smoothing ?? 0.14;
  let pos = 0;
  let target = 0;
  let raf = 0;
  let lastT = 0;

  const loop = (now: number) => {
    const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 1 / 60;
    lastT = now;
    pos = approach(pos, target, dt, tau);
    player.setPos(pos);
    o.onRender?.(pos / last);
    if (pos !== target) raf = requestAnimationFrame(loop);
    else {
      raf = 0;
      lastT = 0;
    }
  };

  ScrollTrigger.create({
    trigger: o.section,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      target = self.progress * last;
      if (!raf) raf = requestAnimationFrame(loop);
    },
  });

  return { done: player.done };
}
