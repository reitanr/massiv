import { useEffect, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase.js";

// Gjestebok: alle kan lese og skrive en hilsen.
// Skriving styres av RLS-regelen i supabase-schema.sql.
export default function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (supabaseReady) load();
  }, []);

  function load() {
    supabase
      .from("guestbook")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setEntries(data || []));
  }

  async function submit() {
    setError("");
    if (!name.trim() || !message.trim()) {
      setError("Please fill in both your name and a message.");
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from("guestbook")
      .insert({ name: name.trim(), message: message.trim() });
    setSending(false);
    if (error) {
      setError("Could not send your message. Please try again.");
      return;
    }
    setName("");
    setMessage("");
    load();
  }

  if (!supabaseReady) return null;

  return (
    <section className="guestbook" id="gjestebok">
      <h2 className="section-title">
        <span className="t-mark" aria-hidden="true" />
        Guestbook
      </h2>

      <div className="gb-form">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Leave a message for Robert…"
          value={message}
          maxLength={500}
          rows={3}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className="gb-error">{error}</p>}
        <button onClick={submit} disabled={sending}>
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>

      <ul className="gb-list">
        {entries.map((e) => (
          <li key={e.id}>
            <p className="gb-msg">{e.message}</p>
            <p className="gb-from">— {e.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
