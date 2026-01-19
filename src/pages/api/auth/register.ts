import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { pool } from "../../../lib/db"; // PostgreSQL connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Security Check: Verify if it is a Dify tool or authorized request
  const authHeader = req.headers.authorization;
  const toolSecret = process.env.DIFY_TOOL_SECRET;

  // If a Secret is configured, perform Bearer Token verification
  if (toolSecret && authHeader !== `Bearer ${toolSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Access to the registration endpoint is not allowed' });
  }

  // 2. Request Method Check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  // 3. Field Integrity Check
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields: Please provide name, email, and password" });
  }

  try {
    // 4. Check if user already exists
    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered: This email is already in use" });
    }

    // 5. Password Encryption
    const hashed = await bcrypt.hash(password, 10);

    // 6. Write to Database
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role",
      [name, email, hashed, "user", false]
    );

    const user = result.rows[0];

    // Trigger n8n Webhook to send email
    const n8nWebhookUrl = process.env.N8N_REGISTRATION_WEBHOOK_URL;
    console.log('Target n8n URL:', n8nWebhookUrl);
    if (n8nWebhookUrl) {
      try {
        console.log("正在呼叫 n8n...");
        const n8nRes = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user.name, email: user.email }),
        });
        console.log("n8n 回傳狀態碼:", n8nRes.status);
      } catch (fetchErr) {
        console.error("n8n 呼叫徹底失敗:", fetchErr);
      }
    }
    /*
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: "user_registered",
          name: user.name,
          email: user.email,
          timestamp: new Date().toISOString()
        }),
      }).catch(err => console.error('[n8n Webhook Error]:', err.message));
    }
    */

    // 7. Set Session Cookie
    res.setHeader(
      "Set-Cookie",
      `token=${user.id}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}` 
    );

    // 8. Return Success Response
    return res.status(201).json({ 
      status: 'success',
      message: 'Registration request received and being processed',
      user 
    });

  } catch (err: any) {
    // 9. Fault Protection and Logging
    console.error('[Register API Error]:', err.message);
    return res.status(500).json({ error: "Internal server error: Database connection abnormality" });
  }
}