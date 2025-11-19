// src/pages/api/profile/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isPublicRequest = req.query.public === "true";

  try {
    if (req.method === "GET") {
      if (isPublicRequest) {
        // Public visitors: return only public profiles, no auth required
        const result = await pool.query(
          "SELECT * FROM profile WHERE is_deleted = false AND is_public = true ORDER BY id"
        );
        return res.status(200).json(result.rows);
      }

      // Admin or logged-in user
      const user = getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const query =
        user.role === "admin"
          ? "SELECT * FROM profile WHERE is_deleted = false ORDER BY id"
          : "SELECT * FROM profile WHERE is_deleted = false AND is_public = true ORDER BY id";

      const result = await pool.query(query);
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const user = getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

      const { pf_name, name, job_title, location, tagline, is_public } = req.body;

      if (!pf_name || !name) {
        return res.status(400).json({ error: "pf_name and name are required" });
      }

      const insertQuery = `
        INSERT INTO profile (user_id, pf_name, name, job_title, tagline, location, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        user.sub,           // user_id
        pf_name,
        name,
        job_title || "",
        tagline || "",
        location || "",
        is_public || false,
      ];

      const result = await pool.query(insertQuery, values);
      return res.status(201).json(result.rows[0]);
    }


    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error("Profile API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
