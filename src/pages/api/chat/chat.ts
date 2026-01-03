// src/pages/api/chat/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Dify API Bridge - 針對 500 AttributeError 修復建議版本
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.DIFY_API_KEY;
  // 確保 apiUrl 指向正確的 Docker 內部或本地位址
  const apiUrl = process.env.DIFY_API_URL || 'http://127.0.0.1/v1';

  if (!apiKey) {
    return res.status(500).json({ error: 'DIFY_API_KEY is missing' });
  }

  const { message, conversation_id, inputs } = req.body;

  try {
    console.log(`[Dify Request] Sending query to ${apiUrl}`);
    
    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        // 修復建議 1: 確保 inputs 至少是一個空物件，有時 undefined 會導致後端解析失敗
        inputs: inputs || {}, 
        query: message,
        response_mode: 'blocking',
        user: 'local-developer',
        conversation_id: conversation_id || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Dify 500 Error Log]:', data);
      
      // 如果 Dify 回傳 500，通常是後端 Python 崩潰
      return res.status(response.status).json({
        error: 'Dify Backend Crash',
        message: 'Dify 後端解析 Gemini 格式失敗 (AttributeError)',
        suggestion: '請嘗試在 Dify 控制台將 Gemini 模型版本切換為較穩定的 Pro 版本，或更新 Dify 至最新版。',
        details: data
      });
    }

    return res.status(200).json({
      answer: data.answer,
      conversation_id: data.conversation_id
    });

  } catch (error: any) {
    console.error('[Dify Connection Error]:', error.message);
    return res.status(503).json({ error: 'Connection Failed', message: error.message });
  }
}