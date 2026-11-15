import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScrollSequence, createFramePlayer, frameSrc } from "./sequence";
import { applyBeats } from "./beats";
import { initSteps } from "./steps";
import { initReveals } from "./reveal";
import { initWhatsApp } from "./whatsapp";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileQuery = matchMedia("(max-width: 900px)");
// a variante dos arquivos é escolhida no carregamento; o modo de desenho acompanha a largura atual
const variant = mobileQuery.matches ? "mobile" : "desktop";

// igual ao número de quadros usado em scripts/extrair-quadros.sh (todos os quadros do vídeo)
const FRAMES_BRILHO = 190;
const FRAMES_FORMA = 190;
// quadro de cada etapa no vídeo "forma": início, o ponto perolado de 3,875 s e o fim
const QUADROS_ETAPAS = [0, 93, 189];
// cor do fundo do vídeo no celular, usada em volta do quadro (igual a --video-mobile)
const FILL_MOBILE = "#a99f93";

const hero = document.querySelector<HTMLElement>("#topo")!;
const heroBeats = [...hero.querySelectorAll<HTMLElement>(".beat")];
const process = document.querySelector<HTMLElement>("#processo")!;

// os quadros só começam a baixar depois do load, para não disputar banda com o pôster e as fontes
const pageLoaded = new Promise<void>((r) =>
  document.readyState === "complete" ? r() : addEventListener("load", () => r(), { once: true }),
);
let topoPronto: Promise<unknown> = new Promise(() => {});
if (reduce) {
  heroBeats.forEach((b) => (b.style.opacity = "1"));
} else {
  topoPronto = initScrollSequence({
    canvas: hero.querySelector("canvas")!,
    section: hero,
    frameCount: FRAMES_BRILHO,
    src: (i) => frameSrc("brilho", variant, i),
    mode: () => (mobileQuery.matches ? "width" : "cover"),
    focusX: 0.5,
    anchorY: 0.1,
    fill: FILL_MOBILE,
    startAfter: pageLoaded,
    onFirstFrame: () => hero.classList.add("is-ready"),
    onRender: (p) => {
      applyBeats(p, heroBeats);
      hero.classList.toggle("is-scrolled", p > 0.02);
    },
  }).done;
  applyBeats(0, heroBeats);
}

// etapas: os quadros do vídeo "forma" baixam quando os do topo terminam ou quando a seção chega perto
const pertoDasEtapas = new Promise<void>((r) => {
  const io = new IntersectionObserver(
    (e) => {
      if (e.some((x) => x.isIntersecting)) {
        io.disconnect();
        r();
      }
    },
    { rootMargin: "600px 0px" },
  );
  io.observe(process);
});
const etapas = reduce
  ? undefined
  : createFramePlayer({
      canvas: process.querySelector("canvas")!,
      frameCount: FRAMES_FORMA,
      src: (i) => frameSrc("forma", variant, i),
      mode: () => "cover",
      focusX: variant === "mobile" ? 0.5 : 0.92,
      startAfter: Promise.race([pertoDasEtapas, pageLoaded.then(() => topoPronto)]),
      onFirstFrame: () => process.classList.add("is-ready"),
    });
initSteps({
  root: process,
  frames: QUADROS_ETAPAS,
  frameCount: FRAMES_FORMA,
  fullDuration: 4.5,
  setPos: etapas?.setPos,
  // sem movimento reduzido: troca de etapa a cada 2 s e espera 8 s depois de um clique
  autoplay: reduce ? undefined : { hold: 2, afterClick: 8 },
});

// botões de WhatsApp chegam com a mensagem pronta e o cumprimento da hora
initWhatsApp("5500000000000", "Dr. Rafael");

initReveals(reduce);
// as fontes chegam sem bloquear a pintura, então recalcula as posições quando elas e a página terminam de carregar
document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener("load", () => document.fonts.ready.then(() => ScrollTrigger.refresh()));
