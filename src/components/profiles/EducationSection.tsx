
// src/components/profiles/EducationSection.tsx
import { useState, useEffect, useRef } from "react";

/* -----------------------------
   TypeScript Types
------------------------------ */

export interface EducationRow {
  id: number | null;
  profile_id?: number; // not used in UI but exists in DB
  institution: string;
  degree: string;
  field_of_study: string;
  start_month: string;
  end_month: string;
  remark: string;
  location: string;
  created_at?: string;
  updated_at?: string;
  _deleted?: boolean; // local UI flag only
}

interface Props {
  initialRows: EducationRow[];
  onChange?: (data: {
    upserts: EducationRow[];
    deleteIds: number[];
    isValid: boolean;
  }) => void;
}

/* -----------------------------
   Component
------------------------------ */

export default function EducationSection({ initialRows, onChange }: Props) {
  const [rows, setRows] = useState<EducationRow[]>([]);

  /* Load initial DB rows */
    useEffect(() => {
    if (initialRows) {
      // Convert dates to "YYYY-MM" for month inputs
      const normalized = initialRows.map(r => ({
        ...r,
        start_month: r.start_month ? r.start_month.slice(0, 7) : "",
        end_month: r.end_month ? r.end_month.slice(0, 7) : "",
      }));
      setRows(normalized);
    }
  }, [initialRows]);

  /* -----------------------------
     Add Row
  ------------------------------ */
  const addRow = () => {
    const newRow: EducationRow = {
      id: null,
      institution: "",
      degree: "",
      field_of_study: "",
      start_month: "",
      end_month: "",
      remark: "",
      location: "",
    };
    setRows([...rows, newRow]);
  };

  /* -----------------------------
     Remove Row
  ------------------------------ */
  const removeRow = (index: number) => {
    const row = rows[index];

    if (row.id === null) {
      // Newly added row → delete entirely
      setRows(rows.filter((_, i) => i !== index));
    } else {
      // Existing DB row → mark deleted
      setRows(
        rows.map((r, i) =>
          i === index ? { ...r, _deleted: true } : r
        )
      );
    }
  };

  /* -----------------------------
     Handle Field Change
  ------------------------------ */
  const updateField = (index: number, field: keyof EducationRow, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  /* -----------------------------
     Validation
  ------------------------------ */
  const validateRows = () => {
    const visibleRows = rows.filter((r) => !r._deleted);

    for (const r of visibleRows) {
      if (
        !r.institution ||
        !r.degree ||
        !r.field_of_study ||
        !r.start_month ||
        !r.end_month ||
        !r.location
      ) {
        return false;
      }
    }
    return true;
  };

   /* -----------------------------
     Emit Changes to Parent
  ------------------------------ */

  const hasMounted = useRef(false);

  useEffect(() => {
    if (!onChange) return;

    // Prevent firing on initial load → avoids infinite loop
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const upserts = rows
      .filter((r) => !r._deleted)
      .map((r) => ({
        id: r.id,
        institution: r.institution,
        degree: r.degree,
        field_of_study: r.field_of_study,
        start_month: r.start_month,
        end_month: r.end_month,
        remark: r.remark,
        location: r.location,
      }));

    const deleteIds = rows
      .filter((r) => r._deleted && r.id !== null)
      .map((r) => r.id!) as number[];

    onChange({
      upserts,
      deleteIds,
      isValid: validateRows(),
    });
  }, [rows]);


  /* -----------------------------
     Render
  ------------------------------ */

  return (
    <div className="border p-4 rounded-lg mt-6">
      <h2 className="text-lg font-semibold mb-3">Education</h2>

      <div className="space-y-4">
        {rows
          .filter((r) => !r._deleted)
          .map((row, index) => (
            <div key={index} className="border p-3 rounded-md bg-gray-50 space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">Record #{index + 1}</div>
                <button
                  type="button"
                  className="text-red-600 font-bold"
                  onClick={() => removeRow(index)}
                >
                  –
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Institution */}
                <InputField
                  label="Institution"
                  value={row.institution}
                  onChange={(v) => updateField(index, "institution", v)}
                />

                {/* Degree */}
                <InputField
                  label="Degree"
                  value={row.degree}
                  onChange={(v) => updateField(index, "degree", v)}
                />

                {/* Field of Study */}
                <InputField
                  label="Field of Study"
                  value={row.field_of_study}
                  onChange={(v) => updateField(index, "field_of_study", v)}
                />

                {/* Location */}
                <InputField
                  label="Location"
                  value={row.location}
                  onChange={(v) => updateField(index, "location", v)}
                />

                {/* Start Month */}
                <InputField
                  label="Start Month"
                  type="month"
                  value={row.start_month}
                  onChange={(v) => updateField(index, "start_month", v)}
                />

                {/* End Month */}
                <InputField
                  label="End Month"
                  type="month"
                  value={row.end_month}
                  onChange={(v) => updateField(index, "end_month", v)}
                />
              </div>

              {/* Remark */}
              <div>
                <label className="text-sm">Remark</label>
                <textarea
                  className="border p-2 w-full"
                  value={row.remark}
                  onChange={(e) => updateField(index, "remark", e.target.value)}
                />
              </div>
            </div>
          ))}
      </div>

      {/* ADD BUTTON */}
      <button
        type="button"
        className="mt-4 px-3 py-1 bg-blue-600 text-white rounded"
        onClick={addRow}
      >
        + Add Education
      </button>
    </div>
  );
}

/* -----------------------------
   Reusable Field Component
------------------------------ */

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        type={type}
        className="border p-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
