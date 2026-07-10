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
                {post.body && renderBody(post.body)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// Gjenkjenner YouTube-lenker og viser dem som innebygde videospillere
function renderBody(text) {
  const ytRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s]*/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = ytRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) parts.push({ type: "text", content: before });
    }
    parts.push({ type: "youtube", id: match[1] });
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining) parts.push({ type: "text", content: remaining });
  if (parts.length === 0) parts.push({ type: "text", content: text });

  return parts.map((part, i) =>
    part.type === "youtube" ? (
      <div key={i} className="post-video">
        <iframe
          src={`https://www.youtube.com/embed/${part.id}`}
          title="YouTube-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    ) : (
      <p key={i} className="post-text">{part.content}</p>
    )
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
