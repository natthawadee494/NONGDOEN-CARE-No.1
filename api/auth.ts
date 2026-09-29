const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxP4YYNASvZvhr7SegtolccPPlM2HcnmTRkZLiUZ04V6r0n-IIv1WncBTLKbaoj5Ga/exec';
function getAppsScriptUrl() {
  let value = String(process.env.APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL).trim();
  value = value.replace(/^\[|\]$/g, '');
  const markdown = value.match(/^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/);
  if (markdown) value = markdown[1];
  if (!/^https?:\/\//i.test(value)) throw new Error('APPS_SCRIPT_URL ไม่ใช่ URL ที่ถูกต้อง');
  return value;
}

async function callAppsScript(action:string, payload:any) {
  const response = await fetch(getAppsScriptUrl(), {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
    body:new URLSearchParams({action,payload:JSON.stringify(payload || {})}).toString(),
    cache:'no-store',
  });
  const text = await response.text();
  let data:any;
  try { data=JSON.parse(text); } catch {
    const preview = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
    throw new Error(`Apps Script ไม่ได้ส่ง JSON (HTTP ${response.status})${preview ? `: ${preview}` : ''}`);
  }
  if (!response.ok || data?.success === false) throw new Error(data?.message || `Apps Script HTTP ${response.status}`);
  return data;
}
export default async function handler(req:any,res:any) {
  if(req.method!=='POST') return res.status(405).json({success:false,message:'Method not allowed'});
  try { getAppsScriptUrl(); } catch(error:any) { return res.status(500).json({success:false,message:error?.message || 'APPS_SCRIPT_URL is not configured'}); }
  try {
    const {action,email,password,user}=req.body || {};
    if(action==='login'){
      if(!email || !password) return res.status(400).json({success:false,message:'กรุณากรอกอีเมลและรหัสผ่าน'});
      return res.status(200).json(await callAppsScript('loginUser',{email:String(email).trim().toLowerCase(),password:String(password)}));
    }
    if(action==='register'){
      if(!user || !user.email || !password) return res.status(400).json({success:false,message:'ข้อมูลลงทะเบียนไม่ครบ'});
      return res.status(200).json(await callAppsScript('registerUser',{...user,password:String(password)}));
    }
    if(action==='setInitialPassword'){
      if(!email || !password) return res.status(400).json({success:false,message:'กรุณากรอกอีเมลและรหัสผ่าน'});
      if(String(password).length < 6) return res.status(400).json({success:false,message:'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'});
      return res.status(200).json(await callAppsScript('setInitialPassword',{email:String(email).trim().toLowerCase(),password:String(password)}));
    }
    return res.status(400).json({success:false,message:'Unknown auth action'});
  } catch(error:any) {
    return res.status(502).json({success:false,message:error?.message || 'เชื่อมต่อระบบบัญชีไม่ได้'});
  }
}
