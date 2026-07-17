"use client";

import { useEffect, useRef } from "react";
import { WhatsappIcon } from "./WhatsappIcon";

/**
 * Mesma técnica da HeroParallaxBg (transform via rAF, sem lib) — mantém o
 * bundle leve e evita o "background-attachment: fixed" que quebra no
 * Safari mobile.
 */
export function ChavesParallax({
  whatsappUrl,
}: {
  whatsappUrl?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const secaoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const secao = secaoRef.current;
    if (!el || !secao) return;

    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduzMovimento) return;

    let frameId: number;
    function onScroll() {
      frameId = requestAnimationFrame(() => {
        if (!el || !secao) return;
        const rect = secao.getBoundingClientRect();
        const centro = rect.top + rect.height / 2 - window.innerHeight / 2;
        const deslocamento = Math.max(-60, Math.min(60, centro * -0.12));
        el.style.transform = `translateY(${deslocamento}px) scale(1.15)`;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section className="chaves-parallax" ref={secaoRef} aria-label="Sua conquista">
      <div
        ref={ref}
        className="chaves-parallax-bg"
        style={{ backgroundImage: "url(/chave-conquista.png)" }}
      />
      <div className="chaves-parallax-overlay" />
      <div className="chaves-parallax-content reveal">
        <span className="section-badge chaves-parallax-badge">Sua conquista</span>
        <h2 className="section-title chaves-parallax-title">
          A chave da sua <em>nova história</em> está mais perto do que
          você imagina
        </h2>
        <p className="section-text chaves-parallax-text">
          Do primeiro contato à assinatura do contrato, cuidamos de cada
          detalhe para que esse momento seja simples, seguro e
          inesquecível — como deve ser.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            className="btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappIcon />
            Quero minha chave
          </a>
        )}
      </div>
    </section>
  );
}
