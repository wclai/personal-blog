// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { pool } from "../../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "token";

type JwtUserPayload = { sub: number; role: string; email: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookie = req.headers.cookie;

    // No cookie → public visitor
    if (!cookie) return res.status(200).json(null);

    const tokenMatch = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!tokenMatch) return res.status(200).json(null);

    const token = tokenMatch[1];

    let payload: JwtUserPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as unknown as JwtUserPayload;
    } catch {
      // Invalid or expired token → treat as visitor
      return res.status(200).json(null);
    }

    const userId = payload.sub;

    // Fetch user from DB
    const { rows } = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [userId]
    );

    if (!rows.length) {
      // Token valid but user deleted → treat as visitor
      return res.status(200).json(null);
    }

    /*
    const user = rows[0];
    console.log("ME API → Returning user:", user);
    */

    // return user object directly
    return res.status(200).json(rows[0]);

  } catch (err) {
    console.error("Unexpected /api/auth/me error:", err);
    // Always return visitor mode
    return res.status(200).json(null);
  }
}
