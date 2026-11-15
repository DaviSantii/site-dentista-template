import { describe, it, expect } from "vitest";
import { travelDuration } from "../../src/steps";

describe("animação entre etapas", () => {
  it("percorrer o vídeo inteiro leva o tempo cheio, nos dois sentidos", () => {
    expect(travelDuration(0, 189, 190, 2.4)).toBeCloseTo(2.4);
    expect(travelDuration(189, 0, 190, 2.4)).toBeCloseTo(2.4);
  });

  it("metade do caminho leva metade do tempo", () => {
    expect(travelDuration(0, 94.5, 190, 2.4)).toBeCloseTo(1.2);
  });

  it("trechos curtos não ficam bruscos", () => {
    expect(travelDuration(90, 93, 190, 2.4)).toBe(0.9);
  });

  it("sem distância, sem animação", () => {
    expect(travelDuration(93, 93, 190, 2.4)).toBe(0);
  });
});
