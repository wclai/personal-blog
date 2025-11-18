// src/pages/api/profile/profile-photo/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { pool } from "../../../../lib/db";

const UPLOAD_DIR = process.env.PROFILE_PHOTO_DIR || "./profile_photos";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function getTokenFromCookie(req: NextApiRequest) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const m = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const profileId = Number(req.query.id);
  if (isNaN(profileId)) return res.status(400).end("Invalid id");

  try {
    const { rows } = await pool.query(
      "SELECT id, user_id, is_public, photo_path FROM profile WHERE id=$1",
      [profileId]
    );
    if (!rows.length) return res.status(404).end("Profile not found");

    const profile = rows[0];
    if (!profile.photo_path) return res.status(404).end("No photo");

    // If private: require login + ownership/admin
    if (!profile.is_public) {
      const token = getTokenFromCookie(req);
      if (!token) return res.status(403).end("Forbidden");

      let payload: any;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch {
        return res.status(403).end("Forbidden");
      }

      const isOwner = payload.sub === profile.user_id;
      const isAdmin = payload.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).end("Forbidden");
    }

    const filePath = path.join(UPLOAD_DIR, profile.photo_path);
    const stat = fs.statSync(filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = ({
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    } as any)[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stat.size);

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).end("Server error");
  }
}
