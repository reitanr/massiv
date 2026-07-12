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
            <li><a href="#dagbok">Dagbok</a></li>
            <li><a href="#galleri">Galleri</a></li>
            <li><a href="#kart">Kart</a></li>
            <li><a href="#forberedelser">Forberedelser</a></li>
            <li><a href="#gjestebok">Gjestebok</a></li>
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
          <p>{config.walker} · {config.startDato} · Sporet live via Garmin inReach</p>
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
        Forberedelser
      </h2>
      <div className="prep-content">
        <h3>Om turen</h3>
        <p>
          Massiv er DNTs lengste sammenhengende fottur – 341 kilometer fra
          Sota Sæter i Breheimen til Haukeliseter på Hardangervidda. Ruten
          krysser fire av Norges villeste fjellområder: Breheimen, Jotunheimen,
          Skarvheimen og Hardangervidda. Totalt passerer man over 9 000
          høydemeter, med høyeste punkt på Fannaråken (2 068 moh). Turen er
          beregnet til 18 vandredager, med overnatting delvis på DNT-hytter
          og delvis i telt.
        </p>
        <h3>Utstyr</h3>
        <p>Kommer.</p>
        <h3>Planlegging</h3>
        <p>Kommer.</p>
      </div>
    </section>
  );
}
