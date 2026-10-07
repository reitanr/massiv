import { useState, useEffect, useRef } from "react";
import { config } from "./config.js";
import LiveMap from "./components/LiveMap.jsx";
import PostsFeed from "./components/PostsFeed.jsx";
import Gallery from "./components/Gallery.jsx";
import NewPost from "./components/NewPost.jsx";
import PreviousTripsPage from "./components/PreviousTripsPage.jsx";
import AllPostsPage from "./components/AllPostsPage.jsx";
import GalleryPage from "./components/GalleryPage.jsx";
import JulebordPage from "./components/JulebordPage.jsx";

export default function App() {
  const [page, setPage] = useState(() => window.location.hash);

  useEffect(() => {
    const handler = () => setPage(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (page === "#ny-post") return <NewPost />;
  if (page === "#tidligere-turer") return <PreviousTripsPage />;
  if (page === "#alle-innlegg") return <AllPostsPage />;
  if (page === "#alle-bilder") return <GalleryPage />;
  if (page === "#julebord") return <JulebordPage />;

  return (
    <>
      {/* Sticky navigasjon */}
      <nav className="site-nav">
        <div className="site-nav-inner">
          <a href="#topp" className="nav-logo">
            <span className="t-mark lg on-dark" aria-hidden="true" />
            <span className="nav-logo-text">{config.title}</span>
          </a>
          <ul className="nav-links">
            <li><a href="#dagbok">Dagbok</a></li>
            <li><a href="#galleri">Galleri</a></li>
            <li><a href="#kart">Kart</a></li>
            <li><a href="#stages">Etapper</a></li>
            <li><a href="#forberedelser">Om turen</a></li>
            <li><a href="#tidligere-turer">Tidligere turer</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero – mørk fjellmorgen */}
      <header className="hero" id="topp">
        <div className="hero-inner">
          <div className="hero-byline">
            <span className="t-mark on-dark" aria-hidden="true" />
            {config.walker}
          </div>
          <h1>{config.title}</h1>
          <p className="hero-sub">{config.subtitle}</p>
          <p className="hero-scroll">
            <span>↓</span> Følg turen live
          </p>
        </div>

        {/* Fjellsilhuett som overgang til lyst innhold */}
        <svg
          className="mountain-svg"
          viewBox="0 0 1440 180"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,180 L0,140 L60,110 L130,145 L200,90 L290,130 L370,60 L450,110 L530,40 L610,95 L680,20 L750,80 L820,30 L900,85 L970,50 L1040,100 L1110,65 L1180,105 L1260,70 L1340,115 L1440,80 L1440,180 Z"
            fill="#faf8f4"
          />
        </svg>
      </header>

      {/* Lyst innholdsområde */}
      <main className="content">
        <div className="container">
          <PostsFeed preview={true} />
          <GalleriSnarvei />
          <LiveMap />
          <Stages />
          <Preparations />
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="t-mark on-dark" aria-hidden="true" />
          <p>{config.walker} · {config.startDato} · Sporet live via Garmin inReach</p>
        </div>
      </footer>
    </>
  );
}

const STAGES = [
  { day: 1,  from: "Sota Sæter",       to: "Nørdstedalseter",  region: "Breheimen",      km: 26, ascent: 1691, diff: 4, lat: 61.64232, lon: 7.79666 },
  { day: 2,  from: "Nørdstedalseter",  to: "Sognefjellshytta", region: "Breheimen",      km: 26, ascent: 1838, diff: 5, lat: 61.54389, lon: 7.97259 },
  { day: 3,  from: "Sognefjellshytta", to: "Fannaråkhytta",    region: "Jotunheimen",    km: 16, ascent:  895, diff: 4, lat: 61.45172, lon: 8.02802 },
  { day: 4,  from: "Fannaråkhytta",    to: "Skogadalsbøen",    region: "Jotunheimen",    km: 12, ascent:  500, diff: 2, lat: 61.39587, lon: 8.15003 },
  { day: 5,  from: "Skogadalsbøen",    to: "Fondsbu",          region: "Jotunheimen",    km: 25, ascent: 1059, diff: 4, lat: 61.29855, lon: 8.16489 },
  { day: 6,  from: "Fondsbu",          to: "Slettningsbu",     region: "Jotunheimen",    km: 24, ascent:  756, diff: 3, lat: 61.15834, lon: 8.11952 },
  { day: 7,  from: "Slettningsbu",     to: "Sulebu",           region: "Jotunheimen",    km: 19, ascent:  754, diff: 3, lat: 61.04906, lon: 8.10363 },
  { day: 8,  from: "Sulebu",           to: "Skarvheim",        region: "Skarvheimen",    km: 21, ascent:  832, diff: 3, lat: 60.92133, lon: 7.99816 },
  { day: 9,  from: "Skarvheim",        to: "Bjordalsbu",       region: "Skarvheimen",    km: 13, ascent:  785, diff: 3, lat: 60.82122, lon: 7.92338 },
  { day: 10, from: "Bjordalsbu",       to: "Iungsdalshytta",   region: "Skarvheimen",    km: 17, ascent:  465, diff: 2, lat: 60.77777, lon: 7.69953 },
  { day: 11, from: "Iungsdalshytta",   to: "Geiterygghytta",   region: "Skarvheimen",    km: 30, ascent:  993, diff: 5, lat: 60.58421, lon: 7.51875 },
  { day: 12, from: "Geiterygghytta",   to: "Finsehytta",       region: "Skarvheimen",    km: 17, ascent:  685, diff: 3, lat: 60.48273, lon: 7.67776 },
  { day: 13, from: "Finsehytta",       to: "Krækkja",          region: "Hardangervidda", km: 24, ascent:  797, diff: 3, lat: 60.29622, lon: 7.65044, winter: true, winterDate: "2026-03-21" },
  { day: 14, from: "Krækkja",          to: "Stigstuv",         region: "Hardangervidda", km: 20, ascent:  700, diff: 2, lat: 60.17827, lon: 7.47458, winter: true, winterDate: "2026-03-22" },
  { day: 15, from: "Stigstuv",         to: "Sandhaug",         region: "Hardangervidda", km: 20, ascent:  644, diff: 2, lat: 60.10117, lon: 7.14813, winter: true, winterDate: "2026-03-23" },
  { day: 16, from: "Sandhaug",         to: "Litlos",           region: "Hardangervidda", km: 25, ascent:  661, diff: 3, lat: 59.92119, lon: 7.20840, winter: true, winterDate: "2026-03-24" },
  { day: 17, from: "Litlos",           to: "Hellevassbu",      region: "Hardangervidda", km: 17, ascent:  552, diff: 1, lat: 59.83438, lon: 7.21119, winter: true, winterDate: "2026-03-25" },
  { day: 18, from: "Hellevassbu",      to: "Haukeliseter",     region: "Hardangervidda", km: 22, ascent:  743, diff: 3, lat: 59.82377, lon: 7.19460, winter: true, winterDate: "2026-03-25" },
];

// Faktisk vindstyrke fra Hardangervidda-skituren (Robert's egne data, m/s)
const WINTER_WIND = {
  "2026-03-21": 12,
  "2026-03-22": 16,
  "2026-03-23": 19,
  "2026-03-24": 24,
  "2026-03-25": 18,
};

const REGION_COLOR = {
  Breheimen:      "#2a7d1e",
  Jotunheimen:    "#1a6fc4",
  Skarvheimen:    "#7b3fa0",
  Hardangervidda: "#c07020",
};

function weatherEmoji(symbol) {
  if (!symbol) return "–";
  if (symbol.includes("clearsky"))     return "☀️";
  if (symbol.includes("fair"))         return "🌤️";
  if (symbol.includes("partlycloudy")) return "⛅";
  if (symbol.includes("cloudy"))       return "☁️";
  if (symbol.includes("fog"))          return "🌫️";
  if (symbol.includes("thunder"))      return "⛈️";
  if (symbol.includes("snow"))         return "❄️";
  if (symbol.includes("sleet"))        return "🌨️";
  if (symbol.includes("rain") || symbol.includes("shower")) return "🌧️";
  return "🌡️";
}

// WMO weather code → emoji (Open-Meteo archive)
function wmoEmoji(code) {
  if (code === 0)                   return "☀️";
  if (code === 1)                   return "🌤️";
  if (code === 2)                   return "⛅";
  if (code === 3)                   return "☁️";
  if (code === 45 || code === 48)   return "🌫️";
  if (code >= 51 && code <= 57)     return "🌧️";
  if (code >= 61 && code <= 67)     return "🌧️";
  if (code >= 71 && code <= 77)     return "❄️";
  if (code >= 80 && code <= 82)     return "🌧️";
  if (code >= 85 && code <= 86)     return "🌨️";
  if (code >= 95)                   return "⛈️";
  return "🌡️";
}

function CountUp({ target, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const dur = 1400;
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function RegionCards() {
  const regions = Object.keys(REGION_COLOR);
  const cards = regions.map((region) => {
    const s = STAGES.filter((st) => st.region === region);
    return {
      region,
      color: REGION_COLOR[region],
      days: s.length,
      km: s.reduce((a, b) => a + b.km, 0),
      ascent: s.reduce((a, b) => a + b.ascent, 0),
    };
  });
  return (
    <div className="region-cards">
      {cards.map(({ region, color, days, km, ascent }) => (
        <div key={region} className="region-card">
          <div className="rc-accent" style={{ background: color }} />
          <div className="rc-body">
            <div className="rc-name" style={{ color }}>{region}</div>
            <div className="rc-row"><span className="rc-lbl">Etapper</span><span className="rc-val">{days}</span></div>
            <div className="rc-row"><span className="rc-lbl">Distanse</span><span className="rc-val">{km} km</span></div>
            <div className="rc-row"><span className="rc-lbl">Stigning</span><span className="rc-val">{ascent.toLocaleString()} m</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ElevationChart() {
  const max = Math.max(...STAGES.map((s) => s.ascent));
  return (
    <div className="elev-chart">
      <div className="elev-bars">
        {STAGES.map((s) => (
          <div
            key={s.day}
            className="elev-bar-wrap"
            title={`Day ${s.day}: ${s.ascent.toLocaleString()} m ascent`}
          >
            <div
              className="elev-bar"
              style={{ height: `${(s.ascent / max) * 100}%`, background: REGION_COLOR[s.region] }}
            />
            <div className="elev-bar-day">{s.day}</div>
          </div>
        ))}
      </div>
      <p className="elev-chart-note">Stigning per dag — farger viser region. Dag 2 er tøffest med {max.toLocaleString()} m.</p>
    </div>
  );
}

function diffDots(n) {
  const color = n <= 2 ? "#2a7d1e" : n === 3 ? "#c07020" : "#c0392b";
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className="diff-dot" style={{ background: i < n ? color : "#ddd9d0" }} />
  ));
}

function GalleriSnarvei() {
  return (
    <section id="galleri">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Galleri
      </h2>
      <a href="#alle-bilder" className="galleri-snarvei">
        <span>Se alle bilder fra turen →</span>
      </a>
    </section>
  );
}

function Stages() {
  const [weather, setWeather] = useState({});
  const [histWeather, setHistWeather] = useState(null);

  // Hent historisk vær for vinteretappene
  useEffect(() => {
    fetch("/api/historical-weather")
      .then((r) => r.json())
      .then((data) => { if (data.available) setHistWeather(data.byDate); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const hikeStart = config.hikeStartDate
      ? new Date(config.hikeStartDate + "T00:00:00Z")
      : new Date();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const toFetch = STAGES.filter((s) => {
      if (s.winter) return false;
      const d = new Date(hikeStart);
      d.setUTCDate(d.getUTCDate() + s.day - 1);
      const diff = (d - today) / 86400000;
      return diff >= 0 && diff < 9;
    });

    if (toFetch.length === 0) return;

    Promise.all(
      toFetch.map(async (s) => {
        const d = new Date(hikeStart);
        d.setUTCDate(d.getUTCDate() + s.day - 1);
        const dateStr = d.toISOString().split("T")[0];
        try {
          const res = await fetch(`/api/weather?lat=${s.lat}&lon=${s.lon}&date=${dateStr}`);
          const data = await res.json();
          if (data.available) return [s.day, data];
        } catch {}
        return null;
      })
    ).then((results) => {
      const entries = results.filter(Boolean);
      if (entries.length > 0) setWeather(Object.fromEntries(entries));
    });
  }, []);

  return (
    <section id="stages">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Etapper
      </h2>
      <div className="stages-wrap">
        <RegionCards />
        <table className="stages-table">
          <thead>
            <tr>
              <th>Dag</th>
              <th>Rute</th>
              <th>Region</th>
              <th>km</th>
              <th>Stigning</th>
              <th>Vanskelighet</th>
              <th>Vær</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => {
              const isFirstWinter = s.day === 13;
              return (
                <>
                  {isFirstWinter && (
                    <tr key="winter-divider" className="st-section-divider">
                      <td colSpan={7}>❄ Hardangervidda — fullført på ski, 21–25 mars 2026</td>
                    </tr>
                  )}
                  <tr key={s.day} className={s.winter ? "st-row-winter" : ""}>
                    <td className="st-day">{s.day}</td>
                    <td className="st-route">{s.from} → {s.to}</td>
                    <td>
                      <span className="st-region" style={{ borderColor: REGION_COLOR[s.region], color: REGION_COLOR[s.region] }}>
                        {s.region}
                      </span>
                    </td>
                    <td className="st-num">{s.km}</td>
                    <td className="st-num">{s.ascent.toLocaleString()} m</td>
                    <td className="st-diff">
                      {s.winter ? <span className="st-winter-icon">❄</span> : diffDots(s.diff)}
                    </td>
                    <td className="st-weather">
                      {s.winter
                        ? (() => {
                            const w = histWeather?.[s.winterDate];
                            return w
                              ? <span>{wmoEmoji(w.code)} {w.max}°/{w.min}° <span className="st-weather-wind">{WINTER_WIND[s.winterDate]} m/s</span></span>
                              : <span className="st-weather-na">–</span>;
                          })()
                        : weather[s.day]
                          ? <span>{weatherEmoji(weather[s.day].symbol)} {weather[s.day].max}°/{weather[s.day].min}°</span>
                          : <span className="st-weather-na">–</span>}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
        <ElevationChart />
        <p className="stages-note">Stigningsdata er GPS-verifisert fra Garmin Fenix (florus.no/massiv). Dag 8–9 og 14–15 er estimert fra tilstøtende seksjoner på lignende terreng. Totalt: ~15 350 m.</p>
      </div>
    </section>
  );
}

function Preparations() {
  return (
    <section id="forberedelser">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Om turen
      </h2>
      <div className="prep-content">
        <h3>Om ruten</h3>
        <p>
          Massiv er DNTs lengste sammenhengende fjellrute — 341 kilometer fra
          Sota Sæter i Breheimen til Haukeliseter på Hardangervidda. Ruten
          krysser fire av Norges mest spektakulære fjellregioner: Breheimen,
          Jotunheimen, Skarvheimen og Hardangervidda. Total høydeøkning
          overstiger 15 000 meter, med høyeste punkt på Fannaråken (2 068 m).
        </p>
        <p>
          Hardangervidda-delen — 122,8 km over det største fjellplatået i
          Nord-Europa — ble fullført på ski i vintervær mellom 21. og 25. mars
          2026, med DNTs godkjenning som en del av den fullstendige
          Massiv-stempelsamlingen. Denne sommeren gjenstår de 12 etappene fra
          Sota Sæter til Finsehytta, med overnatting på DNT-hytter og lett sekk.
        </p>

        <div className="prep-stats-split">
          <div className="prep-stats-group">
            <div className="prep-stats-group-title">
              Sommer 2026 <span className="prep-tag prep-tag-upcoming">Kommer</span>
            </div>
            <div className="prep-stats">
              <div><span className="stat-label">Distanse</span><span className="stat-value"><CountUp target={246} suffix=" km" /></span></div>
              <div><span className="stat-label">Varighet</span><span className="stat-value"><CountUp target={12} suffix=" dager" /></span></div>
              <div><span className="stat-label">Høydeøkning</span><span className="stat-value"><CountUp target={11253} prefix="~" suffix=" m" /></span></div>
              <div><span className="stat-label">Høyeste punkt</span><span className="stat-value">Fannaråken 2 068 m</span></div>
              <div><span className="stat-label">Start</span><span className="stat-value">2. august 2026</span></div>
              <div><span className="stat-label">Overnatting</span><span className="stat-value">DNT-hytter</span></div>
            </div>
          </div>
          <div className="prep-stats-group">
            <div className="prep-stats-group-title">
              Vinter 2026 <span className="prep-tag prep-tag-done">Fullført ✓</span>
            </div>
            <div className="prep-stats">
              <div><span className="stat-label">Distanse</span><span className="stat-value">122,8 km</span></div>
              <div><span className="stat-label">Varighet</span><span className="stat-value">6 dager</span></div>
              <div><span className="stat-label">Høydeøkning</span><span className="stat-value">~4 100 m</span></div>
              <div><span className="stat-label">Datoer</span><span className="stat-value">21–25. mars 2026</span></div>
              <div><span className="stat-label">Type</span><span className="stat-value">Langrenn</span></div>
              <div><span className="stat-label">Overnatting</span><span className="stat-value">DNT-hytter</span></div>
            </div>
          </div>
        </div>

        <h3>Utstyr</h3>
        <img src="/gear.jpg" alt="All gear laid out before the hike" className="gear-photo" />
        <div className="gear-grid">
          <div className="gear-category">
            <div className="gear-cat-title">Sekk</div>
            <ul>
              <li>Osprey Talon 44</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Sove / Ly</div>
            <ul>
              <li>Jerven-pose (nødly)</li>
              <li>Silkelaken</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Klær</div>
            <ul>
              <li>Reserve t-skjorte</li>
              <li>Langermet merinotrøye</li>
              <li>Tykk ullgenser</li>
              <li>Ull-halsedisse</li>
              <li>Reserve undertøy</li>
              <li>Ull baselayer-bukse</li>
              <li>Reserve shorts</li>
              <li>Turbuks</li>
              <li>Vindjakke</li>
              <li>Regnjakke</li>
              <li>Dunjakke</li>
              <li>Regnbukse</li>
              <li>Ullhue</li>
              <li>To-lags hansker</li>
              <li>Reserve ullsokker</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Fottøy</div>
            <ul>
              <li>Reserve tursko (Salomon)</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Kjøkken</div>
            <ul>
              <li>Lommekniv</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Mat (nødrasjoner)</div>
            <ul>
              <li>Lefser</li>
              <li>Sjokolade</li>
              <li>Tubeost</li>
              <li>Knekkebrød</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Navigasjon</div>
            <ul>
              <li>DNT-nøkkel</li>
              <li>Massiv-kort</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Elektronikk</div>
            <ul>
              <li>Powerbank</li>
              <li>Ladekabler</li>
              <li>Ørepropper</li>
              <li>Hodelykt</li>
              <li>Garmin inReach</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Sikkerhet / Førstehjelp</div>
            <ul>
              <li>Førstehjelpsutstyr</li>
              <li>Sårsmør</li>
              <li>Sportstape</li>
              <li>Paracetamol</li>
              <li>Individuell bandasje (traumapakke)</li>
              <li>Søvnhjelpsmidler</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Sol og insektbeskyttelse</div>
            <ul>
              <li>Solkrem</li>
              <li>Insektmiddel</li>
              <li>Hodenett</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Hygiene</div>
            <ul>
              <li>Håndkle</li>
              <li>Toalettmappe (tannbørste, tannkrem)</li>
              <li>Våtservietter</li>
              <li>Toalettpapir</li>
              <li>Flytende såpe</li>
              <li>Neglsaks</li>
              <li>Deodorant</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Hydrering</div>
            <ul>
              <li>Vannflaske (tom)</li>
              <li>Kopp</li>
            </ul>
          </div>
          <div className="gear-category">
            <div className="gear-cat-title">Diverse</div>
            <ul>
              <li>Betalingskort</li>
            </ul>
          </div>
        </div>
        <h3>Planlegging</h3>
        <p>
          Reisen starter i Oslo 1.–2. august. Søndag morgen tar jeg toget fra Oslo
          til Otta, deretter buss videre til Bismo, og til slutt en forhåndsbestilt
          taxi/minibuss fra Bismo opp til Sota Sæter på ettermiddagen — det offisielle
          startpunktet for ruten.
        </p>
        <p>
          Underveis har jeg bestilt to netter på betjente hytter: Sognefjellshytta (dag 2)
          og Fannaråkhytta (dag 3). Jeg har også leid brevandringsfører for kryssingen
          av Fannarådbrean på vei til Fannaråkhytta.
        </p>
        <p>
          Utover de to forhåndsbestilte nettene er overnattingen ikke planlagt. Jeg
          reiser lett uten telt og overnatter på DNT-hytter hver natt.
        </p>
        <p>
          For hjemreisen er planen å ta buss fra Haukeliseter til Oslo når jeg
          ankommer målstreken, og kjøre hjem derfra.
        </p>
      </div>
    </section>
  );
}

function PreviousTrips() {
  return (
    <section id="tidligere-turer">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Previous trips
      </h2>
      <div className="prev-trips-placeholder">
        <p>Photos coming.</p>
      </div>
    </section>
  );
}
