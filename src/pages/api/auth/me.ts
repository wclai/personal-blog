import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const result = await pool.query("SELECT id, name, email, role FROM users WHERE id=$1", [token]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid session" });

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
