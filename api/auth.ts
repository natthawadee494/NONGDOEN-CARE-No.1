const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyjRXtsUKZprrFkCM9Z0R0Iffw137qzKL8y10Pz19SaeoQ1dwKwVwtVW8dFNu5yhp3Y/exec';

async function callAppsScript(action:string, payload:any) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
    body:new URLSearchParams({action,payload:JSON.stringify(payload || {})}).toString(),
    cache:'no-store',
  });
  const text = await response.text();
  let data:any;
  try { data=JSON.parse(text); } catch { throw new Error('Apps Script returned invalid JSON'); }
  if (!response.ok || data?.success === false) throw new Error(data?.message || `Apps Script HTTP ${response.status}`);
  return data;
}
export default async function handler(req:any,res:any) {
  if(req.method!=='POST') return res.status(405).json({success:false,message:'Method not allowed'});
  if(!process.env.APPS_SCRIPT_URL) return res.status(500).json({success:false,message:'APPS_SCRIPT_URL is not configured'});
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
    return res.status(400).json({success:false,message:'Unknown auth action'});
  } catch(error:any) {
    return res.status(502).json({success:false,message:error?.message || 'เชื่อมต่อระบบบัญชีไม่ได้'});
  }
}
