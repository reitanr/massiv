import { config } from "../config.js";

// Bygger inn Garmin MapShare-kartet via iframe.
// Sporet oppdateres automatisk fra inReach-en via satellitt –
// ingenting å gjøre her underveis på turen.
export default function LiveMap() {
  const name = config.mapShareName;
  const url = `https://share.garmin.com/${name}`;

  return (
    <section className="map" id="kart">
      <div className="map-frame">
        {name === "dittnavn" ? (
          <div className="map-placeholder">
            <p>Kartet dukker opp her.</p>
            <p className="muted">
              Sett MapShare-navnet ditt i <code>src/config.js</code>, så
              vises live-sporet fra inReach-en automatisk.
            </p>
          </div>
        ) : (
          <iframe
            title="Live-spor fra Garmin MapShare"
            src={url}
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
}
