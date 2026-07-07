// api/inbound-email.js
// Mottar e-post fra Mailgun og lagrer som dagbokinnlegg i Supabase.
// Emnefeltet → tittel, brødteksten → innhold, bilder som vedlegg → Supabase Storage.

import Busboy from 'busboy';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function verifyMailgunSignature(timestamp, token, signature) {
  const key = process.env.MAILGUN_SIGNING_KEY;
  if (!key) return true; // Hopp over verifisering under utvikling
  const hash = crypto
    .createHmac('sha256', key)
    .update(timestamp + token)
    .digest('hex');
  return hash === signature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const fields = {};
  const images = [];

  // Parser multipart-kroppen fra Mailgun
  await new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('file', (name, stream, info) => {
      const { filename, mimeType } = info;
      if (!mimeType || !mimeType.startsWith('image/')) {
        stream.resume();
        return;
      }
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        images.push({ filename: filename || `bilde-${Date.now()}.jpg`, mimeType, buffer: Buffer.concat(chunks) });
      });
    });

    busboy.on('finish', resolve);
    busboy.on('error', reject);
    req.pipe(busboy);
  });

  // Verifiser at det faktisk er Mailgun som sender
  if (!verifyMailgunSignature(fields.timestamp, fields.token, fields.signature)) {
    return res.status(401).json({ error: 'Ugyldig signatur' });
  }

  // Bruk emnefelt som tittel, stripped-text som innhold (uten sitat fra forrige e-post)
  const title = fields.subject || 'Uten tittel';
  const body = fields['stripped-text'] || fields['body-plain'] || '';

  // Opprett innlegg i Supabase
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({ title, body })
    .select()
    .single();

  if (postError) {
    console.error('Feil ved oppretting av innlegg:', postError);
    return res.status(500).json({ error: postError.message });
  }

  // Last opp bilder til Supabase Storage og knytt dem til innlegget
  for (const img of images) {
    const storagePath = `${post.id}/${Date.now()}-${img.filename}`;

    const { error: uploadError } = await supabase.storage
      .from('bilder')
      .upload(storagePath, img.buffer, {
        contentType: img.mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Feil ved bildeopplasting:', uploadError);
      continue;
    }

    const { data: urlData } = supabase.storage.from('bilder').getPublicUrl(storagePath);

    await supabase.from('post_media').insert({
      post_id: post.id,
      url: urlData.publicUrl,
      type: 'image',
      sort_order: images.indexOf(img),
    });
  }

  console.log(`Nytt innlegg fra e-post: "${title}" (id: ${post.id}), ${images.length} bilde(r)`);
  return res.status(200).json({ ok: true, post_id: post.id });
}
