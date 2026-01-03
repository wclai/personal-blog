// src/pages/api/dify/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message } = req.body;
  const apiUrl = process.env.DIFY_API_URL?.replace(/\/$/, '');
  const apiKey = process.env.DIFY_API_KEY;

  try {
    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: "blocking",
        user: "portfolio-user"
      })
    });

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || "Dify API Error" });
      }
      return res.status(200).json({ answer: data.answer });
    } else {
      const text = await response.text();
      // Detect the known Gemini list bug in Dify logs
      if (text.includes("AttributeError") || text.includes("'list' object")) {
        return res.status(500).json({ error: "Dify Model Bug: Please switch Gemini model to 1.5 Pro in Dify UI." });
      }
      return res.status(500).json({ error: "Server error (Non-JSON response)" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Connection failed" });
  }
}