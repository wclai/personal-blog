import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { pool } from "../../../lib/db"; // your PostgreSQL connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    // Check if user exists
    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashed, "user"]
    );

    const user = result.rows[0];

    // Set cookie for session
    res.setHeader(
      "Set-Cookie",
      `token=${user.id}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}` // simple cookie by user id
    );

    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
