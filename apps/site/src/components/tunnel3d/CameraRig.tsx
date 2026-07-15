import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { TunnelItem } from "./types";

gsap.registerPlugin(ScrollTrigger);

export type Foco = {
  item: TunnelItem;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
};

export function CameraRig({
  trackRef,
  curve,
  modo,
  foco,
  onZoomCompleto,
  onProgress,
}: {
  trackRef: React.RefObject<HTMLDivElement | null>;
  curve: THREE.CatmullRomCurve3;
  modo: "scroll" | "zoom";
  foco: Foco | null;
  onZoomCompleto: () => void;
  onProgress?: (progress: number) => void;
}) {
  const { camera, size } = useThree();
  const progressState = useRef({ value: 0 });
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);

  // Em telas estreitas/retrato (celular), abre o campo de visão pra as
  // molduras não ficarem cortadas nas laterais.
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / size.height;
    const fov = aspect >= 1 ? 60 : THREE.MathUtils.clamp(60 + (1 - aspect) * 45, 60, 95);
    // Mutar a câmera do Three.js diretamente (e chamar updateProjectionMatrix
    // em seguida) é o padrão documentado do react-three-fiber, não uma
    // mutação de estado do React — a regra de imutabilidade não se aplica.
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = fov;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useEffect(() => {
    if (!trackRef.current) return;

    const tween = gsap.to(progressState.current, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        // scrub baixo = a câmera acompanha o dedo/mouse quase em tempo real,
        // só suavizando o suficiente pra tirar o "trepidado" do scroll bruto.
        scrub: 0.35,
      },
    });
    scrollTriggerRef.current = tween.scrollTrigger ?? null;

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [trackRef]);

  useEffect(() => {
    if (modo === "zoom" && foco) {
      scrollTriggerRef.current?.disable(false);

      const forward = foco.tangent.clone().negate().normalize();
      const alvoCamera = foco.position.clone().add(forward.multiplyScalar(4.2));

      const tl = gsap.timeline({ onComplete: onZoomCompleto });
      tl.to(camera.position, {
        x: alvoCamera.x,
        y: alvoCamera.y,
        z: alvoCamera.z,
        duration: 1.15,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(foco.position),
      });
    } else {
      scrollTriggerRef.current?.enable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, foco]);

  useFrame(() => {
    if (modo !== "scroll") return;

    const t = THREE.MathUtils.clamp(progressState.current.value, 0, 1);
    desiredPosition.copy(curve.getPointAt(t));
    const aheadT = THREE.MathUtils.clamp(t + 0.015, 0, 1);
    lookTarget.copy(curve.getPointAt(aheadT));

    // Um único nível de suavização (o scrub do GSAP acima) já é suficiente;
    // uma segunda camada de lerp aqui só somava atraso e deixava a resposta
    // ao scroll/toque mais "arrastada" do que deveria.
    camera.position.copy(desiredPosition);
    camera.lookAt(lookTarget);

    onProgress?.(t);
  });

  return null;
}
