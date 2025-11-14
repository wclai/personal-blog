// src/pages/api/profiles/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "token";

type JwtUserPayload = { sub: number; role: string; email: string };

function getUserFromReq(req: NextApiRequest): JwtUserPayload | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return jwt.verify(match[1], JWT_SECRET) as unknown as JwtUserPayload;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const profileId = parseInt(req.query.id as string);
  if (isNaN(profileId)) return res.status(400).json({ error: "Invalid profile ID" });

  if (req.method === "PUT") {
    if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const { pf_name, is_public, tagline, photo_path, name, job_title, location } = req.body;

    const query = `
      UPDATE profiles
      SET pf_name=$1, is_public=$2, tagline=$3, photo_path=$4, name=$5, job_title=$6, location=$7
      WHERE id=$8
      RETURNING *`;
    const values = [pf_name, is_public, tagline, photo_path, name, job_title, location, profileId];

    const { rows } = await pool.query(query, values);
    return res.status(200).json(rows[0]);
  }

  if (req.method === "DELETE") {
    if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const { rows } = await pool.query(
      "UPDATE profiles SET is_delete=true WHERE id=$1 RETURNING *",
      [profileId]
    );
    return res.status(200).json(rows[0]);
  }

  res.status(405).json({ error: "Method not allowed" });
}