"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type { TunnelItem } from "./types";

const TunnelSceneClient = dynamic(
  () => import("./TunnelSceneClient").then((m) => m.TunnelSceneClient),
  { ssr: false },
);

const VH_PER_ITEM = 100;
const MIN_TRACK_VH = 250;

export function TunnelScene({ items }: { items: TunnelItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const trackHeightVh = Math.max(MIN_TRACK_VH, items.length * VH_PER_ITEM);

  return (
    <div className="tunnel3d-wrap">
      <div className="tunnel3d-header reveal">
        <span className="section-badge" style={{ color: "var(--gold)" }}>
          Nossos Imóveis
        </span>
        <h2 className="section-title">
          Voe pelo
          <br />
          <em>túnel dos imóveis</em>
        </h2>
        <p className="section-text">
          Role a página para navegar em 3D pelos imóveis da Imobiliária
          M&amp;Y. Clique em qualquer foto para falar com o corretor.
        </p>
      </div>

      <div ref={trackRef} className="tunnel3d-track" style={{ height: `${trackHeightVh}vh` }}>
        <div className="tunnel3d-stage">
          <TunnelSceneClient items={items} trackRef={trackRef} />
        </div>
      </div>
    </div>
  );
}
