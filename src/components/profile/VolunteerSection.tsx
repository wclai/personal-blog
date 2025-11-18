// src/components/profile/VolunteerSection.tsx

import { useState, useEffect, useRef } from "react";
import MonthPicker from "./MonthPicker";
import { labelStyle, inputStyle, sectionBox, buttonRow } from "../../styles/globalStyle";

/* -----------------------------
   TypeScript Types
------------------------------ */

export interface VolunteerRow {
  id: number | null;
  profile_id?: number;
  organization: string;
  role: string;
  start_month: string; // "YYYY-MM"
  end_month: string;   // "YYYY-MM"
  is_present: boolean;
  description: string;
  remark: string;
  created_at?: string;
  updated_at?: string;
  _deleted?: boolean;
}

interface Props {
  initialRows: VolunteerRow[];
  onChange?: (data: {
    upserts: VolunteerRow[];
    deleteIds: number[];
    isValid: boolean;
  }) => void;
}

/* -----------------------------
   Component
------------------------------ */

export default function VolunteerSection({ initialRows, onChange }: Props) {
  const [rows, setRows] = useState<VolunteerRow[]>([]);
  const [errors, setErrors] = useState<{ [index: number]: string }>({});

  /* Load initial DB rows */
  useEffect(() => {
    if (!initialRows) return;

    const normalized = initialRows.map(r => ({
      ...r,
      start_month: r.start_month ? r.start_month.slice(0, 7) : "",
      end_month: r.end_month ? r.end_month.slice(0, 7) : "",
    }));

    setRows(normalized);
  }, [initialRows]);

  /* Add */
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: null,
        organization: "",
        role: "",
        start_month: "",
        end_month: "",
        is_present: false,
        description: "",
        remark: "",
      },
    ]);
  };

  /* Remove */
  const removeRow = (index: number) => {
    const row = rows[index];

    if (row.id === null) {
      setRows(rows.filter((_, i) => i !== index));
    } else {
      setRows(rows.map((r, i) => (i === index ? { ...r, _deleted: true } : r)));
    }
  };

  /* Update Field */
  const updateField = (
    index: number,
    field: keyof VolunteerRow,
    value: any
  ) => {
    const next = [...rows];
    if (field === "is_present") {
      next[index] = {
        ...next[index],
        is_present: value,
        end_month: value ? "" : next[index].end_month, // clear end_month if present
      };
    } else {
      next[index] = { ...next[index], [field]: value };
    }
    setRows(next);
  };

  /* Validation */
  const validateRows = () => {
    const visible = rows.filter(r => !r._deleted);
    return visible.every(
      r =>
        r.organization &&
        r.role &&
        r.start_month &&
        (!r.is_present ? r.end_month : true) // skip end_month check if is_present      
    );
  };

  /* Emit changes */
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!onChange) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const newErrors: { [index: number]: string } = {};

    rows.forEach((r, i) => {
      if (!r._deleted && !r.is_present && r.start_month && r.end_month) {
        if (r.end_month < r.start_month) {
          newErrors[i] = "End Month must be later or equal to Start Month.";
        }
      }
    });

    setErrors(newErrors);

    const upserts = rows
      .filter(r => !r._deleted)
      .map(r => ({
        id: r.id,
        organization: r.organization ?? "",
        role: r.role ?? "",
        start_month: r.start_month,
        end_month: r.end_month,
        is_present: r.is_present,
        description: r.description ?? "",
        remark: r.remark ?? "",
      }));

    const deleteIds = rows
      .filter(r => r._deleted && r.id !== null)
      .map(r => r.id!) as number[];

    const isValid = validateRows() && Object.keys(newErrors).length === 0;

    onChange({ upserts, deleteIds, isValid: validateRows() });
  }, [rows]);

  /* -----------------------------
     Render
  ------------------------------ */

  return (
    <div style={{ ...sectionBox }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Volunteer Experience</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {rows
          .filter(r => !r._deleted)
          .map((row, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: 16,
                background: "white",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 600 }}>Record #{index + 1}</div>

                <button
                  type="button"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#cc0000",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                  onClick={() => removeRow(index)}
                >
                  ✕
                </button>
              </div>

              {/* 2-column form layout */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <InputField
                  label="Organization"
                  value={row.organization ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "organization", v)}
                />

                <InputField
                  label="Role"
                  value={row.role ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "role", v)}
                />

                <MonthPicker
                  label="Start Month"
                  value={row.start_month}
                  mandate={true}
                  onChange={v => updateField(index, "start_month", v)}
                />

                <MonthPicker
                  label="End Month"
                  value={row.end_month}
                  mandate={true}
                  onChange={v => updateField(index, "end_month", v)}
                  disabled={row.is_present} // <-- dim if is_present
                />
              </div>

              {errors[index] && (
                <div style={{ fontSize: 14, fontStyle: "italic", color: "#cc0000", marginTop: -8 }}>
                  {errors[index]}
                </div>
              )}

              {/* Currently volunteering checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={row.is_present}
                  onChange={e => updateField(index, "is_present", e.target.checked)}
                />
                <span style={{ fontSize: 14 }}>I am currently volunteering here</span>
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                  value={row.description ?? ""}
                  onChange={e => updateField(index, "description", e.target.value)}
                />
              </div>

              {/* Remark */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Remark</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
                  value={row.remark ?? ""}
                  onChange={e => updateField(index, "remark", e.target.value)}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Add Button */}
      <div style={buttonRow}>
        <button
          type="button"
          style={{
            padding: "10px 14px",
            background: "#2a67d0",
            color: "white",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
          onClick={addRow}
        >
          + Add Volunteer Experience
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Reusable InputField
------------------------------ */

function InputField({
  label,
  value,
  type = "text",
  mandate,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  mandate?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>
        <span>
          {label}
          {mandate && <span style={{ color: "red", fontWeight: "bold" }}> *</span>}
        </span>
      </label>
      <input
        type={type}
        style={inputStyle}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
