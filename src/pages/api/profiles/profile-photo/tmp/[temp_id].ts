// GET /api/profiles/profile-photo/tmp/[temp_id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve(process.env.PROFILE_PHOTO_DIR || "./profile_photos");
const TMP_DIR = path.join(BASE_DIR, "tmp");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { temp_id } = req.query;

  if (!temp_id || typeof temp_id !== "string") {
    return res.status(400).json({ error: "Missing temp_id" });
  }

    const filePath = path.join(TMP_DIR, temp_id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Temp photo not found" });
  }

  const image = fs.readFileSync(filePath);

  // Guess MIME type from extension
  const ext = temp_id.split(".").pop()?.toLowerCase();
  const mime = ext === "png"
    ? "image/png"
    : ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : "application/octet-stream";

  res.setHeader("Content-Type", mime);
  return res.send(image);
}
