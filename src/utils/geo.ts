import { Coords } from "../types";

/**
 * Proyecta un punto (tu GPS) sobre una polilínea (la línea azul de la ruta) y
 * devuelve el punto "pegado" a la línea más su rumbo, para dibujar una flecha
 * que se desliza sobre el recorrido. Ligero: no usa ningún servicio externo.
 */
export type SnapResult = {
  latitude: number;
  longitude: number;
  bearing: number; // grados 0-360, sentido de avance de la ruta
  segmentIndex: number;
};

/** Rumbo (grados, 0 = norte) del segmento A→B. */
export function bearingDeg(a: Coords, b: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(a.latitude);
  const φ2 = toRad(b.latitude);
  const Δλ = toRad(b.longitude - a.longitude);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function snapToPolyline(p: Coords, line: Coords[]): SnapResult | null {
  if (line.length < 2) return null;

  // Trabajamos en un plano local (corrigiendo la longitud por la latitud). Para
  // distancias cortas es suficientemente preciso.
  const kx = Math.cos((p.latitude * Math.PI) / 180);
  const toXY = (c: Coords) => ({ x: c.longitude * kx, y: c.latitude });
  const P = toXY(p);

  let best: { d2: number; i: number; lat: number; lon: number } | null = null;

  for (let i = 0; i < line.length - 1; i++) {
    const A = toXY(line[i]);
    const B = toXY(line[i + 1]);
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const len2 = dx * dx + dy * dy;
    let t = len2 > 0 ? ((P.x - A.x) * dx + (P.y - A.y) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const projX = A.x + t * dx;
    const projY = A.y + t * dy;
    const ddx = P.x - projX;
    const ddy = P.y - projY;
    const d2 = ddx * ddx + ddy * ddy;
    if (!best || d2 < best.d2) {
      best = { d2, i, lat: projY, lon: projX / kx };
    }
  }

  if (!best) return null;
  return {
    latitude: best.lat,
    longitude: best.lon,
    bearing: (bearingDeg(line[best.i], line[best.i + 1]) + 360) % 360,
    segmentIndex: best.i,
  };
}
