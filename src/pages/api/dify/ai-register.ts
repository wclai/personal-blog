import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, conversationId } = req.body;
  const apiUrl = process.env.DIFY_API_URL?.replace(/\/$/, '');
  const apiKey = process.env.DIFY_AGENT_API_KEY; 

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'Dify configuration missing' });
  }

  try {
    // 關鍵修正：將 response_mode 改為 'streaming' 以符合 Agent 應用的要求
    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {}, 
        query: query,
        response_mode: 'streaming', 
        user: 'portfolio_visitor',
        conversation_id: conversationId || null, 
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Dify error: ${errText}` });
    }

    // 後端處理串流：將分散的數據片段組合成完整的回答
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullAnswer = "";
    let finalConversationId = conversationId;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue;
          
          try {
            const json = JSON.parse(line.substring(5));
            // 抓取訊息片段 (answer)
            if (json.event === 'message' || json.event === 'agent_message') {
              fullAnswer += json.answer || "";
            }
            // 抓取對話 ID
            if (json.conversation_id) {
              finalConversationId = json.conversation_id;
            }
          } catch (e) {
            // 忽略非 JSON 片段
          }
        }
      }
    }

    // 回傳給前端原本預期的格式
    res.status(200).json({
      text: fullAnswer || "Agent has executed but no text returned",
      conversationId: finalConversationId
    });

  } catch (error: any) {
    console.error('Agent Bridge Error:', error);
    res.status(500).json({ error: 'Connection to Dify failed, please check Docker status' });
  }
}