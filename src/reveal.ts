import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Separa o texto em palavras (spans .w) para a revelação palavra por palavra. */
export function splitWords(el: HTMLElement) {
  const words = (el.textContent ?? "").trim().split(/\s+/);
  el.textContent = "";
  // o texto inteiro fica para leitores de tela; as palavras soltas são só visuais
  const full = document.createElement("span");
  full.className = "sr-only";
  full.textContent = words.join(" ");
  el.append(full);
  for (const [i, w] of words.entries()) {
    const span = document.createElement("span");
    span.className = "w";
    span.setAttribute("aria-hidden", "true");
    span.textContent = w;
    el.append(span);
    if (i < words.length - 1) el.append(" ");
  }
  return [...el.querySelectorAll<HTMLElement>(".w")];
}

export function initReveals(reduce: boolean) {
  const manifesto = document.querySelector<HTMLElement>("[data-words]");
  const words = manifesto ? splitWords(manifesto) : [];

  if (reduce) return;

  if (manifesto) {
    gsap.to(words, {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: { trigger: manifesto, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }

  for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  }

  for (const img of gsap.utils.toArray<HTMLElement>("[data-parallax]")) {
    gsap.fromTo(
      img,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: img.closest("section"), start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  }

  const topbar = document.querySelector<HTMLElement>("[data-topbar]");
  const hero = document.querySelector<HTMLElement>("#topo");
  if (topbar && hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: "bottom 80px",
      onEnter: () => topbar.classList.add("is-solid"),
      onLeaveBack: () => topbar.classList.remove("is-solid"),
    });
  }
}
