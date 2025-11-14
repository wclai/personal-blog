import { useEffect, useState } from "react";
import type { Profile } from "../../types/index";

export default function PortfolioPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedProfile =
    profiles.find((p) => p.id === selectedId) || null;

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch("/api/profiles?public=true", {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) {
            setProfiles([]);
            return;
          }
          console.warn("Unexpected response fetching profiles:", res.status);
          return;
        }

        const data = await res.json();
        setProfiles(data);
        if (data.length > 0) setSelectedId(data[0].id); // default select first
      } catch {
        console.warn("Failed to fetch public profiles.");
        setProfiles([]);
      }
    }

    fetchProfiles();
  }, []);

  if (profiles.length === 0)
    return <p>No public profile available.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      {/* --- dropdown --- */}
      <select
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        style={{ padding: 6, marginBottom: 20 }}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.pf_name || p.name}
          </option>
        ))}
      </select>

      {/* --- selected profile --- */}
      {selectedProfile && (
        <>
          <h1>{selectedProfile.name}</h1>
          <h3>{selectedProfile.job_title}</h3>
          <p>{selectedProfile.location}</p>

          {selectedProfile.photo_path && (
            <img
              src={selectedProfile.photo_path}
              alt={selectedProfile.name}
              style={{ maxWidth: 200 }}
            />
          )}

          {selectedProfile.tagline && (
            <p>{selectedProfile.tagline}</p>
          )}
        </>
      )}
    </div>
  );
}
