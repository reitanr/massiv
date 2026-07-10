// api/new-post.js
// Tar imot tittel, tekst og bilder fra mobilsiden og lagrer i Supabase.
// Beskyttes av en PIN satt i Vercel-miljøvariabelen ADMIN_PIN.

import Busboy from 'busboy';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const fields = {};
  const images = [];

  await new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    busboy.on('field', (name, value) => { fields[name] = value; });
    busboy.on('file', (name, stream, info) => {
      const { filename, mimeType } = info;
      if (!mimeType?.startsWith('image/')) { stream.resume(); return; }
      const chunks = [];
      stream.on('data', c => chunks.push(c));
      stream.on('end', () => {
        // Rens filnavnet for tegn som Supabase Storage ikke godtar
        const raw = filename || `bilde-${Date.now()}.jpg`;
        const safe = raw.replace(/[^a-zA-Z0-9._-]/g, '_');
        images.push({ filename: safe, mimeType, buffer: Buffer.concat(chunks) });
      });
    });
    busboy.on('finish', resolve);
    busboy.on('error', reject);
    req.pipe(busboy);
  });

  // Valider PIN
  if (fields.pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Feil PIN' });
  }

  // Opprett innlegg
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({ title: fields.title || 'Uten tittel', body: fields.body || '' })
    .select()
    .single();

  if (postError) return res.status(500).json({ error: postError.message });

  // Last opp bilder og knytt til innlegget
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const path = `${post.id}/${Date.now()}-${img.filename}`;

    const { error: uploadError } = await supabase.storage
      .from('bilder')
      .upload(path, img.buffer, { contentType: img.mimeType });

    if (uploadError) { console.error('Bildeopplasting feil:', uploadError); continue; }

    const { data: urlData } = supabase.storage.from('bilder').getPublicUrl(path);

    await supabase.from('post_media').insert({
      post_id: post.id,
      url: urlData.publicUrl,
      type: 'image',
      sort_order: i,
    });
  }

  return res.status(200).json({ ok: true, post_id: post.id });
}
