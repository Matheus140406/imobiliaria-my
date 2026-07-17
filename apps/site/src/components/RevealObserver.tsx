"use client";

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    function observarNovos(raiz: ParentNode) {
      raiz.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
    }

    observarNovos(document);

    // Conteúdo filtrado no cliente (ex: as abas Todos/Disponível/Indisponível
    // de Imóveis) remonta os cards com `key` novo a cada troca de aba, criando
    // elementos ".reveal" que o querySelectorAll inicial nunca viu. Sem
    // observá-los de novo, eles ficam presos em opacity:0 pra sempre — é
    // exatamente por isso que os cards "sumiam" ao trocar de aba.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal:not(.visible)")) observer.observe(node);
          observarNovos(node);
        });
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
