import Gallery from "./Gallery.jsx";
import { config } from "../config.js";

export default function GalleryPage() {
  return (
    <>
      <nav className="site-nav">
        <div className="site-nav-inner">
          <a href="#" className="nav-logo" onClick={() => window.location.hash = ""}>
            <span className="t-mark lg on-dark" aria-hidden="true" />
            <span className="nav-logo-text">{config.title}</span>
          </a>
          <a href="#" className="prev-trips-back" onClick={() => window.location.hash = ""}>
            ← Tilbake
          </a>
        </div>
      </nav>
      <main className="content prev-trips-page">
        <div className="container">
          <Gallery />
        </div>
      </main>
    </>
  );
}
