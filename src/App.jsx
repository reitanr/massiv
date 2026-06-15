import { config } from "./config.js";
import LiveMap from "./components/LiveMap.jsx";
import PostsFeed from "./components/PostsFeed.jsx";
import Guestbook from "./components/Guestbook.jsx";

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="t-mark big" aria-hidden="true" />
            <span className="brand-walker">{config.walker}</span>
          </div>
          <h1>{config.title}</h1>
          <p className="tagline">{config.subtitle}</p>
          <nav className="hero-nav">
            <a href="#kart">Kart</a>
            <a href="#dagbok">Dagbok</a>
            <a href="#gjestebok">Gjestebok</a>
          </nav>
        </div>
      </header>

      <main>
        <LiveMap />
        <PostsFeed />
        <Guestbook />
      </main>

      <footer className="footer">
        <span className="t-mark" aria-hidden="true" />
        <p>
          {config.walker} · {config.startDato} · Følg sporet live via Garmin
          inReach
        </p>
      </footer>
    </div>
  );
}
