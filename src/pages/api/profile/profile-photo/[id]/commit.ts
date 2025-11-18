// src/pages/api/profile/profile-photo/[id]/commit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { pool } from "../../../../../lib/db";

const BASE_DIR = process.env.PROFILE_PHOTO_DIR || "./profile_photos";
const TMP_DIR = path.join(BASE_DIR, "tmp");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function getToken(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const m = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const profileId = Number(req.query.id);
  if (!profileId) return res.status(400).end("Invalid ID");

  const { temp_id } = req.body || {};
  if (!temp_id) return res.status(400).json({ error: "Missing temp_id" });

  const tmpPath = path.join(TMP_DIR, temp_id);
  if (!fs.existsSync(tmpPath)) {
    return res.status(400).json({ error: "Temp file missing" });
  }

  // --- AUTH ---
  const token = getToken(req);
  if (!token) return res.status(403).end("Forbidden");

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(403).end("Forbidden");
  }

  const { rows } = await pool.query(
    "SELECT user_id, photo_path FROM profile WHERE id=$1",
    [profileId]
  );
  if (!rows.length) return res.status(404).end("Not found");

  const profile = rows[0];
  const isOwner = payload.sub === profile.user_id;
  const isAdmin = payload.role === "admin";

  if (!isOwner && !isAdmin) return res.status(403).end("Forbidden");

  // --- FINAL DIRECTORY BASED ON ENV ---
  const profileDir = path.join(BASE_DIR, String(profileId));
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

  const finalPath = path.join(profileDir, "photo.jpg");

  // --- MOVE TEMP → FINAL ---
  fs.renameSync(tmpPath, finalPath);

  // --- REMOVE OLD FILE (if exists & different path) ---
  if (profile.photo_path) {
    const oldPath = path.join(BASE_DIR, profile.photo_path);
    if (oldPath !== finalPath && fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch {}
    }
  }

  // --- UPDATE DB ---
  const relative = `${profileId}/photo.jpg`; // relative to BASE_DIR
  await pool.query(
    "UPDATE profile SET photo_path=$1 WHERE id=$2",
    [relative, profileId]
  );

  return res.json({ photo_path: relative });
}
