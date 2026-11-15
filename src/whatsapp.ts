export function saudacao(hora: number): string {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function mensagem(cumprimento: string, quem: string): string {
  return `${cumprimento}, ${quem}! Gostaria de agendar uma avaliação.`;
}

export function linkWhatsApp(numero: string, texto: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/**
 * Atualiza todos os links [data-cta] com a mensagem pronta e o cumprimento da hora.
 * O HTML já traz o link com "Olá", que vale se o JS não rodar; aqui ele ganha o
 * cumprimento certo, e é recalculado no clique para quem deixa a página aberta.
 */
export function initWhatsApp(numero: string, quem: string) {
  const atualizar = () => {
    const href = linkWhatsApp(numero, mensagem(saudacao(new Date().getHours()), quem));
    document.querySelectorAll<HTMLAnchorElement>("a[data-cta]").forEach((a) => (a.href = href));
  };
  atualizar();
  document.addEventListener("pointerdown", (e) => {
    if ((e.target as Element).closest?.("a[data-cta]")) atualizar();
  });
}
