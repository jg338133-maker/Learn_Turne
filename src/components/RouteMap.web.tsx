import React, { useEffect, useRef } from "react";
import type * as ML from "maplibre-gl";
import { Coords, PackageStop, RouteStop } from "../types";
import { hasActivePackage } from "../utils/routeLogic";
import { snapToPolyline } from "../utils/geo";

const MAPLIBRE_VERSION = "4.7.1";
const MAPLIBRE_SCRIPT_ID = "learn-turne-maplibre-script";
const MAPLIBRE_CSS_ID = "learn-turne-maplibre-css";

type MapLibreGlobal = typeof globalThis & { maplibregl?: typeof ML };

/**
 * Metro no empaqueta correctamente el worker de MapLibre en esta versión web.
 * Cargamos el runtime desde CDN, pero esperamos explícitamente a que esté listo:
 * así el primer render no depende de una inyección manual durante el deploy.
 */
function loadMapLibre(): Promise<typeof ML> {
  const root = globalThis as MapLibreGlobal;
  if (root.maplibregl) return Promise.resolve(root.maplibregl);

  if (!document.getElementById(MAPLIBRE_CSS_ID)) {
    const link = document.createElement("link");
    link.id = MAPLIBRE_CSS_ID;
    link.rel = "stylesheet";
    link.href = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
    document.head.appendChild(link);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(
      MAPLIBRE_SCRIPT_ID
    ) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    const handleLoad = () => {
      if (root.maplibregl) resolve(root.maplibregl);
      else reject(new Error("MapLibre a été chargé sans exposer son API globale."));
    };
    const handleError = () => reject(new Error("Impossible de charger MapLibre."));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!existing) {
      script.id = MAPLIBRE_SCRIPT_ID;
      script.src = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

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
  if (hasActivePackage(stop.id, packages)) return "#e03131"; // paquete activo → rojo
  if (index < currentIndex) return "#2f9e44"; // ya pasada → verde
  if (index === currentIndex) return "#1a1a1a"; // actual → negro (La Poste)
  if (index === currentIndex + 1) return "#FFCC00"; // siguiente → amarillo (La Poste)
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
        order: stop.order,
        address: stop.address,
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
  const latestRoute = useRef({ stops, packages, currentIndex });

  routeLine.current = stops.map((s) => ({
    latitude: s.latitude,
    longitude: s.longitude,
  }));
  latestRoute.current = { stops, packages, currentIndex };

  // --- Inicializar el mapa una sola vez ---
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    let disposed = false;
    let map: ML.Map | null = null;
    let ro: ResizeObserver | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let repaintTimer: ReturnType<typeof setInterval> | null = null;

    const initialise = async () => {
      const maplibregl = await loadMapLibre();
      const container = containerRef.current;
      if (disposed || !container) return;

      // Esperar al layout evita crear el canvas con 0×0 px en el primer render.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
      if (disposed || !containerRef.current) return;

      const route = latestRoute.current;
      const start = userCoords ??
        route.stops[0] ?? { latitude: 46.6163, longitude: 7.0575 };
      map = new maplibregl.Map({
        container,
        style: STYLE_URL,
        center: [start.longitude, start.latitude],
        zoom: 16,
        pitch: 55,
        bearing: -20,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
      mapRef.current = map;

      const doResize = () => map?.resize();
      resizeTimer = setTimeout(doResize, 100);
      ro = new ResizeObserver(doResize);
      ro.observe(container);

      map.on("load", () => {
        if (!map || disposed) return;
        const activeMap = map;
        const current = latestRoute.current;
      // Edificios en 3D (esquema OpenMapTiles: fuente "openmaptiles").
      try {
        activeMap.addLayer({
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
      activeMap.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: current.stops.map((s) => [s.longitude, s.latitude]),
          },
        },
      });
      activeMap.addLayer({
        id: "route-line",
        source: "route",
        type: "line",
        paint: { "line-color": "#1e90ff", "line-width": 4, "line-opacity": 0.85 },
      });

      // Paradas (capa de círculos con color por dato).
      activeMap.addSource("stops", {
        type: "geojson",
        data: stopsGeoJSON(current.stops, current.packages, current.currentIndex),
      });
      activeMap.addLayer({
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

      // Tocar una parada muestra un globo con su dirección.
      activeMap.on("click", "stops-circles", (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties as { order: number; address: string };
        const coords = (f.geometry as GeoJSON.Point).coordinates as [
          number,
          number
        ];
        new maplibregl.Popup({ offset: 12 })
          .setLngLat(coords)
          .setHTML(`<b>Parada ${p.order}</b><br/>${p.address}`)
          .addTo(activeMap);
      });
      activeMap.on("mouseenter", "stops-circles", () => {
        activeMap.getCanvas().style.cursor = "pointer";
      });
      activeMap.on("mouseleave", "stops-circles", () => {
        activeMap.getCanvas().style.cursor = "";
      });

      readyRef.current = true;
      const selectedStop = current.stops[current.currentIndex];
      if (selectedStop) {
        activeMap.easeTo({
          center: [selectedStop.longitude, selectedStop.latitude],
          zoom: 17,
          duration: 0,
        });
      }
      // MapLibre a veces no hace el primer repintado en este layout hasta que
      // se fuerza un resize. Lo forzamos en bucle corto hasta que las teselas
      // están cargadas (y luego paramos), para un arranque fiable.
      let ticks = 0;
      repaintTimer = setInterval(() => {
        if (mapRef.current !== map) {
          if (repaintTimer) clearInterval(repaintTimer);
          return;
        }
        activeMap.resize();
        activeMap.triggerRepaint();
        ticks += 1;
        if (activeMap.areTilesLoaded() || ticks > 30) {
          if (repaintTimer) clearInterval(repaintTimer);
        }
      }, 200);
      });
    };

    initialise().catch((error) => {
      if (!disposed) console.error("Impossible de démarrer la carte 3D :", error);
    });

    return () => {
      disposed = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      if (repaintTimer) clearInterval(repaintTimer);
      ro?.disconnect();
      arrow.current?.remove();
      arrow.current = null;
      map?.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Actualizar la línea de la ruta al cambiar de recorrido ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const src = map.getSource("route") as ML.GeoJSONSource | undefined;
    src?.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: stops.map((s) => [s.longitude, s.latitude]),
      },
    });
  }, [stops]);

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
    const maplibregl = (globalThis as MapLibreGlobal).maplibregl;
    if (!maplibregl) return;

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
