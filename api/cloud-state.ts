const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOP-KdwUtGg-dsKiTBpffg9IV_Gs5Ic-fV3YNX62bZf7ABiMTcEd9Vmru-ya40SisD/exec';

function getAppsScriptUrl() {
  const value = String(process.env.APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL).trim();
  if (!/^https?:\\/\\//i.test(value)) throw new Error('APPS_SCRIPT_URL is invalid');
  return value;
}

async function callAppsScript(action: string, payload?: any) {
  const url = getAppsScriptUrl();
  const body = new URLSearchParams({
    action,
    ...(payload !== undefined ? { payload: JSON.stringify(payload) } : {}),
  }).toString();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
    cache: 'no-store',
  });
  const text = await response.text();
  let data: any;
  try { data = JSON.parse(text); }
  catch {
    const preview = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
    throw new Error(`Apps Script returned invalid JSON (HTTP ${response.status})${preview ? `: ${preview}` : ''}`);
  }
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Apps Script HTTP ${response.status}`);
  }
  return data;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const action = String(req.query?.action || 'getState');
      if (!['getState', 'getUsers', 'assignments'].includes(action)) {
        return res.status(400).json({ success:false, message:'Unknown cloud action' });
      }
      const url = `${getAppsScriptUrl()}?action=${encodeURIComponent(action)}&_=${Date.now()}`;
      const response = await fetch(url, { method:'GET', cache:'no-store', headers:{Accept:'application/json'} });
      const text = await response.text();
      let data:any;
      try { data = JSON.parse(text); }
      catch { throw new Error(`Apps Script returned invalid JSON (HTTP ${response.status})`); }
      return res.status(response.ok ? 200 : 502).json(data);
    }

    if (req.method === 'POST') {
      const { action, payload } = req.body || {};
      if (!action) return res.status(400).json({success:false,message:'action is required'});
      const data = await callAppsScript(String(action), payload || {});
      return res.status(200).json(data);
    }

    return res.status(405).json({success:false,message:'Method not allowed'});
  } catch (error:any) {
    return res.status(502).json({success:false,message:error?.message || 'Cloud service unavailable'});
  }
}
