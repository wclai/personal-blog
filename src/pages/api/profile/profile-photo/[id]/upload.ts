// src/pages/api/profile/profile-photo/[id]/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { pool } from "../../../../../lib/db";

export const config = { api: { bodyParser: false } };

const UPLOAD_DIR = process.env.PROFILE_PHOTO_DIR || "./uploads/profile_photos";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getTokenFromCookie(req: NextApiRequest) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const m = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const profileId = Number(req.query.id);
  if (isNaN(profileId) || profileId <= 0)
    return res.status(400).json({ error: "Invalid profile ID" });

  // Auth
  const token = getTokenFromCookie(req);
  let userPayload: any = null;
  if (token) {
    try {
      userPayload = jwt.verify(token, JWT_SECRET);
    } catch {
      userPayload = null;
    }
  }

  // Remove request: header "x-remove: 1"
  if (req.headers["x-remove"]) {
    try {
      const { rows } = await pool.query(
        "SELECT photo_path FROM profile WHERE id=$1",
        [profileId]
      );
      if (!rows.length) return res.status(404).json({ error: "Not found" });

      const pp = rows[0].photo_path;
      if (pp) {
        const full = path.join(UPLOAD_DIR, pp);
        if (fs.existsSync(full)) fs.unlinkSync(full);
      }

      await pool.query(
        "UPDATE profile SET photo_path=null, updated_at=NOW() WHERE id=$1",
        [profileId]
      );

      return res.status(200).json({ photo_path: null });
    } catch (e) {
      console.error("remove error", e);
      return res.status(500).json({ error: "Failed to remove" });
    }
  }

  // Parse upload
  ensureDirSync(UPLOAD_DIR);
  ensureDirSync(path.join(process.cwd(), "./uploads/tmp"));

  const form = formidable({
    maxFileSize: MAX_BYTES,
    uploadDir: path.join(process.cwd(), "./uploads/tmp"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Invalid upload" });

    const extract = (f: any) => (Array.isArray(f) ? f[0] : f);
    const file = extract(files.file);
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Validate
    if (!file.mimetype || !ALLOWED_MIME.includes(file.mimetype))
      return res.status(400).json({ error: "Unsupported file type" });

    if (file.size > MAX_BYTES)
      return res.status(400).json({ error: "File too large (max 2MB)" });

    try {
      // Verify owner/admin
      const { rows } = await pool.query(
        "SELECT user_id FROM profile WHERE id=$1",
        [profileId]
      );
      if (!rows.length) return res.status(404).json({ error: "Profile not found" });

      const owner = rows[0].user_id;
      const isOwner = userPayload?.sub === owner;
      const isAdmin = userPayload?.role === "admin";
      if (!isOwner && !isAdmin)
        return res.status(403).json({ error: "Forbidden" });

      // Create per-profile directory
      const profileDir = path.join(UPLOAD_DIR, String(profileId));
      ensureDirSync(profileDir);

      const ext =
        file.mimetype === "image/png"
          ? ".png"
          : file.mimetype === "image/webp"
          ? ".webp"
          : ".jpg";

      const outPath = path.join(profileDir, `photo${ext}`);
      const tmp = file.filepath;

      await sharp(tmp)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .withMetadata({ orientation: undefined })
        .toFile(outPath);

      fs.unlinkSync(tmp);

      const relative = path.relative(UPLOAD_DIR, outPath).replace(/\\/g, "/");

      await pool.query(
        "UPDATE profile SET photo_path=$1, updated_at=NOW() WHERE id=$2",
        [relative, profileId]
      );

      return res.status(200).json({ photo_path: relative });
    } catch (e) {
      console.error("upload error", e);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}

export async function uploadTemp(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/profile/profile-photo/upload-temp", {
    method: "POST",
    body: form,
    credentials: "include",
  });

  if (!res.ok) throw new Error("Temp upload failed");
  return res.json(); // { temp_id: string }
}

export async function commitPhoto(profileId: number, temp_id: string) {
  const res = await fetch(`/api/profile/profile-photo/${profileId}/commit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ temp_id }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Commit failed");
  return res.json(); // { photo_path: "/uploads/profile_photos/3/photo.jpg" }
}
