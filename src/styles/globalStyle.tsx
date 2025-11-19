// src/styles/globalStyle.tsx

/* ---------- Main Section ---------- */
export const mainShadow: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginTop: "4rem",
};

export const mainSection: React.CSSProperties = {
  minWidth: 1000,
  padding: "2rem",
  border: "1px solid #ccc",
  borderRadius: 8,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  backgroundColor: "#fff",
};

export const mainHeader: React.CSSProperties = {
  fontWeight: 700, 
  marginBottom: "1rem"
};

export const sectionHeader: React.CSSProperties = {
  fontSize: 18, 
  fontWeight: 600, 
  marginBottom: "1rem"
};

/* ---------- Pop-up Form ---------- */
export const popupShadow: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: "fadeIn 0.3s",
  zIndex: 1000,
};

export const popupForm: React.CSSProperties = {
  minWidth: 400,
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: 8,
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  position: "relative",
  animation: "slideDown 0.3s",
};

export const popupClose: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "transparent",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
};

export const popupSection: React.CSSProperties = {
  display: "flex", 
  flexDirection: "column", 
  gap: "0.75rem"
};              

/* ---------- Input ---------- */
export const sectionBox: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 20,
  borderRadius: 6,
  background: "#fafafa",
  marginBottom: 30,
};

export const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 14,
  color: "#333",
};

export const inputStyle: React.CSSProperties = {
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 14,
};

export const checkboxStyle: React.CSSProperties = {
  display: "flex", 
  alignItems: "center", 
  gap: 8,
};

/* ---------- Buttons ---------- */
export const buttonRow: React.CSSProperties = {
  marginTop: 20 as const,
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
  padding: "0.5rem",
  fontSize: 14,
  background: "#f5f5f5",
  borderRadius: 4,
  border: "1px solid #ccc", 
  marginTop: "0.5rem", 
  cursor: "pointer",
  transition: "background 0.2s, border-color 0.2s",
  userSelect: "none",
};

export const confirmButtonStyle: React.CSSProperties = {
  padding: "0.5rem",
  fontSize: 14,  
  color: "#fff",
  background: "#0070f3",
  border: "none",
  borderRadius: 4,
  marginTop: "0.5rem",
  cursor: "pointer",
  transition: "background 0.2s, border-color 0.2s",
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

/* ---------- Message ---------- */
export const errorMessage: React.CSSProperties = {
  color: "red", 
  marginTop: 10
};

/* ---------- Table ---------- */
export const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  border: "1px solid #ddd",
  borderRadius: 8,
  overflow: "hidden",
  fontSize: 14,
};

export const trStyle: React.CSSProperties = {
  background: "#f5f5f5"
};

export const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  borderBottom: "1px solid #ddd",  
  verticalAlign: "middle" as const,
  textAlign: "left" as const,
  fontWeight: 600,
  fontSize: 14,
  color: "#333",
};

export const tdStyle: React.CSSProperties = {
  padding: "10px 10px",
  verticalAlign: "middle" as const,
  textAlign: "left" as const,
  color: "#444",
};