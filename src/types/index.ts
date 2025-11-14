import { DateTime } from "next-auth/providers/kakao";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

// src/types/index.ts
export interface Profile {
  id: number;
  user_id: number;
  pf_name: string;
  name?: string;
  job_title?: string;
  location?: string;
  tagline?: string;
  photo_path?: string;
  is_public?: boolean;
  is_delete?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}
