/**
 * beauty fish｜Vercel Webhook API
 * Edge Runtime 版本 - 避免 timeout 問題
 */

export const config = {
  runtime: 'edge',
};

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyeI9X0gFMZREwQ-dinwJqlgUEx2dsNy_ZGMdW0RE3C7rjrrRBxR-KkXDM5uA_XWcx19A/exec';

export default async function handler(req) {
  // 非 POST 直接回傳
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    console.log('Webhook body:', JSON.stringify(body));

    if (body && body.events && body.events.length > 0) {
      // 非同步轉發給 GAS，不等待回應
      fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4500)
      }).catch(err => console.error('GAS error:', err.message));
    }
  } catch (err) {
    console.error('Webhook parse error:', err);
  }

  // 立刻回傳 200 給 LINE
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
