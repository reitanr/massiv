import { useState, useRef } from "react";

export default function NewPost() {
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState(
    () => sessionStorage.getItem("massiv_pin") || ""
  );
  const [unlocked, setUnlocked] = useState(
    () => !!sessionStorage.getItem("massiv_pin")
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef();

  function handlePinSubmit(e) {
    e.preventDefault();
    sessionStorage.setItem("massiv_pin", pin);
    setSavedPin(pin);
    setUnlocked(true);
  }

  function handleImages(e) {
    const files = Array.from(e.target.files);
    setImages(files);
    const prev = files.map((f) => URL.createObjectURL(f));
    setPreviews(prev);
  }

  function removeImage(i) {
    const newImages = images.filter((_, idx) => idx !== i);
    const newPreviews = previews.filter((_, idx) => idx !== i);
    setImages(newImages);
    setPreviews(newPreviews);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("pin", savedPin);
    fd.append("title", title);
    fd.append("body", body);
    images.forEach((img) => fd.append("images", img));

    try {
      const res = await fetch("/api/new-post", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem("massiv_pin");
          setUnlocked(false);
          setSavedPin("");
          setErrorMsg("Feil PIN — prøv igjen");
        } else {
          setErrorMsg(data.error || "Noe gikk galt");
        }
        setStatus("error");
        return;
      }

      setStatus("ok");
      setTitle("");
      setBody("");
      setImages([]);
      setPreviews([]);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  // ── PIN-skjerm ────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="np-wrap">
        <div className="np-logo">
          <span className="t-mark xl on-dark" aria-hidden="true" />
          <span className="np-logo-text">Massiv</span>
        </div>
        <form className="np-form" onSubmit={handlePinSubmit}>
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN-kode"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="np-submit">
            Logg inn
          </button>
        </form>
      </div>
    );
  }

  // ── Suksessmelding ────────────────────────────────────────
  if (status === "ok") {
    return (
      <div className="np-wrap">
        <div className="np-logo">
          <span className="t-mark xl on-dark" aria-hidden="true" />
          <span className="np-logo-text">Massiv</span>
        </div>
        <div className="np-success">
          <span>✓ Innlegget er publisert!</span>
          <button onClick={() => setStatus("idle")}>Skriv nytt innlegg</button>
        </div>
      </div>
    );
  }

  // ── Skjema ────────────────────────────────────────────────
  return (
    <div className="np-wrap">
      <div className="np-logo">
        <span className="t-mark xl on-dark" aria-hidden="true" />
        <span className="np-logo-text">Massiv</span>
      </div>

      <form className="np-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tittel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Hva skjedde i dag?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
        />

        {/* Bildevalg */}
        <button
          type="button"
          className="np-img-btn"
          onClick={() => fileRef.current.click()}
        >
          📷{" "}
          {images.length === 0
            ? "Legg til bilder"
            : `${images.length} bilde${images.length > 1 ? "r" : ""} valgt`}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImages}
          style={{ display: "none" }}
        />

        {/* Forhåndsvisning */}
        {previews.length > 0 && (
          <div className="np-previews">
            {previews.map((p, i) => (
              <div key={i} className="np-preview-item">
                <img src={p} alt="" />
                <button
                  type="button"
                  className="np-remove-img"
                  onClick={() => removeImage(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {errorMsg && <p className="np-error">{errorMsg}</p>}

        <button
          type="submit"
          className="np-submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Publiserer…" : "Publiser"}
        </button>
      </form>
    </div>
  );
}
