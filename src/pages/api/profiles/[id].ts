import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";
import { applyCrud } from "../../../lib/applyCrud";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const profileId = Number(id);

  if (req.method === "GET") {
    try {
      const masterRes = await pool.query("SELECT * FROM profiles WHERE id=$1", [profileId]);
      const master = masterRes.rows[0];

      const contact =
        master.contact && typeof master.contact === "object"
          ? master.contact
          : { telephone: "", mobile: "", email: "", address: "" };

      const education = (await pool.query(
        "SELECT * FROM pf_education WHERE profile_id=$1 ORDER BY start_month DESC",
        [profileId]
      )).rows;

      const work = (await pool.query(
        "SELECT * FROM pf_work_experience WHERE profile_id=$1 ORDER BY start_month DESC",
        [profileId]
      )).rows;

      res.status(200).json({ master: { ...master, contact }, education, work });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  else if (req.method === "POST") {
    const client = await pool.connect();

    try {
      const { master, education, work } = req.body;

      await client.query("BEGIN");

      // 1. Update master table
      await client.query(
        `UPDATE profiles 
         SET pf_name=$1, name=$2, job_title=$3, tagline=$4, location=$5,
             introduction=$6, photo_path=$7, is_public=$8,
             contact=$9, updated_at=NOW()
         WHERE id=$10`,
        [
          master.pf_name,
          master.name,
          master.job_title,
          master.tagline,
          master.location,
          master.introduction,
          master.photo_path,
          master.is_public,
          JSON.stringify(master.contact),
          profileId,
        ]
      );

      // 2. Profiles table CRUD
      const eduRows = education?.upserts ?? [];
      // Delete rows marked for deletion if any
      if (education?.deleteIds?.length) {
        for (const delId of education.deleteIds) {
          await client.query(`DELETE FROM pf_education WHERE id=$1`, [delId]);
        }
      }

      const updatedEducation = await applyCrud(
        client,
        "pf_education",
        eduRows,
        profileId
      );

      // ---------- 3. Apply Work CRUD safely ----------
      const workRows = Array.isArray(work) ? work : [];
      const updatedWork = await applyCrud(
        client,
        "pf_work_experience",
        workRows,
        profileId
      );

      await client.query("COMMIT");

      res.status(200).json({
        message: "Profile saved",
        education: updatedEducation,
        work: updatedWork,
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ error: "Failed to save profile" });
    } finally {
      client.release();
    }
  }

  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
