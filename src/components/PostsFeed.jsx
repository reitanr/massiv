import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase.js";

// Viser innleggene dine (bilde + tekst) nyeste først.
// Du legger inn nye innlegg fra Supabase (Table editor) når du har
// dekning – eller vi bygger en enkel admin-side senere.
export default function PostsFeed() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("laster");

  useEffect(() => {
    if (!supabaseReady) {
      setStatus("mangler-nøkler");
      return;
    }
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setStatus("feil");
          return;
        }
        setPosts(data || []);
        setStatus("klar");
      });
  }, []);

  return (
    <section className="feed" id="dagbok">
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
        {posts.map((post) => (
          <article className="post" key={post.id}>
            {post.image_url && (
              <img className="post-img" src={post.image_url} alt="" loading="lazy" />
            )}
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
        ))}
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
