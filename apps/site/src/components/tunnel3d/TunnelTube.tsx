import { useMemo } from "react";
import * as THREE from "three";

const TUBE_RADIUS = 6;
const NEON_OFFSET = TUBE_RADIUS * 0.92;

function buildOffsetCurve(
  curve: THREE.CatmullRomCurve3,
  segments: number,
  angle: number,
) {
  const frames = curve.computeFrenetFrames(segments, false);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const center = curve.getPointAt(t);
    const normal = frames.normals[i].clone();
    const binormal = frames.binormals[i].clone();

    const offset = normal
      .multiplyScalar(Math.cos(angle) * NEON_OFFSET)
      .add(binormal.multiplyScalar(Math.sin(angle) * NEON_OFFSET));

    points.push(center.clone().add(offset));
  }

  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
}

export function TunnelTube({
  curve,
  leve = false,
}: {
  curve: THREE.CatmullRomCurve3;
  /** Geometria reduzida pra celulares/telas pequenas, pra manter 60fps. */
  leve?: boolean;
}) {
  const segments = leve ? 70 : 200;
  const radialSegments = leve ? 8 : 12;
  const neonRadialSegments = leve ? 4 : 6;

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, segments, TUBE_RADIUS, radialSegments, false),
    [curve, segments, radialSegments],
  );

  const neonGeometries = useMemo(() => {
    const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
    return angles.map((angle) => {
      const offsetCurve = buildOffsetCurve(curve, segments, angle);
      return new THREE.TubeGeometry(offsetCurve, segments, 0.05, neonRadialSegments, false);
    });
  }, [curve, segments, neonRadialSegments]);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#0d1a12"
          roughness={0.95}
          metalness={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {neonGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshBasicMaterial color="#c8a44a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
