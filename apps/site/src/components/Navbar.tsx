"use client";

import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <a href="#inicio" className="nav-logo">
        <div className="nav-logo-badge">M&amp;Y</div>
        <span className="nav-logo-text">
          Imobiliária <span>M&amp;Y</span>
        </span>
      </a>
      <ul className="nav-links">
        <li>
          <a href="#sobre">Sobre</a>
        </li>
        <li>
          <a href="#servicos">Serviços</a>
        </li>
        <li>
          <a href="#imoveis">Imóveis</a>
        </li>
        <li>
          <a href="#contato" className="nav-cta">
            Fale Conosco
          </a>
        </li>
      </ul>
    </nav>
  );
}
