// src/components/SearchForm.tsx

"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { labelStyle, inputStyle, buttonRow } from "../styles/globalStyle";

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams?.get("q") ?? "";
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    // keep local state in sync when URL changes externally
    setQ(initialQ);
  }, [initialQ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();

    if (!trimmed) {
      // No query → go back to base /portfolio (no search yet)
      router.push("/portfolio");
      return;
    }

    const url = `/portfolio?q=${encodeURIComponent(trimmed)}&page=1`;
    router.push(url);
  };

  const handleReset = () => {
    setQ("");
    router.push("/portfolio");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={labelStyle}>
          Search
        </label>
        <input
          type="text"
          style={inputStyle}
          placeholder="Search by name, title, tagline, location…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div style={{ ...buttonRow, marginTop: 12 }}>
        <button
          type="submit"
          style={{
            padding: "8px 14px",
            background: "#2a67d0",
            color: "white",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          Search
        </button>

        <button
          type="button"
          style={{
            padding: "8px 14px",
            background: "#eeeeee",
            color: "#333",
            borderRadius: 4,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
