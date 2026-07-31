// api/list-photos.js
// Lister filer i en mappe i Supabase Storage ved hjelp av service role-nøkkelen.
// Brukes av PreviousTripsPage for å hente bilder fra "bilder/tidligere-turer/".

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const folder = req.query.folder || 'tidligere-turer';

  const { data, error } = await supabase.storage
    .from('bilder')
    .list(folder, { sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const files = (data || [])
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => {
      const { data: urlData } = supabase.storage
        .from('bilder')
        .getPublicUrl(`${folder}/${f.name}`);
      return urlData.publicUrl;
    });

  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ urls: files });
}
