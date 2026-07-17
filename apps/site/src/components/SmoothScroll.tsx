"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Scroll com inércia/easing (em vez do scroll "seco" nativo do navegador).
 * Só a rolagem por mouse/touch/teclado ganha suavidade — não interfere em
 * scroll interno de modais (Lenis anima o scroll da janela, não elementos
 * com overflow próprio). Desativado inteiramente se o usuário pedir menos
 * movimento no sistema.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduzMovimento) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.4,
      anchors: true,
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return null;
}
