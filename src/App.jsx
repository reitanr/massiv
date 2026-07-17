import { useState, useEffect } from "react";
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
  { day: 1,  from: "Sota Sæter",      to: "Nørdstedalseter",  region: "Breheimen",      km: 24, ascent: 1691, diff: 4 },
  { day: 2,  from: "Nørdstedalseter", to: "Sognefjellshytta", region: "Breheimen",      km: 25, ascent: 1838, diff: 5 },
  { day: 3,  from: "Sognefjellshytta",to: "Fannaråkhytta",    region: "Jotunheimen",    km: 18, ascent:  895, diff: 4 },
  { day: 4,  from: "Fannaråkhytta",   to: "Skogadalsbøen",    region: "Jotunheimen",    km: 11, ascent:  200, diff: 2 },
  { day: 5,  from: "Skogadalsbøen",   to: "Fondsbu",          region: "Jotunheimen",    km: 24, ascent:  550, diff: 3 },
  { day: 6,  from: "Fondsbu",         to: "Slettningsbu",     region: "Jotunheimen",    km: 23, ascent:  300, diff: 3 },
  { day: 7,  from: "Slettningsbu",    to: "Sulebu",           region: "Jotunheimen",    km: 17, ascent:  300, diff: 2 },
  { day: 8,  from: "Sulebu",          to: "Skarvheim",        region: "Skarvheimen",    km: 19, ascent:  450, diff: 3 },
  { day: 9,  from: "Skarvheim",       to: "Bjordalsbu",       region: "Skarvheimen",    km: 13, ascent:  400, diff: 3 },
  { day: 10, from: "Bjordalsbu",      to: "Iungsdalshytta",   region: "Skarvheimen",    km: 16, ascent:  350, diff: 3 },
  { day: 11, from: "Iungsdalshytta",  to: "Geiterygghytta",   region: "Skarvheimen",    km: 29, ascent:  550, diff: 5 },
  { day: 12, from: "Geiterygghytta",  to: "Finsehytta",       region: "Skarvheimen",    km: 16, ascent:  300, diff: 3 },
  { day: 13, from: "Finsehytta",      to: "Krækkja",          region: "Hardangervidda", km: 24, ascent:  300, diff: 2 },
  { day: 14, from: "Krækkja",         to: "Stigstuv",         region: "Hardangervidda", km: 20, ascent:  200, diff: 2 },
  { day: 15, from: "Stigstuv",        to: "Sandhaug",         region: "Hardangervidda", km: 23, ascent:  200, diff: 2 },
  { day: 16, from: "Sandhaug",        to: "Litlos",           region: "Hardangervidda", km: 25, ascent:  200, diff: 3 },
  { day: 17, from: "Litlos",          to: "Hellevassbu",      region: "Hardangervidda", km: 16, ascent:  150, diff: 1 },
  { day: 18, from: "Hellevassbu",     to: "Haukeliseter",     region: "Hardangervidda", km: 21, ascent:  350, diff: 3 },
];

const REGION_COLOR = {
  Breheimen:      "#2a7d1e",
  Jotunheimen:    "#1a6fc4",
  Skarvheimen:    "#7b3fa0",
  Hardangervidda: "#c07020",
};

function diffDots(n) {
  const color = n <= 2 ? "#2a7d1e" : n === 3 ? "#c07020" : "#c0392b";
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className="diff-dot" style={{ background: i < n ? color : "#ddd9d0" }} />
  ));
}

function Stages() {
  return (
    <section id="stages">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Stages
      </h2>
      <div className="stages-wrap">
        <table className="stages-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Route</th>
              <th>Region</th>
              <th>km</th>
              <th>Ascent</th>
              <th>Difficulty</th>
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
              </tr>
            ))}
          </tbody>
        </table>
        <p className="stages-note">Elevation figures for days 1–3 are from field records. Remaining stages are calculated estimates summing to the route total of 9,234 m.</p>
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
          exceeds 9,000 metres, with the highest point at Fannaråken (2,068 m).
          The trail is planned as 18 hiking days, with nights split between
          DNT mountain huts and tent camping.
        </p>

        <div className="prep-stats">
          <div><span className="stat-label">Distance</span><span className="stat-value">341 km</span></div>
          <div><span className="stat-label">Duration</span><span className="stat-value">18 days</span></div>
          <div><span className="stat-label">Elevation gain</span><span className="stat-value">9,234 m</span></div>
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
