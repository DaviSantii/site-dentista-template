import { gsap } from "gsap";

/** Tempo para ir de um quadro a outro: proporcional à distância, com mínimo de 0,9 s. */
export function travelDuration(from: number, to: number, frameCount: number, fullDuration: number): number {
  const d = Math.abs(to - from);
  if (d === 0) return 0;
  return Math.max(0.9, (d / (frameCount - 1)) * fullDuration);
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
};

/**
 * Etapas clicáveis. Escolher uma etapa anima a forma do quadro atual até o quadro da etapa,
 * para a frente ou para trás, passando por toda a transformação no caminho.
 * As imagens [data-still] ficam por baixo e servem enquanto os quadros não chegam
 * e no movimento reduzido.
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

  const go = (to: number) => {
    mark(to);
    if (!o.setPos) return;
    tween?.kill();
    const target = o.frames[to];
    const duration = travelDuration(state.pos, target, o.frameCount, o.fullDuration);
    o.root.classList.toggle("is-moving", duration > 0);
    tween = gsap.to(state, {
      pos: target,
      duration,
      ease: "power2.inOut",
      onUpdate: () => o.setPos!(state.pos),
      onComplete: () => o.root.classList.remove("is-moving"),
    });
  };

  items.forEach((el, i) => el.querySelector("button")?.addEventListener("click", () => go(i)));
  mark(0);
  o.setPos?.(state.pos);
  return { go };
}
