import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { config } from "../config.js";

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
  // Koordinater hentet fra GPX-ruten (kumulativ distanse per etappe)
  { name: "Sota Sæter",       dag: "Start",  region: "Breheimen",      lat: 61.80877, lng: 7.71019 },
  { name: "Nørdstedalseter",  dag: "Dag 1",  region: "Breheimen",      lat: 61.64232, lng: 7.79666 },
  { name: "Sognefjellshytta", dag: "Dag 2",  region: "Breheimen",      lat: 61.54389, lng: 7.97259 },
  { name: "Fannaråkhytta",    dag: "Dag 3",  region: "Jotunheimen",    lat: 61.45172, lng: 8.02802 },
  // Jotunheimen
  { name: "Skogadalsbøen",    dag: "Dag 4",  region: "Jotunheimen",    lat: 61.39587, lng: 8.15003 },
  { name: "Fondsbu",          dag: "Dag 5",  region: "Jotunheimen",    lat: 61.29855, lng: 8.16489 },
  { name: "Slettningsbu",     dag: "Dag 6",  region: "Jotunheimen",    lat: 61.15834, lng: 8.11952 },
  { name: "Sulebu",           dag: "Dag 7",  region: "Jotunheimen",    lat: 61.04906, lng: 8.10363 },
  // Skarvheimen
  { name: "Skarvheim",        dag: "Dag 8",  region: "Skarvheimen",    lat: 60.92133, lng: 7.99816 },
  { name: "Bjordalsbu",       dag: "Dag 9",  region: "Skarvheimen",    lat: 60.82122, lng: 7.92338 },
  { name: "Iungsdalshytta",   dag: "Dag 10", region: "Skarvheimen",    lat: 60.77777, lng: 7.69953 },
  { name: "Geiterygghytta",   dag: "Dag 11", region: "Skarvheimen",    lat: 60.58421, lng: 7.51875 },
  { name: "Finsehytta",       dag: "Dag 12", region: "Hardangervidda", lat: 60.48273, lng: 7.67776 },
  // Hardangervidda
  { name: "Krækkja",          dag: "Dag 13", region: "Hardangervidda", lat: 60.29622, lng: 7.65044 },
  { name: "Stigstuv",         dag: "Dag 14", region: "Hardangervidda", lat: 60.17827, lng: 7.47458 },
  { name: "Sandhaug",         dag: "Dag 15", region: "Hardangervidda", lat: 60.10117, lng: 7.14813 },
  { name: "Litlos",           dag: "Dag 16", region: "Hardangervidda", lat: 59.92119, lng: 7.20840 },
  { name: "Hellevassbu",      dag: "Dag 17", region: "Hardangervidda", lat: 59.83438, lng: 7.21119 },
  { name: "Haukeliseter",     dag: "Mål",    region: "Hardangervidda", lat: 59.82377, lng: 7.19460 },
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

      // ── Live Garmin-spor (vises bare fra og med startdato) ───
      const hikeStarted = !config.hikeStartDate || new Date() >= new Date(config.hikeStartDate);
      try {
        const garminRes = hikeStarted ? await fetch("/api/garmin-feed") : null;
        if (!cancelled && garminRes?.ok) {
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
              .bindPopup("<b>Robert's current location</b>");

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
        Map
      </h2>
      <div className="map-frame">
        <div ref={containerRef} className="leaflet-map" />
      </div>
      <div className="map-legend">
        <span className="legend-item">
          <span className="legend-line" style={{ background: "#1a6fc4" }} />
          Planned route
        </span>
        <span className="legend-item">
          <span className="legend-line" style={{ background: "#e07020" }} />
          Tracked route (Garmin inReach)
        </span>
        <span className="legend-item">
          <span className="legend-hut" />
          Overnight stop (click for info)
        </span>
        {!hasRoute && !hasLive && (
          <span className="legend-note">Map shows Southern Norway. Route and live track will appear when the hike begins.</span>
        )}
      </div>
    </section>
  );
}
