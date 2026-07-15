import { useMemo, useState } from "react";
import * as THREE from "three";
import { useTexture, Text } from "@react-three/drei";
import type { TunnelItem } from "./types";

const GRAYSCALE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GRAYSCALE_FRAGMENT = `
  uniform sampler2D map;
  uniform float uMix;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(map, vUv);
    float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 color = mix(tex.rgb, vec3(gray) * 0.65, uMix);
    gl_FragColor = vec4(color, tex.a);
  }
`;

export function PropertyPortal({
  item,
  position,
  tangent,
  onSelect,
}: {
  item: TunnelItem;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  onSelect: (item: TunnelItem, position: THREE.Vector3, tangent: THREE.Vector3) => void;
}) {
  const texture = useTexture(item.url);
  const [hover, setHover] = useState(false);

  const quaternion = useMemo(() => {
    const forward = tangent.clone().negate().normalize();
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      forward,
    );
  }, [tangent]);

  const photoMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: texture }, uMix: { value: item.vendida ? 1 : 0 } },
        vertexShader: GRAYSCALE_VERTEX,
        fragmentShader: GRAYSCALE_FRAGMENT,
      }),
    [texture, item.vendida],
  );

  const largura = 6;
  const altura = 3.75;

  return (
    <group position={position} quaternion={quaternion}>
      {/* moldura de fundo: neon dourado se disponível, cinza opaco se vendido */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[largura + 0.5, altura + 0.5]} />
        {item.vendida ? (
          <meshStandardMaterial color="#2a2a2a" roughness={1} />
        ) : (
          <meshBasicMaterial
            color="#e8d08a"
            toneMapped={false}
            transparent
            opacity={hover ? 1 : 0.85}
          />
        )}
      </mesh>

      {/* foto do imóvel */}
      <mesh
        material={photoMaterial}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item, position, tangent);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[largura, altura]} />
      </mesh>

      {item.vendida && (
        <Text
          position={[0, 0, 0.05]}
          rotation={[0, 0, -0.25]}
          fontSize={0.9}
          color="#f5f0e8"
          anchorX="center"
          anchorY="middle"
          material-transparent
          material-opacity={0.85}
        >
          VENDIDO
        </Text>
      )}

      <Text
        position={[-largura / 2, -altura / 2 - 0.5, 0]}
        fontSize={0.32}
        color="#f5f0e8"
        anchorX="left"
        anchorY="top"
        maxWidth={largura}
      >
        {item.titulo}
      </Text>
      {item.localizacao && (
        <Text
          position={[-largura / 2, -altura / 2 - 0.95, 0]}
          fontSize={0.22}
          color="#e8d08a"
          anchorX="left"
          anchorY="top"
          maxWidth={largura}
        >
          {item.localizacao}
        </Text>
      )}
    </group>
  );
}
