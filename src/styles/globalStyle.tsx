/* ---------- Styles ---------- */
export const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 14,
  color: "#333",
};

export const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 14,
};

export const sectionBox: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 20,
  borderRadius: 6,
  background: "#fafafa",
  marginBottom: 30,
};

export const buttonRow: React.CSSProperties = {
  marginTop: 20,
  display: "flex",
  gap: 12,
};

export const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 14,
  background: "white",
  cursor: "pointer",
};

export const buttonStyle: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 14,
  borderRadius: 4,
  border: "1px solid #ccc",
  background: "#f5f5f5",
  cursor: "pointer",
  transition: "background 0.2s, border-color 0.2s",

  /* Prevent text selection flicker */
  userSelect: "none",
};

export const confirmButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 14,
  color: "#f5f5f5",
  borderRadius: 4,
  border: "1px solid #ccc",
  background: "#4f46e5",
  cursor: "pointer",
  transition: "background 0.2s, border-color 0.2s",

  /* Prevent text selection flicker */
  userSelect: "none",
};

export const buttonHoverStyle: React.CSSProperties = {
  background: "#eaeaea",
  borderColor: "#bbb",
};

export const buttonDisabledStyle: React.CSSProperties = {
  opacity: 0.5,
  cursor: "not-allowed",
};
