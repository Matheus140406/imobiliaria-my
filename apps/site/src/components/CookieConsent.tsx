"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CHAVE_CONSENTIMENTO = "my-imobiliaria:cookie-consent";

export function CookieConsent() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Só decide mostrar depois de montar: ler localStorage no server (ou
    // no primeiro render do cliente antes da hidratação) causaria um
    // mismatch de hidratação entre servidor e navegador.
    const jaDecidiu = window.localStorage.getItem(CHAVE_CONSENTIMENTO);
    if (!jaDecidiu) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisivel(true);
    }
  }, []);

  function decidir(valor: "aceito" | "recusado") {
    window.localStorage.setItem(CHAVE_CONSENTIMENTO, valor);
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Aviso de cookies">
      <p>
        Usamos cookies essenciais e de análise para melhorar sua experiência,
        conforme nossa{" "}
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
      </p>
      <div className="cookie-banner-actions">
        <button type="button" onClick={() => decidir("recusado")} className="cookie-btn-ghost">
          Recusar
        </button>
        <button type="button" onClick={() => decidir("aceito")} className="cookie-btn-solid">
          Aceitar
        </button>
      </div>
    </div>
  );
}
