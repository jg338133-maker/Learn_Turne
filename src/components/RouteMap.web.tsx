import React, { useEffect, useRef } from "react";
import type * as ML from "maplibre-gl";
import { Coords, PackageStop, RouteStop } from "../types";
import { hasActivePackage } from "../utils/routeLogic";
import { snapToPolyline } from "../utils/geo";

// MapLibre se carga desde CDN (ver index.html) porque el worker no funciona
// empaquetado con Metro. Aquí solo usamos los tipos; el runtime viene de window.
const maplibregl: typeof ML = (globalThis as any).maplibregl;

/**
 * Versión WEB del mapa en 3D con MapLibre GL (rama experimental).
 *
 * - Estilo vectorial gratuito de OpenFreeMap (sin API key).
 * - Cámara inclinada + edificios en 3D (fill-extrusion).
 * - Ruta como línea, paradas como círculos de color (capa de datos), y tu
 *   posición como una flecha que se desliza sobre la línea.
 *
 * La versión nativa (react-native-maps) sigue en RouteMap.tsx.
 */

type Props = {
  stops: RouteStop[];
  packages: PackageStop[];
  userCoords: Coords | null;
  currentIndex: number;
};

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

function stopColor(
  index: number,
  currentIndex: number,
  stop: RouteStop,
  packages: PackageStop[]
): string {
  if (hasActivePackage(stop.id, packages)) return "#e03131"; // paquete → rojo
  if (index < currentIndex) return "#2f9e44"; // pasada → verde
  if (index === currentIndex) return "#1c7ed6"; // actual → azul
  if (index === currentIndex + 1) return "#f76707"; // siguiente → naranja
  return "#868e96"; // pendiente → gris
}

function stopsGeoJSON(
  stops: RouteStop[],
  packages: PackageStop[],
  currentIndex: number
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: stops.map((stop, index) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [stop.longitude, stop.latitude] },
      properties: {
        color: stopColor(index, currentIndex, stop, packages),
        radius: index === currentIndex ? 8 : 5,
      },
    })),
  };
}

/** Elemento HTML de la flecha (apunta al norte; se rota con setRotation). */
function makeArrowEl(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = "34px";
  el.style.height = "34px";
  el.innerHTML =
    `<svg width="34" height="34" viewBox="0 0 24 24">` +
    `<circle cx="12" cy="12" r="11" fill="#1c7ed6" stroke="#ffffff" stroke-width="2"/>` +
    `<path d="M12 4.5 L17.5 18 L12 14.5 L6.5 18 Z" fill="#ffffff"/>` +
    `</svg>`;
  return el;
}

export default function RouteMap({
  stops,
  packages,
  userCoords,
  currentIndex,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ML.Map | null>(null);
  const readyRef = useRef(false);
  const arrow = useRef<ML.Marker | null>(null);
  const routeLine = useRef<Coords[]>([]);

  routeLine.current = stops.map((s) => ({
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  // --- Inicializar el mapa una sola vez ---
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const start = userCoords ?? stops[0];
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [start.longitude, start.latitude],
      zoom: 16,
      pitch: 55, // cámara inclinada → sensación 3D
      bearing: -20,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
    mapRef.current = map;

    map.on("load", () => {
      // Edificios en 3D (esquema OpenMapTiles: fuente "openmaptiles").
      try {
        map.addLayer({
          id: "buildings-3d",
          source: "openmaptiles",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 14,
          paint: {
            "fill-extrusion-color": "#d6d6de",
            "fill-extrusion-height": [
              "coalesce",
              ["get", "render_height"],
              ["get", "height"],
              8,
            ],
            "fill-extrusion-base": [
              "coalesce",
              ["get", "render_min_height"],
              ["get", "min_height"],
              0,
            ],
            "fill-extrusion-opacity": 0.85,
          },
        });
      } catch {
        // Si el estilo no expone esa fuente, seguimos sin 3D de edificios.
      }

      // Línea de la ruta.
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: stops.map((s) => [s.longitude, s.latitude]),
          },
        },
      });
      map.addLayer({
        id: "route-line",
        source: "route",
        type: "line",
        paint: { "line-color": "#1e90ff", "line-width": 4, "line-opacity": 0.85 },
      });

      // Paradas (capa de círculos con color por dato).
      map.addSource("stops", {
        type: "geojson",
        data: stopsGeoJSON(stops, packages, currentIndex),
      });
      map.addLayer({
        id: "stops-circles",
        source: "stops",
        type: "circle",
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      readyRef.current = true;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Actualizar colores/estado de las paradas ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const src = map.getSource("stops") as ML.GeoJSONSource | undefined;
    src?.setData(stopsGeoJSON(stops, packages, currentIndex));
  }, [stops, packages, currentIndex]);

  // --- Flecha que se desliza sobre la línea azul ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords) return;

    const snap = snapToPolyline(userCoords, routeLine.current);
    const lng = snap ? snap.longitude : userCoords.longitude;
    const lat = snap ? snap.latitude : userCoords.latitude;
    const bearing = snap ? snap.bearing : 0;

    if (!arrow.current) {
      arrow.current = new maplibregl.Marker({ element: makeArrowEl() })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      arrow.current.setLngLat([lng, lat]);
    }
    arrow.current.setRotation(bearing);
  }, [userCoords]);

  // --- Centrar la cámara en la parada seleccionada ---
  useEffect(() => {
    const map = mapRef.current;
    const stop = stops[currentIndex];
    if (!map || !stop) return;
    map.easeTo({
      center: [stop.longitude, stop.latitude],
      zoom: 17,
      duration: 500,
    });
  }, [currentIndex, stops]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#e9ecef" }} />
  );
}
