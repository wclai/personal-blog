// src/components/profile/EducationSection.tsx

import { useState, useEffect, useRef } from "react";
import MonthPicker from "./MonthPicker";
import { sectionHeader, labelStyle, inputStyle, sectionBox, buttonRow } from "../../styles/globalStyle";

/* -----------------------------
   TypeScript Types
------------------------------ */

export interface EducationRow {
  id: number | null;
  profile_id?: number;
  institution: string;
  location: string;
  degree: string;
  field_of_study: string;
  start_month: string;
  end_month: string;
  remark: string;
  created_at?: string;
  updated_at?: string;
  _deleted?: boolean;
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
        institution: "",
        location: "",
        degree: "",
        field_of_study: "",
        start_month: "",
        end_month: "",
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
  const updateField = (index: number, field: keyof EducationRow, value: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    setRows(next);
  };

  /* Validation */
  const validateRows = () => {
    const visible = rows.filter(r => !r._deleted);
    return visible.every(
      r =>
        r.institution &&
        r.location &&
        r.degree &&
        r.field_of_study &&
        r.start_month &&
        r.end_month         
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
      if (r.end_month < r.start_month) {
        newErrors[i] = "End Month must be later or equal to Start Month.";
      }
    });

    setErrors(newErrors);

    const upserts = rows
      .filter(r => !r._deleted)
      .map(r => ({
        id: r.id,
        institution: r.institution ?? "",
        location: r.location ?? "",
        degree: r.degree ?? "",
        field_of_study: r.field_of_study ?? "",
        start_month: r.start_month,
        end_month: r.end_month,
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
    <div style={sectionBox}>
      <h2 style={sectionHeader}>Education</h2>

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
                  label="Institution"
                  value={row.institution ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "institution", v)}
                />

                <InputField
                  label="Location"
                  value={row.location ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "location", v)}
                />

                <InputField
                  label="Degree"
                  value={row.degree ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "degree", v)}
                />

                <InputField
                  label="Field of Study"
                  value={row.field_of_study ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "field_of_study", v)}
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
                />
              </div>

              {errors[index] && (
                <div style={{ fontSize: 14, fontStyle: "italic", color: "#cc0000", marginTop: -8 }}>
                  {errors[index]}
                </div>
              )}

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
          + Add Education
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
  onChange
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
        <span>{label} 
          {mandate && (
          <span style={{ color: "red", fontWeight: "bold" }}> *</span>
        )}
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
