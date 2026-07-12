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

/* ── DNT-etapper (overnattingshytter, hviledager ekskludert) ─ */
const HUTS = [
  // Breheimen
  { name: "Sota Sæter",       dag: "Start", region: "Breheimen",       lat: 61.8088, lng: 7.7102 },
  { name: "Nørdstedalseter",  dag: "Dag 1", region: "Breheimen",       lat: 61.688,  lng: 7.574  },
  { name: "Sognefjellshytta", dag: "Dag 2", region: "Breheimen",       lat: 61.558,  lng: 8.015  },
  { name: "Fannaråkhytta",    dag: "Dag 3", region: "Jotunheimen",     lat: 61.513,  lng: 7.907  },
  // Jotunheimen
  { name: "Skogadalsbøen",    dag: "Dag 4", region: "Jotunheimen",     lat: 61.448,  lng: 7.686  },
  { name: "Fondsbu",          dag: "Dag 5", region: "Jotunheimen",     lat: 61.387,  lng: 8.263  },
  { name: "Slettningsbu",     dag: "Dag 6", region: "Jotunheimen",     lat: 61.248,  lng: 8.389  },
  { name: "Sulebu",           dag: "Dag 7", region: "Jotunheimen",     lat: 61.143,  lng: 8.249  },
  // Skarvheimen
  { name: "Skarvheim",        dag: "Dag 8", region: "Skarvheimen",     lat: 60.976,  lng: 7.951  },
  { name: "Bjordalsbu",       dag: "Dag 9", region: "Skarvheimen",     lat: 60.857,  lng: 7.726  },
  { name: "Iungsdalshytta",   dag: "Dag 10", region: "Skarvheimen",   lat: 60.793,  lng: 7.570  },
  { name: "Geiterygghytta",   dag: "Dag 11", region: "Skarvheimen",   lat: 60.661,  lng: 7.489  },
  { name: "Finsehytta",       dag: "Dag 12", region: "Hardangervidda",lat: 60.594,  lng: 7.505  },
  // Hardangervidda
  { name: "Krækkja",          dag: "Dag 13", region: "Hardangervidda",lat: 60.443,  lng: 7.448  },
  { name: "Stigstuv",         dag: "Dag 14", region: "Hardangervidda",lat: 60.279,  lng: 7.524  },
  { name: "Sandhaug",         dag: "Dag 15", region: "Hardangervidda",lat: 60.141,  lng: 7.643  },
  { name: "Litlos",           dag: "Dag 16", region: "Hardangervidda",lat: 60.057,  lng: 7.211  },
  { name: "Hellevassbu",      dag: "Dag 17", region: "Hardangervidda",lat: 59.933,  lng: 7.087  },
  { name: "Haukeliseter",     dag: "Mål",    region: "Hardangervidda",lat: 59.817,  lng: 7.217  },
];

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
              color: "#1a6fc4",
              weight: 5,
              opacity: 0.9,
              lineJoin: "round",
            }).addTo(map);
            routeBounds = line.getBounds();
            if (!cancelled) setHasRoute(true);
          }

          // ── Hyttemarkører (DNT-etapper) ─────────────────────
          HUTS.forEach((hut) => {
            const isStart = hut.dag === "Start";
            const isEnd   = hut.dag === "Mål";
            const bg = isStart ? "#2a7d1e" : isEnd ? "#c0392b" : "#fff";
            const border = isStart || isEnd ? "none" : "2.5px solid #1a4f8a";
            const icon = L.divIcon({
              className: "",
              html: `<div style="
                width:11px;height:11px;
                background:${bg};
                border:${border};
                border-radius:2px;
                box-shadow:0 1px 4px rgba(0,0,0,.45);
              "></div>`,
              iconSize: [11, 11],
              iconAnchor: [5, 5],
            });
            L.marker([hut.lat, hut.lng], { icon })
              .addTo(map)
              .bindPopup(
                `<b>${hut.dag}: ${hut.name}</b><br><span style="color:#666;font-size:0.85em">${hut.region}</span>`
              );
          });
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
        <span className="legend-item">
          <span className="legend-line" style={{ background: "#1a6fc4" }} />
          Planlagt rute
        </span>
        <span className="legend-item">
          <span className="legend-line" style={{ background: "#e07020" }} />
          Gått strekning (Garmin inReach)
        </span>
        <span className="legend-item">
          <span className="legend-hut" />
          DNT-etappe (klikk for info)
        </span>
        {!hasRoute && !hasLive && (
          <span className="legend-note">Kartet viser Sør-Norge. Rute og spor legges til under turen.</span>
        )}
      </div>
    </section>
  );
}
