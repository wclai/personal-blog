import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../../lib/db";
import { getUserFromRequest } from "../../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  const { id } = req.query;

  try {
    await pool.query(
      "UPDATE profile SET is_deleted = true WHERE id = $1",
      [id]
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete profile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
