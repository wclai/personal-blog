// lib/applyCrud.ts
import { TABLE_COLUMNS } from "./profileTableConfig";

function normalizeDate(value: any) {
  if (!value) return null; // <-- empty string or undefined/null becomes null
  // Convert "YYYY-MM" to "YYYY-MM-01" for DATE columns
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    return value + "-01";
  }
  return value;
}

export async function applyCrud(client: any, tableName: string, rows: any[], profileId: number) {
  const cols = TABLE_COLUMNS[tableName];
  if (!cols) throw new Error(`Unknown table: ${tableName}`);

  // 1. Fetch current DB ids
  const dbRes = await client.query(
    `SELECT id FROM ${tableName} WHERE profile_id=$1`,
    [profileId]
  );

  const dbIds: number[] = dbRes.rows.map((r: { id: number }) => r.id);
  const clientIds: number[] = rows
    .filter((r: { id: number | null }) => r.id !== null)
    .map((r: { id: number }) => r.id);

  // 2. Delete missing rows
  const toDelete = dbIds.filter((id: number) => !clientIds.includes(id));
  for (const id of toDelete) {
    await client.query(`DELETE FROM ${tableName} WHERE id=$1`, [id]);
  }

  // 3. Insert new rows
  for (const row of rows) {
    if (row.id === null) {
      const insertCols = cols;
      const insertValues = insertCols.map(c => normalizeDate(row[c] ?? null));

      const placeholders = insertValues.map((_, i) => `$${i + 1}`).join(",");

      const insertSql = `
        INSERT INTO ${tableName} (${insertCols.join(",")})
        VALUES (${placeholders})
        RETURNING id
      `;

      const inserted = await client.query(insertSql, insertValues);

      // Update returned id back into frontend object
      row.id = inserted.rows[0].id;
    }
  }

  // 4. Update existing rows
  for (const row of rows) {
    if (row.id !== null) {
      const updateCols = cols.filter(c => c !== "profile_id");
      const setSql = updateCols.map((c, i) => `${c}=$${i + 1}`).join(",");

      const updateValues = updateCols.map(c => normalizeDate(row[c] ?? null));

      await client.query(
        `
          UPDATE ${tableName}
          SET ${setSql}, updated_at=NOW()
          WHERE id=$${updateValues.length + 1}
        `,
        [...updateValues, row.id]
      );
    }
  }

  return rows; // return updated rows (with new ids)
}
