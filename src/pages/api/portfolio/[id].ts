// src/pages/api/portfolio/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";
import { Tag } from "lucide-react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const profileId = Number(id);

  if (!profileId || Number.isNaN(profileId)) {
    return res.status(400).json({ error: "Invalid profile id" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // 1. Load master profile, only public & not deleted
    const masterRes = await pool.query(
      `SELECT *
       FROM profile
       WHERE id = $1
         AND is_deleted = false
         AND is_public = true`,
      [profileId]
    );

    const master = masterRes.rows[0];

    if (!master) {
      return res.status(404).json({ error: "Profile not found or not public" });
    }

    // 2. Normalize contact JSON
    const contact =
      master.contact && typeof master.contact === "object"
        ? master.contact
        : { telephone: "", mobile: "", email: "", address: "" };

    // 3. Load child tables (same style as src/pages/api/profile/[id].ts)
    const education = (
      await pool.query(
        "SELECT * FROM pf_education WHERE profile_id=$1 ORDER BY start_month DESC",
        [profileId]
      )
    ).rows;

    const work = (
      await pool.query(
        "SELECT * FROM pf_work_experience WHERE profile_id=$1 ORDER BY start_month DESC",
        [profileId]
      )
    ).rows;

    const language = (
      await pool.query(
        "SELECT * FROM pf_language WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )
    ).rows;

    const skill = (
      await pool.query(
        "SELECT * FROM pf_skill WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )
    ).rows;

    const certificate = (
      await pool.query(
        "SELECT * FROM pf_certificate WHERE profile_id=$1 ORDER BY issue_date DESC",
        [profileId]
      )
    ).rows;

    const project = (
      await pool.query(
        "SELECT * FROM pf_project WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )
    ).rows;

    const volunteer = (
      await pool.query(
        "SELECT * FROM pf_volunteer_experience WHERE profile_id=$1 ORDER BY start_month DESC",
        [profileId]
      )
    ).rows;

    const socialLink = (
      await pool.query(
        "SELECT * FROM pf_social_link WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )
    ).rows;

    // 4. Shape response to match portfolio.tsx types
    const responseData = {
      profile: {
        id: master.id,
        user_id: master.user_id,
        name: master.name,
        job_title: master.job_title,
        tagline: master.tagline,
        location: master.location,
        introduction: master.introduction,
        photo_path: master.photo_path,
        contact, // includes email/telephone/mobile/address + possible extra fields
      },
      work,
      education,
      certificate,
      language,
      skill,
      project,
      volunteer,
      socialLink,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Portfolio API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
