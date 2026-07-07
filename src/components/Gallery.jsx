import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase.js";

// Viser alle bilder fra post_media, nyeste innlegg øverst.
export default function Gallery() {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("laster");

  useEffect(() => {
    if (!supabaseReady) { setStatus("klar"); return; }
    supabase
      .from("post_media")
      .select("*, posts(title, created_at)")
      .eq("type", "image")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { setStatus("feil"); return; }
        setImages(data || []);
        setStatus("klar");
      });
  }, []);

  return (
    <section id="galleri">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Galleri
      </h2>

      {status === "laster" && <p className="muted">Laster bilder …</p>}
      {status === "klar" && images.length === 0 && (
        <p className="gallery-empty">
          Bilder fra turen dukker opp her etter hvert som innlegg sendes inn.
        </p>
      )}

      {images.length > 0 && (
        <div className="gallery-grid">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={img.posts?.title || "Bilde fra turen"}
              loading="lazy"
            />
          ))}
        </div>
      )}
    </section>
  );
}
