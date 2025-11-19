// src/pages/api/portfolio/profileSearch.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db";

export interface PublicProfileListItem {
  id: number;
  name: string;
  job_title: string | null;
  tagline: string | null;
  location: string | null;
  pf_name: string | null;
}

export interface PublicProfileSearchResult {
  items: PublicProfileListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicProfileSearchResult | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // ---- Read query params ----
    const qParam = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;

    const rawQuery = (qParam ?? "").trim();
    const pageSize = 20;

    let pageNum = parseInt(pageParam || "1", 10);
    if (!Number.isFinite(pageNum) || pageNum <= 0) {
      pageNum = 1;
    }

    const terms = rawQuery.split(/\s+/).filter(Boolean);

    // ---- Build WHERE clause ----
    const whereClauses: string[] = [
      "is_public = TRUE",
      "is_deleted = FALSE",
    ];

        const params: any[] = [];

    const searchableColumns = ["name", "job_title", "location", "tagline", "pf_name"];

    // If user typed something → add fuzzy search conditions
    // If no terms → just keep is_public / is_deleted filters (return all public profiles)
    if (terms.length > 0) {
      for (const term of terms) {
        const like = `%${term}%`;
        const orParts: string[] = [];

        for (const col of searchableColumns) {
          params.push(like);
          const paramIndex = params.length; // $1, $2, ...
          orParts.push(`${col} ILIKE $${paramIndex}`);
        }

        whereClauses.push(`(${orParts.join(" OR ")})`);
      }
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const offset = (pageNum - 1) * pageSize;

    // ---- COUNT query ----
    const countSql = `
      SELECT COUNT(*) AS total
      FROM profile
      ${whereSql}
    `;

    const countResult = await pool.query<{ total: string }>(countSql, params);
    const total = countResult.rows.length > 0 ? parseInt(countResult.rows[0].total, 10) || 0 : 0;
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

    // ---- Data query ----
    // Add LIMIT/OFFSET params at the end of the existing params
    const dataParams = [...params, pageSize, offset];

    const limitIndex = dataParams.length - 1; // second to last
    const offsetIndex = dataParams.length;    // last

    const dataSql = `
      SELECT
        id,
        name,
        job_title,
        tagline,
        location,
        pf_name
      FROM profile
      ${whereSql}
      ORDER BY updated_at DESC NULLS LAST, id ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const dataResult = await pool.query<PublicProfileListItem>(dataSql, dataParams);

    const response: PublicProfileSearchResult = {
      items: dataResult.rows,
      total,
      page: pageNum,
      pageSize,
      totalPages,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Portfolio profileSearch API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
