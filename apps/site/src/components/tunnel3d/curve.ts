import * as THREE from "three";

export const TUNNEL_SPACING = 14;

export function buildTunnelPoints(count: number): THREE.Vector3[] {
  const n = Math.max(count, 2);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < n; i++) {
    const z = -i * TUNNEL_SPACING;
    const x = Math.sin(i * 0.9) * 3;
    const y = Math.cos(i * 0.7) * 1.5;
    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

export function buildTunnelCurve(points: THREE.Vector3[]) {
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
}
