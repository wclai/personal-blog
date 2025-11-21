// src/pages/api/users/users.ts

import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { pool } from "../../../lib/db"; // adjust if your actual path is different

type AuthedUser = {
  sub: number;
  email: string;
  role: string;
};

type UserListItem = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type ListResponse = {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ErrorResponse = {
  error: string;
  errorCode: string;
  message: string;
};

type PatchResponse =
  | { success: true; user: { id: number; is_active: boolean } }
  | ErrorResponse;

// --------- helpers ---------

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join("="));
  }
  return cookies;
}

function getAuthedUser(req: NextApiRequest): AuthedUser | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["token"];
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as unknown as AuthedUser;
    return payload;
  } catch {
    return null;
  }
}

function ensureAdmin(req: NextApiRequest, res: NextApiResponse<ErrorResponse>): AuthedUser | null {
  const authUser = getAuthedUser(req);
  if (!authUser) {
    res.status(401).json({
      error: "Unauthorized",
      errorCode: "UNAUTHORIZED",
      message: "You must be logged in as admin.",
    });
    return null;
  }
  if (authUser.role !== "admin") {
    res.status(403).json({
      error: "Forbidden",
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
    return null;
  }
  return authUser;
}

// --------- main handler ---------

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListResponse | PatchResponse | ErrorResponse>
) {
  // All methods require admin
  const authUser = ensureAdmin(req, res);
  if (!authUser) return;

  if (req.method === "GET") {
    return handleList(req, res);
  }

  if (req.method === "PATCH") {
    return handleToggleActive(req, res);
  }

  return res.status(405).json({
    error: "Method not allowed",
    errorCode: "METHOD_NOT_ALLOWED",
    message: "Only GET and PATCH are allowed.",
  });
}

// --------- GET /api/users ---------

async function handleList(req: NextApiRequest, res: NextApiResponse<ListResponse | ErrorResponse>) {
  const qRaw = req.query.q;
  const pageRaw = req.query.page;

  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw || "";
  const page = Math.max(parseInt(Array.isArray(pageRaw) ? pageRaw[0] : pageRaw || "1", 10) || 1, 1);
  const pageSize = 20;

  const params: any[] = [];
  const whereClauses: string[] = [];

  if (q.trim()) {
    params.push(`%${q.trim()}%`);
    // search by name or email
    whereClauses.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  try {
    // total count
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM users ${whereSql}`,
      params
    );
    const total: number = countResult.rows[0]?.count ?? 0;

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
    const offset = (safePage - 1) * pageSize;

    // list query
    const listParams = [...params, pageSize, offset];
    const listResult = await pool.query(
      `
      SELECT id, name, email, role, is_active
      FROM users
      ${whereSql}
      ORDER BY id ASC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
      `,
      listParams
    );

    const items: UserListItem[] = listResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      is_active: row.is_active,
    }));

    return res.status(200).json({
      items,
      total,
      page: safePage,
      pageSize,
      totalPages,
    });
  } catch (err) {
    console.error("Error listing users:", err);
    return res.status(500).json({
      error: "Internal server error",
      errorCode: "INTERNAL_ERROR",
      message: "Failed to load users.",
    });
  }
}

// --------- PATCH /api/users ---------

async function handleToggleActive(
  req: NextApiRequest,
  res: NextApiResponse<PatchResponse | ErrorResponse>
) {
  const { id, is_active } = req.body as { id?: number; is_active?: boolean };

  if (!id || typeof is_active !== "boolean") {
    return res.status(400).json({
      error: "Bad request",
      errorCode: "BAD_REQUEST",
      message: "id and is_active are required.",
    });
  }

  try {
    // First, fetch the user
    const userResult = await pool.query(
      "SELECT id, role, is_active FROM users WHERE id = $1",
      [id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        errorCode: "NOT_FOUND",
        message: "User not found.",
      });
    }

    // Do not allow changing admin's is_active
    if (user.role === "admin") {
      return res.status(400).json({
        error: "Cannot modify admin status",
        errorCode: "CANNOT_MODIFY_ADMIN",
        message: "Admin users must always remain active.",
      });
    }

    // Update is_active
    await pool.query("UPDATE users SET is_active = $1 WHERE id = $2", [is_active, id]);

    return res.status(200).json({
      success: true,
      user: {
        id,
        is_active,
      },
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      error: "Internal server error",
      errorCode: "INTERNAL_ERROR",
      message: "Failed to update user.",
    });
  }
}
