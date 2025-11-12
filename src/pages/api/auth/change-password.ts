import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { pool } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Headers:", req.headers.cookie); // logs cookies sent
  const user = getUserFromRequest(req);
  console.log("User from JWT:", user);

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const userPayload = getUserFromRequest(req);
  if (!userPayload || !userPayload.sub) return res.status(401).json({ error: "Unauthorized" });

  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ error: "Missing fields" });
  if (newPassword !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  try {
    // Get user from DB
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userPayload.sub]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect current password" });

    // Hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, user.id]);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
