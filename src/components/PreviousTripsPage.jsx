import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase.js";
import { config } from "../config.js";

export default function PreviousTripsPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // url of open photo

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return; }
    supabase.storage
      .from("bilder")
      .list("tidligere-turer", { sortBy: { column: "name", order: "asc" } })
      .then(({ data, error }) => {
        if (!error && data) {
          const urls = data
            .filter((f) => f.name && !f.name.startsWith("."))
            .map((f) => {
              const { data: urlData } = supabase.storage
                .from("bilder")
                .getPublicUrl(`tidligere-turer/${f.name}`);
              return { name: f.name, url: urlData.publicUrl };
            });
          setPhotos(urls);
        }
        setLoading(false);
      });
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const prev = () => {
    const i = photos.findIndex((p) => p.url === lightbox);
    if (i > 0) setLightbox(photos[i - 1].url);
  };
  const next = () => {
    const i = photos.findIndex((p) => p.url === lightbox);
    if (i < photos.length - 1) setLightbox(photos[i + 1].url);
  };

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
          <h1 className="prev-trips-title">Tidligere turer</h1>

          {loading && <p className="muted">Laster bilder…</p>}

          {!loading && photos.length === 0 && (
            <p className="muted">Ingen bilder ennå.</p>
          )}

          {photos.length > 0 && (
            <div className="prev-trips-grid">
              {photos.map((p) => (
                <button
                  key={p.name}
                  className="prev-trips-thumb"
                  onClick={() => setLightbox(p.url)}
                  aria-label="View photo"
                >
                  <img src={p.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          {photos.findIndex((p) => p.url === lightbox) > 0 && (
            <button className="lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          )}
          <img
            src={lightbox}
            alt=""
            className="lb-img"
            onClick={(e) => e.stopPropagation()}
          />
          {photos.findIndex((p) => p.url === lightbox) < photos.length - 1 && (
            <button className="lb-next" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          )}
        </div>
      )}
    </>
  );
}
