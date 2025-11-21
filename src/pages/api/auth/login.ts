// src/pages/api/auth/login.ts

import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { pool } from "../../../lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      errorCode: "UNKNOWN_ERROR",
      message: "Method not allowed",
    });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Missing fields",
      errorCode: "INVALID_CREDENTIALS",
      message: "Email and password are required",
    });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    // 1) User not found
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        errorCode: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // 2) Password check
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        error: "Invalid credentials",
        errorCode: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // 3) is_active check (NEW)
    //    Adjust property name if your column is mapped differently.
    const isActive = user.is_active ?? user.isActive;
    if (!isActive) {
      return res.status(403).json({
        error: "Account inactive",
        errorCode: "ACCOUNT_INACTIVE",
        message: "Your account has not been activated yet.",
      });
    }

    // 4) Generate token as before
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1d" }
    );

    // Set cookie for session
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`
    );

    // 5) Success response (unchanged shape, just added success flag if you want)
    res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
      errorCode: "UNKNOWN_ERROR",
      message: "Internal server error",
    });
  }
}