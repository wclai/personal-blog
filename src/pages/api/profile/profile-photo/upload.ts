// src/pages/api/profile/profile-photo/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

// --- DIRECTORIES BASED ON ENV ---
const BASE_DIR = process.env.PROFILE_PHOTO_DIR || "./profile_photos";
const TMP_DIR = path.join(BASE_DIR, "tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const form = formidable({
    uploadDir: TMP_DIR,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Upload failed" });

    const f = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!f) return res.status(400).json({ error: "No file" });

    const tempId = path.basename(f.filepath);
    return res.json({ temp_id: tempId });
  });
}
