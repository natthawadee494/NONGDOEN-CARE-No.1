export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ success:false, message:'Method not allowed' });
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) return res.status(500).json({ success:false, message:'APPS_SCRIPT_URL is not configured' });
  try {
    const response = await fetch(`${appsScriptUrl}?action=getLineChats&_=${Date.now()}`, { cache:'no-store' });
    const data = await response.json();
    return res.status(response.ok ? 200 : 502).json(data);
  } catch (error) {
    return res.status(502).json({ success:false, message:'LINE chat service unavailable' });
  }
}
