import { labelStyle, inputStyle, selectStyle } from "../../styles/globalStyle";

export default function MonthPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const year = value ? value.slice(0, 4) : "";
  const month = value ? value.slice(5, 7) : "";

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

  const update = (y: string, m: string) => {
    if (!y || !m) return onChange("");
    onChange(`${y}-${m}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>

      <div
        style={{
          display: "flex",
          gap: 8,
          width: "100%",
        }}
      >
        {/* Year Dropdown */}
        <select
          value={year}
          onChange={(e) => update(e.target.value, month)}
          style={{ ...selectStyle, flex: 1 }}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Month Dropdown */}
        <select
          value={month}
          onChange={(e) => update(year, e.target.value)}
          style={{ ...selectStyle, flex: 1 }}
        >
          <option value="">Month</option>
          {months.map((m) => (
            <option key={m.v} value={m.v}>
              {m.t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
