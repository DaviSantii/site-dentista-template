import { describe, it, expect } from "vitest";
import { saudacao, mensagem, linkWhatsApp } from "../../src/whatsapp";

describe("mensagem do WhatsApp", () => {
  it("cumprimenta conforme a hora", () => {
    expect(saudacao(5)).toBe("Bom dia");
    expect(saudacao(11)).toBe("Bom dia");
    expect(saudacao(12)).toBe("Boa tarde");
    expect(saudacao(17)).toBe("Boa tarde");
    expect(saudacao(18)).toBe("Boa noite");
    expect(saudacao(2)).toBe("Boa noite");
  });

  it("monta a mensagem com o nome de quem atende", () => {
    expect(mensagem("Boa tarde", "Dr. Rafael")).toBe("Boa tarde, Dr. Rafael! Gostaria de agendar uma avaliação.");
  });

  it("gera o link com o texto codificado", () => {
    expect(linkWhatsApp("5500000000000", "Olá, Dr. Rafael! Gostaria de agendar uma avaliação.")).toBe(
      "https://wa.me/5500000000000?text=Ol%C3%A1%2C%20Dr.%20Rafael!%20Gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o.",
    );
  });
});
