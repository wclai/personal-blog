// src/pages/profile/index.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Profile } from "../../types";
import ProfileForm from "../../components/ProfileForm";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  // NEW: auth states
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // -------------------------
  // Check admin access
  // -------------------------
  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setIsAdmin(data.role === "admin");
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  // ---------------------------------------------------------
  // Fetch public profiles
  // ---------------------------------------------------------
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile?public=true", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        console.warn("Failed to fetch profile:", res.status);
        setProfile([]);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile([]);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Block page until auth check completes
  if (authLoading) return <p>Loading...</p>;
  if (!isAdmin) return <p>Unauthorized</p>;

  const handleCreateProfile = () => {
    setShowProfileForm(true);
  };

  const handleProfileSaved = () => {
    fetchProfile();
    setShowProfileForm(false);
  };

  const handleProfileCancel = () => {
    setShowProfileForm(false);
  };

  const thStyle = {
    padding: "12px 10px",
    borderBottom: "1px solid #ddd",
    textAlign: "left" as const,
    fontWeight: 600,
    fontSize: 14,
    color: "#333",
  };

  const tdStyle = {
    padding: "10px 10px",
    verticalAlign: "top" as const,
    color: "#444",
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>Profile</h1>

      <button
        onClick={handleCreateProfile}
        style={{
          padding: "8px 16px",
          border: "1px solid #ccc",
          borderRadius: 4,
          backgroundColor: "#f0f0f0",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        ➕ Create New Profile
      </button>

      {showProfileForm && (
        <ProfileForm
          profile={null}
          onSaved={handleProfileSaved}
          onCancel={handleProfileCancel}
        />
      )}

      <div>
        {profile.length === 0 ? (
          <p>There is no Profiles.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              border: "1px solid #ddd",
              borderRadius: 8,
              overflow: "hidden",
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={thStyle}>Profile Name</th>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Tagline</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Public?</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {profile.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    background: i % 2 === 0 ? "#ffffff" : "#fafafa",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <td style={tdStyle}>{p.pf_name}</td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.job_title}</td>
                  <td style={tdStyle}>
                    {p.tagline && (
                      <span style={{ color: "#555", fontStyle: "italic" }}>
                        {p.tagline}
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>{p.location}</td>
                  <td style={tdStyle}>{p.is_public ? "Yes" : "No"}</td>

                  <td style={tdStyle}>
                    <Link
                      href={`/profile/${p.id}`}
                      style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        background: "#4caf50",
                        color: "white",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontSize: 13,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                      }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
