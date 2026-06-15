import { createClient } from "@supabase/supabase-js";

// Disse hentes fra .env (lokalt) og fra Environment Variables i Vercel.
// VITE_-prefikset gjør at Vite eksponerer dem til nettleseren.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// anon-nøkkelen er ment å være offentlig. Sikkerheten ligger i
// Row Level Security-reglene i Supabase (se supabase-schema.sql).
export const supabase = createClient(url, anonKey);

// Praktisk flagg så appen kan vise en pen melding hvis nøklene mangler,
// i stedet for å krasje.
export const supabaseReady = Boolean(url && anonKey);
