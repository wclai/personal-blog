// src/pages/api/profile/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";
import { applyCrud } from "../../../lib/applyCrud";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const profileId = Number(id);

  if (req.method === "GET") {
    try {
      const masterRes = await pool.query("SELECT * FROM profile WHERE id=$1", [profileId]);
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

      const language = (await pool.query(
        "SELECT * FROM pf_language WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )).rows;

      const skill = (await pool.query(
        "SELECT * FROM pf_skill WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )).rows;
      
      const certificate = (await pool.query(
        "SELECT * FROM pf_certificate WHERE profile_id=$1 ORDER BY issue_date DESC",
        [profileId]
      )).rows;
      
      const project = (await pool.query(
        "SELECT * FROM pf_project WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )).rows;
      
      const volunteer = (await pool.query(
        "SELECT * FROM pf_volunteer_experience WHERE profile_id=$1 ORDER BY start_month DESC",
        [profileId]
      )).rows;
      
      const socialLink = (await pool.query(
        "SELECT * FROM pf_social_link WHERE profile_id=$1 ORDER BY id",
        [profileId]
      )).rows;

      res.status(200).json({ 
        master: { ...master, contact }, 
        education, 
        work, 
        language,
        skill,
        certificate,
        project,
        volunteer,
        socialLink,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  else if (req.method === "POST") {
    const client = await pool.connect();

    try {
      const { 
        master, 
        education, 
        work, 
        language, 
        skill, 
        certificate,
        project,
        volunteer,
        socialLink,
      } = req.body;

      await client.query("BEGIN");

      // 1. Update master table
      await client.query(
        `UPDATE profile 
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

      // 2. Profile table CRUD
      const eduRows = education?.upserts ?? [];
      const workRows = work?.upserts ?? [];
      const langRows = language?.upserts ?? [];
      const skillRows = skill?.upserts ?? [];
      const certRows = certificate?.upserts ?? [];
      const projectRows = project?.upserts ?? [];
      const volunteerRows = volunteer?.upserts ?? [];
      const socialRows = socialLink?.upserts ?? [];

      // Delete rows marked for deletion if any
      if (education?.deleteIds?.length) {
        for (const delId of education.deleteIds) {
          await client.query(`DELETE FROM pf_education WHERE id=$1`, [delId]);
        }
      }

      if (work?.deleteIds?.length) {
        for (const delId of work.deleteIds) {
          await client.query(`DELETE FROM pf_work_experience WHERE id=$1`, [delId]);
        }
      }

      if (language?.deleteIds?.length) {
        for (const delId of language.deleteIds) {
          await client.query(`DELETE FROM pf_language WHERE id=$1`, [delId]);
        }
      }

      if (skill?.deleteIds?.length) {
        for (const delId of skill.deleteIds) {
          await client.query(`DELETE FROM pf_skill WHERE id=$1`, [delId]);
        }
      }

      if (certificate?.deleteIds?.length) {
        for (const delId of certificate.deleteIds) {
          await client.query(`DELETE FROM pf_certificate WHERE id=$1`, [delId]);
        }
      }

      if (project?.deleteIds?.length) {
        for (const delId of project.deleteIds) {
          await client.query(`DELETE FROM pf_project WHERE id=$1`, [delId]);
        }
      }

      if (volunteer?.deleteIds?.length) {
        for (const delId of volunteer.deleteIds) {
          await client.query(`DELETE FROM pf_volunteer_experience WHERE id=$1`, [delId]);
        }
      }

      if (socialLink?.deleteIds?.length) {
        for (const delId of socialLink.deleteIds) {
          await client.query(`DELETE FROM pf_social_link WHERE id=$1`, [delId]);
        }
      }

      for (const row of eduRows) {
        if (row.end_month < row.start_month) {
          return res.status(400).json({
            error: "End Month must be later or equal to Start Month",
          });
        }
      }
      
      for (const row of workRows) {
        if (!row.is_present && row.end_month && row.start_month) {
          if (row.end_month < row.start_month) {
            return res.status(400).json({
              error: "End Month must be later or equal to Start Month",
            });
          }
        }
      }
      
      // applyCrud      
      const updatedEducation = await applyCrud(
        client,
        "pf_education",
        eduRows,
        profileId
      );

      const updatedWork = await applyCrud(
        client,
        "pf_work_experience",
        workRows,
        profileId
      );

      const updatedLanguage = await applyCrud(
        client,
        "pf_language",
        langRows,
        profileId
      );

      const updatedSkill = await applyCrud(
        client,
        "pf_skill",
        skillRows,
        profileId
      );

      const updatedCertificate = await applyCrud(
        client,
        "pf_certificate",
        certRows,
        profileId
      );

      const updatedProject = await applyCrud(
        client,
        "pf_project",
        projectRows,
        profileId
      );

      const updatedVolunteer = await applyCrud(
        client,
        "pf_volunteer_experience",
        volunteerRows,
        profileId
      );

      const updatedSocialLink = await applyCrud(
        client,
        "pf_social_link",
        socialRows,
        profileId
      );
      
      await client.query("COMMIT");

      res.status(200).json({
        message: "Profile saved",
        education: updatedEducation,
        work: updatedWork,
        language: updatedLanguage,
        skill: updatedSkill,
        certificate: updatedCertificate,
        project: updatedProject,
        volunteer: updatedVolunteer,
        socialLink: updatedSocialLink,
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
