import { labelStyle, selectStyle } from "../../styles/globalStyle";

export default function MonthPicker({
  label,
  value,
  mandate,
  onChange,
  disabled,
  error
}: {
  label: string;
  value: string;
  mandate?: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const year = value?.slice(0, 4) || "";
  const month = value?.slice(5, 7) || "";

  const years = [];
  for (let y = 1980; y <= new Date().getFullYear() + 5; y++) {
    years.push(y.toString());
  }

  const months = [
    { v: "01", t: "Jan" },
    { v: "02", t: "Feb" },
    { v: "03", t: "Mar" },
    { v: "04", t: "Apr" },
    { v: "05", t: "May" },
    { v: "06", t: "Jun" },
    { v: "07", t: "Jul" },
    { v: "08", t: "Aug" },
    { v: "09", t: "Sep" },
    { v: "10", t: "Oct" },
    { v: "11", t: "Nov" },
    { v: "12", t: "Dec" },
  ];

  const update = (newYear: string, newMonth: string) => {
    const y = newYear || year;
    const m = newMonth || month;

    if (y && m) {
      onChange(`${y}-${m}`);
    } else {
      onChange(`${y}-${m}`.replace(/-$/, "")); // allow partial
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>
        <span>{label} 
          {(!disabled && mandate) && (
          <span style={{ color: "red", fontWeight: "bold" }}> *</span>
        )}
        </span>
      </label>

      <div style={{ 
        display: "flex", 
        gap: 8, 
        width: "100%",
        border: error ? "1px solid #cc0000" : "1px solid transparent",
        borderRadius: 4,
        padding: error ? 4 : 0,}}
      >
        <select
          value={year}
          onChange={(e) => update(e.target.value, "")}
          disabled={disabled}
          style={{ ...selectStyle, flex: 1 }}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => update("", e.target.value)}
          disabled={disabled}
          style={{ ...selectStyle, flex: 1 }}
        >
          <option value="">Month</option>
          {months.map((m) => (
            <option key={m.v} value={m.v}>{m.t}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
