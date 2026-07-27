// api/historical-weather.js
// Henter historisk vær for Hardangervidda-skituren 21–25 mars 2026
// fra Open-Meteo sitt gratis arkiv-API (krever ingen autentisering).

const START = "2026-03-21";
const END   = "2026-03-25";

export default async function handler(req, res) {
  try {
    // Sentralt punkt på Hardangervidda
    const url =
      "https://archive-api.open-meteo.com/v1/archive" +
      "?latitude=60.2&longitude=7.5" +
      `&start_date=${START}&end_date=${END}` +
      "&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max" +
      "&timezone=Europe%2FOslo";

    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "MassivDagbok/1.0 +https://massiv.robertreitan.no robert.reitan@gmail.com",
      },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `Open-Meteo: ${r.status}` });
    }

    const data = await r.json();
    const d = data.daily;
    if (!d?.time) {
      return res.status(200).json({ available: false });
    }

    // Bygg en map: { "2026-03-21": { code, max, min, wind }, ... }
    const byDate = {};
    d.time.forEach((date, i) => {
      byDate[date] = {
        code: d.weathercode[i],
        max:  Math.round(d.temperature_2m_max[i]),
        min:  Math.round(d.temperature_2m_min[i]),
        wind: Math.round(d.windspeed_10m_max[i]),
      };
    });

    // Cache én dag – historisk data endrer seg ikke
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).json({ available: true, byDate });
  } catch (err) {
    console.error("historical-weather error:", err);
    return res.status(500).json({ error: err.message });
  }
}
