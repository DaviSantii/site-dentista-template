import { describe, it, expect } from "vitest";
import {
  coverRect,
  widthRect,
  loadOrder,
  nearestLoaded,
  frameSrc,
  approach,
  blendPair,
} from "../../src/sequence";
import { beatState } from "../../src/beats";

describe("sequência do topo", () => {
  it("cobre a área sem distorcer e respeita o foco", () => {
    const r = coverRect(1920, 1080, 1000, 1000);
    expect(r.h).toBeCloseTo(1000);
    expect(r.w / r.h).toBeCloseTo(1920 / 1080);
    expect(coverRect(1920, 1080, 1000, 1000, 1).x + r.w).toBeCloseTo(1000);
  });

  it("encaixa pela largura no celular", () => {
    const r = widthRect(632, 712, 390, 844, 0.1);
    expect(r.w).toBe(390);
    expect(r.y).toBeCloseTo((844 - r.h) * 0.1);
  });

  it("carrega todos os quadros uma vez, começando pelas pontas", () => {
    const o = loadOrder(190);
    expect(o.slice(0, 2)).toEqual([0, 189]);
    expect(new Set(o).size).toBe(190);
  });

  it("usa o vizinho carregado mais próximo", () => {
    expect(nearestLoaded(3, [undefined, "a", undefined, undefined, "b"])).toBe("b");
  });

  it("monta o caminho do quadro a partir de 0001", () => {
    expect(frameSrc("brilho", "mobile", 189)).toBe("/frames/brilho/mobile/0190.webp");
  });
});

describe("suavização da rolagem", () => {
  it("anda uma fração do caminho a cada quadro da tela, sem passar do alvo", () => {
    const next = approach(0, 100, 1 / 60, 0.12);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(100);
  });

  it("um salto grande de rolagem vira movimento contínuo, não pulo", () => {
    // 100 quadros de distância: no primeiro quadro da tela anda bem menos que a metade
    expect(approach(0, 100, 1 / 60, 0.12)).toBeLessThan(20);
  });

  it("encosta no alvo quando falta muito pouco", () => {
    expect(approach(99.995, 100, 1 / 60, 0.12)).toBe(100);
  });

  it("tempo maior entre quadros da tela anda mais, para não ficar para trás em telas lentas", () => {
    expect(approach(0, 100, 1 / 30, 0.12)).toBeGreaterThan(approach(0, 100, 1 / 60, 0.12));
  });

  it("mistura os dois quadros vizinhos pela parte fracionária", () => {
    expect(blendPair(10.25, 190)).toEqual({ a: 10, b: 11, t: 0.25 });
    expect(blendPair(0, 190)).toEqual({ a: 0, b: 1, t: 0 });
    expect(blendPair(189, 190)).toEqual({ a: 189, b: 189, t: 0 });
    expect(blendPair(250, 190)).toEqual({ a: 189, b: 189, t: 0 });
  });
});

describe("frases do topo", () => {
  it("fica visível dentro do intervalo e some fora", () => {
    expect(beatState(0.3, 0.2, 0.4).opacity).toBe(1);
    expect(beatState(0.9, 0.2, 0.4).opacity).toBe(0);
  });

  it("entra de forma gradual", () => {
    const s = beatState(0.18, 0.2, 0.4);
    expect(s.opacity).toBeGreaterThan(0);
    expect(s.opacity).toBeLessThan(1);
  });

  it("a primeira frase já aparece inteira no topo da página e a última fica até o fim", () => {
    expect(beatState(0, 0, 0.12).opacity).toBe(1);
    expect(beatState(1, 0.82, 1.2).opacity).toBe(1);
  });
});
