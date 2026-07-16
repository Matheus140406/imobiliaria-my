"use client";

import { useEffect, useRef } from "react";

// Parallax deliberadamente simples: só um translateY proporcional ao
// scroll, direto via rAF sem nenhuma lib (Framer Motion/GSAP pesariam no
// bundle de uma seção que aparece em toda visita — o pedido de performance
// 95+ no Lighthouse pesa mais aqui do que a sofisticação da lib).
export function HeroParallaxBg({
  imageUrl,
}: {
  imageUrl?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduzMovimento) return;

    let frameId: number;
    function onScroll() {
      frameId = requestAnimationFrame(() => {
        if (!el) return;
        const deslocamento = Math.min(window.scrollY * 0.25, 120);
        el.style.transform = `translateY(${deslocamento}px) scale(1.08)`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="hero-bg"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    />
  );
}
