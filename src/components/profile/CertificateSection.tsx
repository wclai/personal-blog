// CertificateSection.tsx

import { useState, useEffect, useRef } from "react";
import MonthPicker from "./MonthPicker"; // Not used here, but kept import style consistent if you later want month-level
import { labelStyle, inputStyle, sectionBox, buttonRow } from "../../styles/globalStyle";

/* -----------------------------
   TypeScript Types
------------------------------ */

export interface CertificateRow {
  id: number | null;
  profile_id?: number;
  title: string;
  issuer: string;
  issue_date: string;   // "YYYY-MM-DD"
  expiry_date: string;  // "YYYY-MM-DD"
  remark: string;
  created_at?: string;
  updated_at?: string;
  _deleted?: boolean;
}

interface Props {
  initialRows: CertificateRow[];
  onChange?: (data: {
    upserts: CertificateRow[];
    deleteIds: number[];
    isValid: boolean;
  }) => void;
}

/* -----------------------------
   Component
------------------------------ */

export default function CertificateSection({ initialRows, onChange }: Props) {
  const [rows, setRows] = useState<CertificateRow[]>([]);
  const [errors, setErrors] = useState<{ [index: number]: string }>({});

  /* Load initial DB rows */
  useEffect(() => {
    if (!initialRows) return;
      const normalized = initialRows.map(r => ({
      ...r,
      issue_date: r.issue_date ? r.issue_date.slice(0, 10) : "",
      expiry_date: r.expiry_date ? r.expiry_date.slice(0, 10) : "",
    }));

    setRows(normalized);
  }, [initialRows]);

  /* Add */
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: null,
        title: "",
        issuer: "",
        issue_date: "",
        expiry_date: "",
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
  const updateField = (index: number, field: keyof CertificateRow, value: string) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    setRows(next);
  };

  /* Validation */
  const validateRows = () => {
    const visible = rows.filter(r => !r._deleted);
    return visible.every(
      r =>
        r.title &&
        r.issuer &&
        r.issue_date
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
      if (r.expiry_date && r.issue_date && r.expiry_date < r.issue_date) {
        newErrors[i] = "Expiry Date must be later or equal to Issue Date.";
      }
    });

    setErrors(newErrors);

    const upserts = rows
      .filter(r => !r._deleted)
      .map(r => ({
        id: r.id,
        title: r.title ?? "",
        issuer: r.issuer ?? "",
        issue_date: r.issue_date,
        expiry_date: r.expiry_date,
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
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Certificates</h2>

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
                  label="Issuer"
                  value={row.issuer ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "issuer", v)}
                />

                <InputField
                  label="Issue Date"
                  type="date"
                  value={row.issue_date ?? ""}
                  mandate={true}
                  onChange={v => updateField(index, "issue_date", v)}
                />

                <InputField
                  label="Expiry Date"
                  type="date"
                  value={row.expiry_date ?? ""}
                  mandate={false}
                  onChange={v => updateField(index, "expiry_date", v)}
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
          + Add Certificate
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
