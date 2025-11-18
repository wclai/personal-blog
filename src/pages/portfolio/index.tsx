import { useEffect, useState } from "react";
import type { Profile } from "../../types/index";

export default function PortfolioPage() {
  const [profile, setProfile] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedProfile =
    profile.find((p) => p.id === selectedId) || null;

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile?public=true", {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401) {
            setProfile([]);
            return;
          }
          console.warn("Unexpected response fetching profile:", res.status);
          return;
        }

        const data = await res.json();
        setProfile(data);
        if (data.length > 0) setSelectedId(data[0].id); // default select first
      } catch {
        console.warn("Failed to fetch public profile.");
        setProfile([]);
      }
    }

    fetchProfile();
  }, []);

  if (profile.length === 0)
    return <p>No public profile available.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      {/* --- dropdown --- */}
      <select
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        style={{ padding: 6, marginBottom: 20 }}
      >
        {profile.map((p) => (
          <option key={p.id} value={p.id}>
            {p.pf_name || p.name}
          </option>
        ))}
      </select>

      {/* --- selected profile --- */}
      {selectedProfile && (
        <>
          <p>{selectedProfile.photo_path && (
            <img
              src={selectedProfile.photo_path}
              alt={selectedProfile.name}
              style={{ maxWidth: 200 }}
            />
          )}</p>
          <h1>{selectedProfile.name}</h1>
          <h3>{selectedProfile.job_title}</h3>
          {selectedProfile.tagline && (
            <p>{selectedProfile.tagline}</p>
          )}
          <p>{selectedProfile.location}</p>
        </>
      )}
    </div>
  );
}
