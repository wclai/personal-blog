// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import type { NextApiRequest } from "next";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "pb_token";

export function getUserFromRequest(req: NextApiRequest) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload; // { sub, name, email, role }
  } catch {
    return null;
  }
}