// api/garmin-feed.js
// Proxy som henter Garmin MapShare KML-feeden server-side for å unngå CORS-problemer.
// Returnerer rå KML som browseren kan parse til koordinater.

export default async function handler(req, res) {
  const name = process.env.GARMIN_MAPSHARE_NAME || "6HFRJ";

  try {
    const response = await fetch(
      `https://share.garmin.com/Feed/Share/${name}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MassivDagbok/1.0; +https://massiv.robertreitan.no)",
        },
      }
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Garmin-feeden svarte ikke" });
    }

    const kml = await response.text();

    // Cache i 5 minutter (Garmin oppdaterer sporet hvert 10. min)
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(kml);
  } catch (err) {
    console.error("Garmin-proxy feil:", err);
    return res.status(500).json({ error: err.message });
  }
}
