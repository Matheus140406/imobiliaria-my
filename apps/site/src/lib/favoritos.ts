"use client";

import { useEffect, useState } from "react";

const CHAVE_FAVORITOS = "my-imobiliaria:favoritos";
const EVENTO_FAVORITOS = "my-imobiliaria:favoritos-mudou";

function lerFavoritos(): string[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE_FAVORITOS);
    return bruto ? (JSON.parse(bruto) as string[]) : [];
  } catch {
    return [];
  }
}

function gravarFavoritos(lista: string[]) {
  window.localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
  window.dispatchEvent(new CustomEvent(EVENTO_FAVORITOS));
}

export function useListaDeFavoritos(): string[] {
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    // Ler localStorage só depois de montar evita mismatch de hidratação
    // entre servidor e navegador (mesmo padrão do CookieConsent).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoritos(lerFavoritos());

    function sincronizar() {
      setFavoritos(lerFavoritos());
    }

    window.addEventListener(EVENTO_FAVORITOS, sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener(EVENTO_FAVORITOS, sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  return favoritos;
}

export function useFavorito(imovelId: string) {
  const favoritos = useListaDeFavoritos();
  const favorito = favoritos.includes(imovelId);

  function alternar() {
    const atual = lerFavoritos();
    const proximo = atual.includes(imovelId)
      ? atual.filter((id) => id !== imovelId)
      : [...atual, imovelId];
    gravarFavoritos(proximo);
  }

  return { favorito, alternar };
}
