import { gsap } from "gsap";

/** Tempo para ir de um quadro a outro: proporcional à distância, com mínimo de 0,9 s. */
export function travelDuration(from: number, to: number, frameCount: number, fullDuration: number): number {
  const d = Math.abs(to - from);
  if (d === 0) return 0;
  return Math.max(0.9, (d / (frameCount - 1)) * fullDuration);
}

/** Próxima etapa da alternância automática: depois da última volta para a primeira. */
export function nextStep(current: number, count: number): number {
  return (current + 1) % count;
}

type Options = {
  root: HTMLElement;
  /** quadro de cada etapa, na mesma ordem dos [data-step] */
  frames: number[];
  frameCount: number;
  /** tempo para percorrer o vídeo inteiro */
  fullDuration: number;
  /** move o desenho para uma posição em quadros; sem ele (movimento reduzido) só troca as imagens */
  setPos?: (pos: number) => void;
  /** alternância automática: segundos parado em cada etapa e segundos de pausa depois de um clique */
  autoplay?: { hold: number; afterClick: number };
};

/**
 * Etapas clicáveis. Escolher uma etapa anima a forma do quadro atual até o quadro da etapa,
 * para a frente ou para trás, passando por toda a transformação no caminho.
 * As imagens [data-still] ficam por baixo e servem enquanto os quadros não chegam
 * e no movimento reduzido.
 * Com autoplay, as etapas se alternam sozinhas enquanto a seção está na tela. O tempo de espera
 * conta a partir da chegada na etapa, e um clique troca a espera curta pela pausa longa.
 */
export function initSteps(o: Options) {
  const items = [...o.root.querySelectorAll<HTMLElement>("[data-step]")];
  const stills = [...o.root.querySelectorAll<HTMLElement>("[data-still]")];
  const state = { pos: o.frames[0] };
  let tween: gsap.core.Tween | undefined;

  const mark = (to: number) => {
    items.forEach((el, i) => {
      el.classList.toggle("is-active", i === to);
      el.querySelector("button")?.setAttribute("aria-pressed", String(i === to));
    });
    stills.forEach((img, i) => img.classList.toggle("is-shown", i === to));
  };

  let current = 0;
  let timer: number | undefined;
  let wait = o.autoplay?.hold ?? 0;
  let visible = false;

  const schedule = (seconds: number) => {
    wait = seconds;
    clearTimeout(timer);
    timer = undefined;
    if (!o.autoplay || !visible || document.hidden || o.root.classList.contains("is-moving")) return;
    timer = window.setTimeout(() => go(nextStep(current, items.length), false), seconds * 1000);
  };

  const go = (to: number, byUser: boolean) => {
    current = to;
    mark(to);
    clearTimeout(timer);
    const after = byUser ? (o.autoplay?.afterClick ?? 0) : (o.autoplay?.hold ?? 0);
    if (!o.setPos) return;
    tween?.kill();
    const target = o.frames[to];
    const duration = travelDuration(state.pos, target, o.frameCount, o.fullDuration);
    o.root.classList.toggle("is-moving", duration > 0);
    if (duration === 0) {
      schedule(after);
      return;
    }
    tween = gsap.to(state, {
      pos: target,
      duration,
      ease: "power2.inOut",
      onUpdate: () => o.setPos!(state.pos),
      onComplete: () => {
        o.root.classList.remove("is-moving");
        schedule(after);
      },
    });
  };

  items.forEach((el, i) => el.querySelector("button")?.addEventListener("click", () => go(i, true)));
  mark(0);
  o.setPos?.(state.pos);

  if (o.autoplay) {
    // só alterna com a seção na tela e a aba visível; ao voltar, retoma a espera que estava valendo
    new IntersectionObserver(
      (e) => {
        visible = e.some((x) => x.isIntersecting);
        schedule(wait);
      },
      { threshold: 0.35 },
    ).observe(o.root);
    document.addEventListener("visibilitychange", () => schedule(wait));
  }
  return { go: (to: number) => go(to, true) };
}
