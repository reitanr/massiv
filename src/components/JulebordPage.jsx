import { useEffect, useState } from "react";
import { config } from "../config.js";
import { supabase, supabaseReady } from "../lib/supabase.js";

// Julebord-påmelding: alle kan krysse av datoer og foreslå sted.
// Skriving styres av RLS-regelen for julebord_signups i supabase-schema.sql.
const DATES = [
  ["2026-11-27", "fre 27. nov"], ["2026-11-28", "lør 28. nov"],
  ["2026-12-04", "fre 4. des"], ["2026-12-05", "lør 5. des"],
  ["2026-12-11", "fre 11. des"], ["2026-12-12", "lør 12. des"],
  ["2026-12-18", "fre 18. des"], ["2026-12-19", "lør 19. des"],
  ["2026-12-26", "lør 26. des"], ["2026-12-30", "ons 30. des"],
];

export default function JulebordPage() {
  const [signups, setSignups] = useState([]);
  const [name, setName] = useState("");
  const [dates, setDates] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (supabaseReady) load();
  }, []);

  function load() {
    supabase
      .from("julebord_signups")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => setSignups(data || []));
  }

  function toggle(iso) {
    setDates((d) => (d.includes(iso) ? d.filter((x) => x !== iso) : [...d, iso]));
  }

  async function submit() {
    setError("");
    if (!name.trim()) {
      setError("Skriv navnet ditt.");
      return;
    }
    if (dates.length === 0) {
      setError("Kryss av minst én dato.");
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from("julebord_signups")
      .insert({ name: name.trim(), dates, restaurant: restaurant.trim() });
    setSending(false);
    if (error) {
      setError("Kunne ikke sende påmeldingen. Prøv igjen.");
      return;
    }
    setName("");
    setDates([]);
    setRestaurant("");
    setSent(true);
    load();
  }

  const counts = DATES.map(([iso]) => signups.filter((s) => s.dates.includes(iso)));
  const top = Math.max(0, ...counts.map((c) => c.length));
  const wishes = signups.filter((s) => s.restaurant);

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
          <h1 className="prev-trips-title">Julebord 2026</h1>
          <p className="muted">
            Kristiansand, 10–15 stk. Kryss av alle datoene som passer, og skriv gjerne
            hvor du vil dra.
          </p>

          {!supabaseReady && <p className="muted">Påmeldingen er ikke satt opp ennå.</p>}

          {supabaseReady && (
            <>
              <div className="gb-form jb-form">
                <input
                  type="text"
                  placeholder="Navnet ditt"
                  value={name}
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="jb-dates">
                  {DATES.map(([iso, label]) => (
                    <label key={iso} className={dates.includes(iso) ? "jb-date on" : "jb-date"}>
                      <input
                        type="checkbox"
                        checked={dates.includes(iso)}
                        onChange={() => toggle(iso)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <textarea
                  placeholder="Ønske om restaurant eller sted (valgfritt)"
                  value={restaurant}
                  maxLength={200}
                  rows={2}
                  onChange={(e) => setRestaurant(e.target.value)}
                />
                {error && <p className="gb-error">{error}</p>}
                {sent && !error && <p className="jb-ok">Takk, du er påmeldt!</p>}
                <button onClick={submit} disabled={sending}>
                  {sending ? "Sender…" : "Meld meg på"}
                </button>
              </div>

              <h2 className="jb-sub">Hvem kan når</h2>
              {signups.length === 0 && <p className="muted">Ingen har meldt seg på ennå.</p>}
              {signups.length > 0 && (
                <ul className="jb-tally">
                  {DATES.map(([iso, label], i) => (
                    <li key={iso} className={top > 0 && counts[i].length === top ? "top" : ""}>
                      <span className="jb-label">{label}</span>
                      <span className="jb-n">{counts[i].length}</span>
                      <span className="jb-who">{counts[i].map((s) => s.name).join(", ")}</span>
                    </li>
                  ))}
                </ul>
              )}

              {wishes.length > 0 && (
                <>
                  <h2 className="jb-sub">Ønsker om sted</h2>
                  <ul className="gb-list">
                    {wishes.map((s) => (
                      <li key={s.id}>
                        <p className="gb-msg">{s.restaurant}</p>
                        <p className="gb-from">— {s.name}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
