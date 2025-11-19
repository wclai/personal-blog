// src/pages/profile/index.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mainShadow, mainSection, buttonRow, buttonStyle, confirmButtonStyle, tableStyle, trStyle, thStyle, tdStyle } from "../../styles/globalStyle";
import type { Profile } from "../../types";
import ProfileForm from "../../components/ProfileForm";
import { ConfirmModal } from "../../components/Modal";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  // auth states
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const router = useRouter();
  const refreshPage = () => {
    router.refresh(); // re-fetches data for current route
  };

  return (
    <div style={mainShadow}>
      <div style={mainSection}>
        <h1 style={{ marginBottom: "1rem" }}>
          Profile
        </h1>
        <div style={{
          ... buttonRow,
          marginBottom: "1rem"
          }}>
          <button
            style={confirmButtonStyle}
            onClick={handleCreateProfile}
          >
            + Create New Profile
          </button>
        </div>

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
              style={tableStyle}
            >
              <thead>
                <tr style={trStyle}>
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
                      <div style={{
                        ... buttonRow,
                        marginTop: 0
                      }}>
                        <Link
                          style={{
                            ... confirmButtonStyle, 
                            marginTop: 0,
                          }}
                          href={`/profile/${p.id}`}
                        >
                          Edit
                        </Link>
                        <button
                          style={{
                            ... confirmButtonStyle, 
                            background: "#e00",
                            marginTop: 0,
                          }}
                          onClick={() => {
                            setDeleteTarget(p.id);
                            setShowDeleteModal(true);
                          }}
                        >
                        Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <ConfirmModal
          open={showDeleteModal}
          title="Confirm Delete"
          message="Confirm delete profile?"
          labelClose="Cancel"
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
          labelConfirm="Confirm"
          onConfirm={async () => {
            if (!deleteTarget) return;
            await fetch(`/api/profile/delete/${deleteTarget}`, {
              method: "POST"
            });

            setShowDeleteModal(false);
            setDeleteTarget(null);
            refreshPage();
          }}
        />
      </div>
    </div>
  );  
}
