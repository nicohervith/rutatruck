"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap, Marker as MapboxMarker, Popup as MapboxPopup } from "mapbox-gl";
import { getIconoCarga } from "@/lib/iconos-carga";
import type { CargaMapItem } from "./MapaCargas";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function getPinColor(tipoCarga: string, detalle: string | null): string {
  const d = norm(detalle ?? "");
  if (d.includes("maiz")) return "#F5C518";
  if (["trigo","sorgo","cebada","avena","centeno"].some(x => d.includes(x))) return "#C8A800";
  if (d.includes("soja")) return "#2D6A2D";
  if (d.includes("girasol")) return "#FF8C00";
  if (["manzana","pera","durazno","uva","citrico","limon","sandia","frutilla"].some(x => d.includes(x))) return "#FF6B35";
  if (["tomate","papa","cebolla","ajo","zanahoria","zapallo","lechuga","pimiento"].some(x => d.includes(x))) return "#4CAF50";
  if (["bovino","porcino","ovino","caprino","equino"].some(x => d.includes(x))) return "#8B4513";
  if (d.includes("aviar")) return "#E53935";
  const cat: Record<string, string> = { granos: "#C8A800", frutas: "#FF6B35", verduras: "#4CAF50", animales: "#8B4513" };
  return cat[tipoCarga] ?? "#9E9E9E";
}

const TIPO_LABELS: Record<string, string> = {
  granos: "Granos", frutas: "Frutas", verduras: "Verduras", animales: "Animales", otro: "Otro",
};

interface Props {
  cargas: CargaMapItem[];
  yaPostuladoIds: number[];
}

export default function MapaInline({ cargas, yaPostuladoIds }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<MapboxMarker[]>([]);
  const popupRef = useRef<MapboxPopup | null>(null);

  const cargasConGeo = cargas.filter(c => c.origenLat != null && c.origenLng != null);
  const yaPostSet = new Set(yaPostuladoIds);

  useEffect(() => {
    let active = true;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (!active || !containerRef.current || mapRef.current) return;

      mapboxgl.accessToken = TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-63.6167, -38.4161],
        zoom: 4,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (!active) return;

        for (const carga of cargasConGeo) {
          const emoji = getIconoCarga(carga.tipoCarga, carga.tipoCargaDetalle);
          const color = getPinColor(carga.tipoCarga, carga.tipoCargaDetalle);
          const yaPost = yaPostSet.has(carga.id);

          const el = document.createElement("div");
          Object.assign(el.style, {
            width: "40px", height: "40px", borderRadius: "50%",
            background: color, border: "2.5px solid white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", cursor: "pointer",
            transition: "transform 150ms ease",
            userSelect: "none",
          });
          el.textContent = emoji;
          el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.2)"; });
          el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }

            const presupuestoStr = `<p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#06342A">${carga.presupuesto != null ? `$${carga.presupuesto.toLocaleString("es-AR")}` : "A acordar"}</p>`;

            const badgeStr = yaPost
              ? `<span style="display:inline-block;padding:2px 8px;background:#DCFCE7;color:#166534;border-radius:999px;font-size:11px;font-weight:600;margin-bottom:6px">✓ Ya me postulé</span><br/>`
              : "";

            const btnBg = yaPost ? "#E8F5E9" : "#06342A";
            const btnColor = yaPost ? "#06342A" : "#FFFFFF";
            const btnText = yaPost ? "Ver mi postulación →" : "Me interesa →";

            const popup = new mapboxgl.Popup({
              maxWidth: "260px",
              offset: 20,
              closeButton: true,
              className: "clickcargo-popup",
            }).setHTML(`
              <div style="padding:14px;font-family:inherit">
                ${badgeStr}
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="font-size:26px">${emoji}</span>
                  <div>
                    <p style="margin:0;font-size:13px;font-weight:800;color:${color}">${TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}</p>
                    ${carga.tipoCargaDetalle ? `<p style="margin:0;font-size:11px;color:#6B7280">${carga.tipoCargaDetalle}</p>` : ""}
                  </div>
                </div>
                <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#111827">${carga.origen} → ${carga.destino}</p>
                ${presupuestoStr}
                <a href="/transportista/cargas/${carga.id}"
                  style="display:block;text-align:center;padding:9px 14px;background:${btnBg};color:${btnColor};border-radius:10px;text-decoration:none;font-size:13px;font-weight:700">
                  ${btnText}
                </a>
              </div>
            `);

            popup.setLngLat([carga.origenLng!, carga.origenLat!]).addTo(map);
            popupRef.current = popup;
            map.flyTo({ center: [carga.origenLng!, carga.origenLat!], zoom: Math.max(map.getZoom(), 8), duration: 400, padding: { bottom: 100 } });
          });

          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([carga.origenLng!, carga.origenLat!])
            .addTo(map);
          markersRef.current.push(marker);
        }

        map.on("click", () => {
          if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
        });

        // Fit to all pins
        if (cargasConGeo.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          for (const c of cargasConGeo) bounds.extend([c.origenLng!, c.origenLat!]);
          map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 1000 });
        } else if (cargasConGeo.length === 1) {
          map.flyTo({ center: [cargasConGeo[0].origenLng!, cargasConGeo[0].origenLat!], zoom: 9, duration: 800 });
        }
      });
    })();

    return () => {
      active = false;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
