import jwt, { JwtPayload } from "jsonwebtoken";
import { parse } from "cookie";
import type { NextApiRequest } from "next";

export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const COOKIE_NAME = "token";

// Define payload type
interface TokenPayload extends JwtPayload {
  sub: string;   // user id
  email: string;
  role: string;
}

// ---- existing function ----
export function getUserFromRequest(req: NextApiRequest): TokenPayload | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    // Typecast to TokenPayload
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload; // { sub, name, email, role }
  } catch {
    return null;
  }
}

// ---- new helpers (used by login, register, change-password) ----
export function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
