import crypto from 'node:crypto';

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer|string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a || '');
  const bb = Buffer.from(b || '');
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const secret = process.env.LINE_CHANNEL_SECRET;
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!secret || !appsScriptUrl) return res.status(500).send('LINE webhook is not configured');

  try {
    const rawBody = await readRawBody(req);
    const signature = String(req.headers['x-line-signature'] || '');
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

    if (!safeEqual(signature, expected)) return res.status(401).send('Invalid signature');

    const webhook = JSON.parse(rawBody);
    const events = Array.isArray(webhook.events) ? webhook.events : [];

    for (const event of events) {
      const source = event?.source;
      if (!source?.type) continue;

      const id =
        source.type === 'group' ? source.groupId :
        source.type === 'room' ? source.roomId :
        source.userId;

      if (!id) continue;

      let name = source.type === 'group' ? 'LINE Group' : source.type === 'room' ? 'LINE Room' : 'LINE User';

      if (source.type === 'group') {
        try {
          const summary = await fetch(`https://api.line.me/v2/bot/group/${encodeURIComponent(id)}/summary`, {
            headers:{ Authorization:`Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN || ''}` }
          });
          if (summary.ok) {
            const data = await summary.json();
            name = data.groupName || name;
          }
        } catch {}
      }

      await fetch(appsScriptUrl, {
        method:'POST',
        headers:{ 'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8' },
        body:new URLSearchParams({
          action:'saveLineChat',
          payload:JSON.stringify({
            id,
            type:source.type,
            name,
            lastSeenAt:new Date().toISOString(),
          }),
        }).toString(),
      });
    }

    return res.status(200).send('OK');
  } catch (error) {
    return res.status(400).send('Bad request');
  }
}
