// src/lib/db.ts

import { Pool, types } from 'pg';

types.setTypeParser(1082, (v) => v);   // keep "YYYY-MM-DD"

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});