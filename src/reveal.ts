import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initReveals(reduce: boolean) {
  if (reduce) return;

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
