// api/weather.js
// Proxy mot Yr.no (api.met.no) – returnerer min/maks-temp og værsymbol for én dag.

export default async function handler(req, res) {
  const { lat, lon, date } = req.query;
  if (!lat || !lon || !date) {
    return res.status(400).json({ error: "lat, lon og date er påkrevd" });
  }

  try {
    const yrRes = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${parseFloat(lat).toFixed(4)}&lon=${parseFloat(lon).toFixed(4)}`,
      {
        headers: {
          "User-Agent":
            "MassivDagbok/1.0 +https://massiv.robertreitan.no robert.reitan@gmail.com",
        },
      }
    );

    if (!yrRes.ok) {
      return res.status(yrRes.status).json({ error: "Yr svarte ikke" });
    }

    const data = await yrRes.json();
    const ts = data.properties.timeseries;

    // Filtrer til ønsket dato
    const dayTs = ts.filter((t) => t.time.startsWith(date));
    if (dayTs.length === 0) {
      return res.status(200).json({ available: false });
    }

    // Min/maks temperatur
    const temps = dayTs.map((t) => t.data.instant.details.air_temperature);
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));

    // Værsymbol fra middag (eller nærmeste tilgjengelige)
    const noon =
      dayTs.find((t) => t.time.includes("T12:00:00Z")) ||
      dayTs.find((t) => t.data.next_6_hours) ||
      dayTs[0];
    const symbol =
      noon?.data?.next_6_hours?.summary?.symbol_code ||
      noon?.data?.next_1_hours?.summary?.symbol_code ||
      "cloudy";

    // Cache 1 time
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=300");
    return res.status(200).json({ available: true, min, max, symbol });
  } catch (err) {
    console.error("Yr-proxy feil:", err);
    return res.status(500).json({ error: err.message });
  }
}
