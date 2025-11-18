// lib/profileTableConfig.ts
export const TABLE_COLUMNS: Record<string, string[]> = {
  pf_education: [
    "profile_id",
    "institution",
    "degree",
    "field_of_study",
    "start_month",
    "end_month",
    "remark",
    "location",
  ],

  pf_work_experience: [
    "profile_id",
    "company",
    "position",
    "start_month",
    "end_month",
    "description",
    "remark",
    "location",
    "is_present",
  ],

  pf_language: [
    "profile_id",
    "language",
    "proficiency",
    "remark",
  ],

  pf_skill: [
    "profile_id",
    "skill",
    "level",
    "remark",
  ],

  pf_certificate: [
    "profile_id",
    "title",
    "issuer",
    "issue_date",
    "expiry_date",
    "remark",
  ],

  pf_project: [
    "profile_id",
    "title",
    "description",
    "link",
    "remark",
  ],

  pf_volunteer_experience: [
    "profile_id",
    "organization",
    "role",
    "start_month",
    "end_month",
    "description",
    "remark",
    "is_present",
  ],

  pf_social_link: [
    "profile_id",
    "platform",
    "url",
    "remark",
  ],

};
