"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { buildTunnelPoints, buildTunnelCurve, TUNNEL_SPACING } from "./curve";
import { TunnelTube } from "./TunnelTube";
import { PropertyPortal } from "./PropertyPortal";
import { CameraRig, type Foco } from "./CameraRig";
import { ContactModal } from "@/components/ContactModal";
import { useIsMobile } from "./useIsMobile";
import type { TunnelItem } from "./types";

export function TunnelSceneClient({
  items,
  trackRef,
}: {
  items: TunnelItem[];
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [progress, setProgress] = useState(0);
  const [modo, setModo] = useState<"scroll" | "zoom">("scroll");
  const [foco, setFoco] = useState<Foco | null>(null);
  const [selecionado, setSelecionado] = useState<TunnelItem | null>(null);
  const isMobile = useIsMobile();

  const points = useMemo(() => buildTunnelPoints(items.length), [items.length]);
  const curve = useMemo(() => buildTunnelCurve(points), [points]);

  const tangents = useMemo(
    () => points.map((_, i) => curve.getTangentAt(i / (points.length - 1))),
    [curve, points],
  );

  const handleSelect = useCallback(
    (item: TunnelItem, position: THREE.Vector3, tangent: THREE.Vector3) => {
      document.body.style.overflow = "hidden";
      setFoco({ item, position: position.clone(), tangent: tangent.clone() });
      setModo("zoom");
    },
    [],
  );

  const handleZoomCompleto = useCallback(() => {
    setFoco((atual) => {
      if (atual) setSelecionado(atual.item);
      return atual;
    });
  }, []);

  const handleFecharModal = useCallback(() => {
    setSelecionado(null);
    setFoco(null);
    setModo("scroll");
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const activeIndex = Math.round(progress * (items.length - 1));

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 300, position: [0, 0, 4] }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
        dpr={isMobile ? 1 : [1, 2]}
      >
        <color attach="background" args={["#0d1a12"]} />
        <fog attach="fog" args={["#0d1a12", 5, TUNNEL_SPACING * 3]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 0, 4]} intensity={8} distance={20} color="#e8d08a" />

        <TunnelTube curve={curve} leve={isMobile} />

        <Suspense fallback={null}>
          {items.map((item, i) => (
            <PropertyPortal
              key={item.id}
              item={item}
              position={points[i]}
              tangent={tangents[i]}
              onSelect={handleSelect}
            />
          ))}
        </Suspense>

        <CameraRig
          trackRef={trackRef}
          curve={curve}
          modo={modo}
          foco={foco}
          onZoomCompleto={handleZoomCompleto}
          onProgress={setProgress}
        />

        {/* Bloom (glow neon) é a parte mais cara pra GPU: no celular, pulamos
            o pós-processamento pra manter 60fps e confiamos no brilho próprio
            dos materiais emissivos das molduras/faixas de neon. */}
        {!isMobile && (
          <EffectComposer>
            <Bloom
              intensity={1.1}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.3}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>

      {modo === "scroll" && (
        <div className="tunnel3d-progress">
          {items[activeIndex] ? items[activeIndex].titulo : ""}
        </div>
      )}

      {selecionado && (
        <ContactModal imovel={selecionado.imovel} onClose={handleFecharModal} />
      )}
    </div>
  );
}
