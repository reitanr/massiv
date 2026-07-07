import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase.js";

export default function PostsFeed() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("laster");

  useEffect(() => {
    if (!supabaseReady) {
      setStatus("mangler-nøkler");
      return;
    }
    // Hent innlegg med tilhørende bilder fra post_media
    supabase
      .from("posts")
      .select("*, post_media(id, url, type, sort_order)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setStatus("feil"); return; }
        setPosts(data || []);
        setStatus("klar");
      });
  }, []);

  return (
    <section id="dagbok">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Dagbok
      </h2>

      {status === "mangler-nøkler" && (
        <p className="muted">Koble til Supabase i .env for å vise dagboka.</p>
      )}
      {status === "laster" && <p className="muted">Laster innlegg …</p>}
      {status === "feil" && (
        <p className="muted">Kunne ikke hente innlegg. Prøv igjen senere.</p>
      )}
      {status === "klar" && posts.length === 0 && (
        <p className="muted">Ingen innlegg ennå. Turen har ikke startet.</p>
      )}

      <div className="posts">
        {posts.map((post) => {
          // Hent bilder sortert på sort_order, forkast ikke-bilde-media
          const images = (post.post_media || [])
            .filter((m) => m.type === "image")
            .sort((a, b) => a.sort_order - b.sort_order);

          // Fallback til gammelt image_url-felt hvis ingen post_media
          const fallbackImg =
            images.length === 0 && post.image_url
              ? [{ id: "fallback", url: post.image_url }]
              : [];
          const allImages = images.length > 0 ? images : fallbackImg;

          return (
            <article className="post" key={post.id}>
              {/* ── Bildevisning ─────────────────────────────── */}
              {allImages.length === 1 && (
                <img
                  className="post-img"
                  src={allImages[0].url}
                  alt=""
                  loading="lazy"
                />
              )}
              {allImages.length > 1 && (
                <div className={`post-img-grid cols-${Math.min(allImages.length, 3)}`}>
                  {allImages.map((img) => (
                    <img key={img.id} src={img.url} alt="" loading="lazy" />
                  ))}
                </div>
              )}

              {/* ── Tekst ────────────────────────────────────── */}
              <div className="post-body">
                <div className="post-meta">
                  {post.day_number != null && (
                    <span className="day-badge">Dag {post.day_number}</span>
                  )}
                  <time>{formatDate(post.created_at)}</time>
                </div>
                {post.title && <h3>{post.title}</h3>}
                {post.body && <p>{post.body}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("no-NO", {
      day: "numeric",
      month: "long",
    });
  } catch {
    return "";
  }
}
