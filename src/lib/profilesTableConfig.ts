// lib/profilesTableConfig.ts
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
    "title",
    "start_month",
    "end_month",
    "description",
    "location",
  ],

  // Add more child tables here
};
