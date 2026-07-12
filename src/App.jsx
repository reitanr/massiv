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
