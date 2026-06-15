# Massiv

Turdagbok for **Massiv** – DNTs lengste tur. Live-kart fra Garmin inReach,
bildedagbok og gjestebok. Bygget med Vite + React + Supabase, lagd for å
deployes på Vercel.

---

## Hva som er hva

- `src/config.js` – det meste du vil endre: tittel, navn og **MapShare-navnet**.
- `src/components/LiveMap.jsx` – bygger inn Garmin MapShare-kartet.
- `src/components/PostsFeed.jsx` – henter og viser dagbok-innleggene.
- `src/components/Guestbook.jsx` – gjestebok (les + skriv).
- `supabase-schema.sql` – tabellene og tilgangsreglene i Supabase.

---

## Kom i gang lokalt

1. Installer avhengighetene:
   ```
   npm install
   ```
2. Lag `.env` ut fra malen og fyll inn Supabase-nøklene:
   ```
   cp .env.example .env
   ```
   Verdiene finner du i Supabase: prosjektet ditt → **Settings → API**
   (`Project URL` og `anon public`-nøkkelen).
3. Kjør utviklingsserveren:
   ```
   npm run dev
   ```

---

## Sett opp Supabase

1. Lag et prosjekt på supabase.com.
2. Gå til **SQL Editor → New query**, lim inn hele `supabase-schema.sql`
   og kjør den. Det lager tabellene `posts` og `guestbook` med riktige
   tilgangsregler.
3. Legg inn nøklene i `.env` (se over).

**Legge inn et dagbok-innlegg:** Supabase → **Table editor → posts →
Insert row**. Fyll inn `title`, `body`, evt. `day_number` og `image_url`.
For bilder kan du laste opp i Supabase **Storage** (lag en offentlig bøtte,
f.eks. `bilder`) og lime inn den offentlige URL-en i `image_url`.

---

## Koble til Garmin MapShare

1. Logg inn på Garmin Explore → **Social** → skru på **MapShare**.
2. Skru av «message» og «locate» på den offentlige siden, så fremmede ikke
   kan trigge satellittbruk som koster deg penger.
3. Sett MapShare-navnet ditt i `src/config.js` (`mapShareName`).

---

## Deploy til Vercel

1. Legg prosjektet i et GitHub-repo.
2. Importer repoet i Vercel (rammeverk: **Vite**, oppdages automatisk).
3. Legg inn `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` under
   **Settings → Environment Variables**.
4. Koble til domenet ditt (f.eks. `massiv.robertreitan.no`) under
   **Settings → Domains**.

---

## Bygge videre med Claude Code (uten copy/paste)

Når dette ligger i et GitHub-repo på Mac-en din, kan du la Claude Code
jobbe rett i mappa. Installer det én gang:

```
curl -fsSL https://claude.ai/install.sh | bash
```

Åpne så terminalen i prosjektmappa, skriv `claude`, og be om endringer i
klartekst, f.eks.:

- «Lag en enkel admin-side der jeg kan poste nye innlegg med passord.»
- «Legg til en høydeprofil øverst på siden.»
- «Bytt MapShare-iframen med et eget Leaflet-kart som henter KML-feeden.»

Claude Code redigerer filene, og kan committe og pushe til GitHub for deg –
Vercel deployer da automatisk.
