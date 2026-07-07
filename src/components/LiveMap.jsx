import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

/* ── KML-parser (Garmin MapShare) ───────────────────────────── */
function parseKML(kmlText) {
  const doc = new DOMParser().parseFromString(kmlText, "application/xml");

  // LineString = hele sporet samlet (foretrekkes)
  const lineEl = doc.querySelector("LineString coordinates");
  if (lineEl) {
    const pts = lineEl.textContent
      .trim()
      .split(/\s+/)
      .map((c) => {
        const [lng, lat] = c.split(",").map(Number);
        return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
      })
      .filter(Boolean);
    if (pts.length > 0) return pts;
  }

  // Fallback: enkelt-punkter
  const pts = [];
  doc.querySelectorAll("Point coordinates").forEach((el) => {
    const [lng, lat] = el.textContent.trim().split(",").map(Number);
    if (!isNaN(lat) && !isNaN(lng)) pts.push([lat, lng]);
  });
  return pts;
}

/* ── GPX-parser (planlagt rute) ─────────────────────────────── */
function parseGPX(gpxText) {
  const doc = new DOMParser().parseFromString(gpxText, "application/xml");
  const pts = [];
  doc.querySelectorAll("trkpt, rtept").forEach((el) => {
    const lat = parseFloat(el.getAttribute("lat"));
    const lng = parseFloat(el.getAttribute("lon"));
    if (!isNaN(lat) && !isNaN(lng)) pts.push([lat, lng]);
  });
  return pts;
}

/* ── Komponent ──────────────────────────────────────────────── */
export default function LiveMap() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [hasRoute, setHasRoute] = useState(false);
  const [hasLive, setHasLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Dynamisk import slik at Leaflet ikke kjøres under SSR
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      // ── Opprett kart ────────────────────────────────────────
      const map = L.map(containerRef.current, {
        center: [59.9, 7.4], // Sør-Norge
        zoom: 7,
        zoomControl: true,
      });
      mapRef.current = map;

      // OpenTopoMap – bra for fjellturer
      L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution:
          'Kart: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>' +
          ' | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
        maxZoom: 17,
      }).addTo(map);

      let routeBounds = null;

      // ── Planlagt rute (GPX) ──────────────────────────────────
      try {
        const gpxRes = await fetch("/rute.gpx");
        if (!cancelled && gpxRes.ok) {
          const routePts = parseGPX(await gpxRes.text());
          if (routePts.length > 1) {
            const line = L.polyline(routePts, {
              color: "#3a6e8f",
              weight: 3,
              opacity: 0.85,
              lineJoin: "round",
            }).addTo(map);
            routeBounds = line.getBounds();
            if (!cancelled) setHasRoute(true);
          }
        }
      } catch (_) {
        /* GPX-fil finnes ikke ennå – greit */
      }

      // ── Live Garmin-spor ─────────────────────────────────────
      try {
        const garminRes = await fetch("/api/garmin-feed");
        if (!cancelled && garminRes.ok) {
          const positions = parseKML(await garminRes.text());

          if (positions.length > 0) {
            // Spor-linje
            if (positions.length > 1) {
              L.polyline(positions, {
                color: "#e07020",
                weight: 3,
                opacity: 0.9,
                lineJoin: "round",
              }).addTo(map);
            }

            // Siste posisjon – oransje prikk
            const last = positions[positions.length - 1];
            const dot = L.divIcon({
              className: "",
              html: `<div style="
                width: 16px; height: 16px;
                background: #e07020;
                border: 3px solid #fff;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,.45);
              "></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
            L.marker(last, { icon: dot })
              .addTo(map)
              .bindPopup("<b>Robert er her nå</b>");

            if (!cancelled) {
              setHasLive(true);
              // Sentrer på live-posisjon hvis ingen GPX-rute
              if (!routeBounds) map.setView(last, 10);
            }
          }
        }
      } catch (_) {
        /* Garmin ikke tilgjengelig */
      }

      // ── Tilpass zoom til ruten ───────────────────────────────
      if (!cancelled && routeBounds) map.fitBounds(routeBounds.pad(0.06));
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <section id="kart">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Kart
      </h2>
      <div className="map-frame">
        <div ref={containerRef} className="leaflet-map" />
      </div>
      <div className="map-legend">
        <span>
          <span className="legend-dot" style={{ background: "#3a6e8f" }} />
          Planlagt rute
        </span>
        <span>
          <span className="legend-dot" style={{ background: "#e07020" }} />
          Live-spor (Garmin inReach)
        </span>
        {!hasRoute && !hasLive && (
          <span className="legend-note">Kartet viser Sør-Norge. Rute og spor legges til under turen.</span>
        )}
      </div>
    </section>
  );
}
