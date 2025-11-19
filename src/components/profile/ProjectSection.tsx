// src/components/profile/ProjectSection.tsx

import { useState, useEffect, useRef } from "react";
import MonthPicker from "./MonthPicker";
import { labelStyle, inputStyle, sectionBox, buttonRow } from "../../styles/globalStyle";

/* -----------------------------
   TypeScript Types
------------------------------ */

export interface ProjectRow {
  id: number | null;
  profile_id?: number;
  title: string;
  description: string;
  link: string;
  remark: string;
  created_at?: string;
  updated_at?: string;
  _deleted?: boolean;
}

interface Props {
  initialRows: ProjectRow[];
  onChange?: (data: {
    upserts: ProjectRow[];
    deleteIds: number[];
    isValid: boolean;
  }) => void;
}

/* -----------------------------
   Component
------------------------------ */

export default function ProjectSection({ initialRows, onChange }: Props) {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [errors, setErrors] = useState<{ [index: number]: string }>({});

  /* Load initial DB rows */
  useEffect(() => {
    if (!initialRows) return;
    setRows(initialRows);
  }, [initialRows]);

  /* Add */
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: null,
        title: "",
        description: "",
        link: "",
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
  const updateField = (index: number, field: keyof ProjectRow, value: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    setRows(next);
  };

  /* Validation */
  const validateRows = () => {
    const visible = rows.filter(r => !r._deleted);
    return visible.every(r => r.title && r.description);
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
    setErrors(newErrors);

    const upserts = rows
      .filter(r => !r._deleted)
      .map(r => ({
        id: r.id,
        title: r.title ?? "",
        description: r.description ?? "",
        link: r.link ?? "",
        remark: r.remark ?? "",
      }));

    const deleteIds = rows
      .filter(r => r._deleted && r.id !== null)
      .map(r => r.id!) as number[];

    const isValid = validateRows() && Object.keys(newErrors).length === 0;

    onChange({ upserts, deleteIds, isValid });
  }, [rows]);

  /* -----------------------------
     Render
  ------------------------------ */

  return (
    <div style={{ ...sectionBox }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Projects</h2>

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
                  label="Title"
                  value={row.title ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "title", v)}
                />

                <InputField
                  label="Link"
                  type="url"
                  value={row.link ?? ""}
                  mandate={false}
                  onChange={v => updateField(index, "link", v)}
                />
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>
                  <span>
                    Description
                    <span style={{ color: "red", fontWeight: "bold" }}> *</span>
                  </span>
                </label>
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
          + Add Project
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
