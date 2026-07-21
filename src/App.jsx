import { useState, useEffect, useRef } from "react";
import { config } from "./config.js";
import LiveMap from "./components/LiveMap.jsx";
import PostsFeed from "./components/PostsFeed.jsx";
import Guestbook from "./components/Guestbook.jsx";
import Gallery from "./components/Gallery.jsx";
import NewPost from "./components/NewPost.jsx";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(
    () => window.location.hash === "#ny-post"
  );

  useEffect(() => {
    const handler = () => setIsAdmin(window.location.hash === "#ny-post");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (isAdmin) return <NewPost />;

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
            <li><a href="#dagbok">Diary</a></li>
            <li><a href="#galleri">Gallery</a></li>
            <li><a href="#kart">Map</a></li>
            <li><a href="#stages">Stages</a></li>
            <li><a href="#forberedelser">About</a></li>
            <li><a href="#gjestebok">Guestbook</a></li>
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
            <span>↓</span> Follow the journey live
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
          <PostsFeed />
          <Gallery />
          <LiveMap />
          <Stages />
          <Preparations />
          <Guestbook />
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="t-mark on-dark" aria-hidden="true" />
          <p>{config.walker} · {config.startDato} · Tracked live via Garmin inReach</p>
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
  { day: 13, from: "Finsehytta",       to: "Krækkja",          region: "Hardangervidda", km: 25, ascent:  797, diff: 3, lat: 60.29622, lon: 7.65044 },
  { day: 14, from: "Krækkja",          to: "Stigstuv",         region: "Hardangervidda", km: 20, ascent:  700, diff: 2, lat: 60.17827, lon: 7.47458 },
  { day: 15, from: "Stigstuv",         to: "Sandhaug",         region: "Hardangervidda", km: 24, ascent:  644, diff: 2, lat: 60.10117, lon: 7.14813 },
  { day: 16, from: "Sandhaug",         to: "Litlos",           region: "Hardangervidda", km: 27, ascent:  661, diff: 3, lat: 59.92119, lon: 7.20840 },
  { day: 17, from: "Litlos",           to: "Hellevassbu",      region: "Hardangervidda", km: 18, ascent:  552, diff: 1, lat: 59.83438, lon: 7.21119 },
  { day: 18, from: "Hellevassbu",      to: "Haukeliseter",     region: "Hardangervidda", km: 23, ascent:  743, diff: 3, lat: 59.82377, lon: 7.19460 },
];

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
            <div className="rc-row"><span className="rc-lbl">Stages</span><span className="rc-val">{days}</span></div>
            <div className="rc-row"><span className="rc-lbl">Distance</span><span className="rc-val">{km} km</span></div>
            <div className="rc-row"><span className="rc-lbl">Ascent</span><span className="rc-val">{ascent.toLocaleString()} m</span></div>
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
      <p className="elev-chart-note">Ascent per day — colours show region. Day 2 is the hardest with {max.toLocaleString()} m.</p>
    </div>
  );
}

function diffDots(n) {
  const color = n <= 2 ? "#2a7d1e" : n === 3 ? "#c07020" : "#c0392b";
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className="diff-dot" style={{ background: i < n ? color : "#ddd9d0" }} />
  ));
}

function Stages() {
  const [weather, setWeather] = useState({});

  useEffect(() => {
    const hikeStart = config.hikeStartDate
      ? new Date(config.hikeStartDate + "T00:00:00Z")
      : new Date();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const toFetch = STAGES.filter((s) => {
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
        Stages
      </h2>
      <div className="stages-wrap">
        <RegionCards />
        <table className="stages-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Route</th>
              <th>Region</th>
              <th>km</th>
              <th>Ascent</th>
              <th>Difficulty</th>
              <th>Weather</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => (
              <tr key={s.day}>
                <td className="st-day">{s.day}</td>
                <td className="st-route">{s.from} → {s.to}</td>
                <td>
                  <span className="st-region" style={{ borderColor: REGION_COLOR[s.region], color: REGION_COLOR[s.region] }}>
                    {s.region}
                  </span>
                </td>
                <td className="st-num">{s.km}</td>
                <td className="st-num">{s.ascent.toLocaleString()} m</td>
                <td className="st-diff">{diffDots(s.diff)}</td>
                <td className="st-weather">
                  {weather[s.day]
                    ? <span>{weatherEmoji(weather[s.day].symbol)} {weather[s.day].max}°/{weather[s.day].min}°</span>
                    : <span className="st-weather-na">–</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ElevationChart />
        <p className="stages-note">Ascent figures are GPS-verified from Garmin Fenix data (florus.no/massiv). Days 8–9 and 14–15 are approximated from adjacent sections on similar terrain. Total: ~15,350 m.</p>
      </div>
    </section>
  );
}

function Preparations() {
  return (
    <section id="forberedelser">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        About
      </h2>
      <div className="prep-content">
        <h3>About the route</h3>
        <p>
          Massiv is DNT's longest continuous hiking trail — 341 kilometres from
          Sota Sæter in Breheimen to Haukeliseter on Hardangervidda. The route
          crosses four of Norway's most spectacular mountain regions: Breheimen,
          Jotunheimen, Skarvheimen and Hardangervidda. Total elevation gain
          exceeds 15,000 metres, with the highest point at Fannaråken (2,068 m).
          The trail is planned as 18 hiking days, with nights split between
          DNT mountain huts and tent camping.
        </p>

        <div className="prep-stats">
          <div><span className="stat-label">Distance</span><span className="stat-value"><CountUp target={341} suffix=" km" /></span></div>
          <div><span className="stat-label">Duration</span><span className="stat-value"><CountUp target={18} suffix=" days" /></span></div>
          <div><span className="stat-label">Elevation gain</span><span className="stat-value"><CountUp target={15350} prefix="~" suffix=" m" /></span></div>
          <div><span className="stat-label">Highest point</span><span className="stat-value">Fannaråken 2,068 m</span></div>
          <div><span className="stat-label">Season</span><span className="stat-value">July – August</span></div>
          <div><span className="stat-label">Difficulty</span><span className="stat-value">Strenuous</span></div>
          <div><span className="stat-label">Accommodation</span><span className="stat-value">Huts &amp; tent</span></div>
          <div><span className="stat-label">Mountain regions</span><span className="stat-value">4</span></div>
        </div>

        <h3>Gear</h3>
        <p>Coming.</p>
        <h3>Planning</h3>
        <p>Coming.</p>
      </div>
    </section>
  );
}
