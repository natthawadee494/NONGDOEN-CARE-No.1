export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ success:false, message:'Method not allowed' });
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ success:false, message:'LINE_CHANNEL_ACCESS_TOKEN is not configured' });

  const { chatId, message } = req.body || {};
  if (!chatId || !message || typeof message !== 'string') {
    return res.status(400).json({ success:false, message:'chatId and message are required' });
  }

  try {
    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${token}`,
      },
      body:JSON.stringify({
        to:String(chatId),
        messages:[{ type:'text', text:message.slice(0,5000) }],
      }),
    });
    if (!lineResponse.ok) {
      const detail = await lineResponse.text();
      return res.status(lineResponse.status).json({ success:false, message:'LINE rejected the message', detail });
    }
    return res.status(200).json({ success:true });
  } catch (error) {
    return res.status(502).json({ success:false, message:'LINE service unavailable' });
  }
}
