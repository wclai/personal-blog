// src/pages/profile/index.tsx

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import {
  mainShadow,
  mainSection,
  mainHeader,
  buttonRow,
  buttonStyle,
  confirmButtonStyle,
  tableStyle,
  trStyle,
  thStyle,
  tdStyle,
  labelStyle,
  inputStyle,
} from "../../styles/globalStyle";
import type { Profile } from "../../types";
import ProfileForm from "../../components/ProfileForm";
import { ConfirmModal } from "../../components/Modal";

type AuthUser = {
  id: number;
  role: string;
  name?: string;
  email?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // 🔹 auth states: now we keep the full user + role
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Search & pagination states
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // -------------------------
  // Check auth & role
  // -------------------------
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (!res.ok) {
          // not logged in or error
          setAuthUser(null);
          setIsAdmin(false);
          setAuthLoading(false);
          return;
        }

        const data = await res.json();

        // assuming /api/auth/me returns { id, role, ... }
        const user: AuthUser = {
          id: data.id,
          role: data.role,
          name: data.name,
          email: data.email,
        };

        setAuthUser(user);
        setIsAdmin(user.role === "admin");
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthUser(null);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // ---------------------------------------------------------
  // Fetch profiles (same endpoint as before)
  // ---------------------------------------------------------
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile?public=true", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setPage(1);
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
  if (!authUser) return <p>Unauthorized</p>; // 🔹 now allow admin or user, but not anonymous

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

  // -------------------------
  // Search + pagination logic
  // -------------------------
  const trimmedQuery = query.trim().toLowerCase();

  // 🔹 baseProfiles depends on role
  // - admin: all profiles
  // - user: only profiles where profile.user_id === authUser.id
  const baseProfiles = isAdmin
    ? profile
    : profile.filter((p: any) => p.user_id === authUser.id);

  const filteredProfiles = trimmedQuery
    ? baseProfiles.filter((p: any) => {
        const pfName = (p.pf_name || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const jobTitle = (p.job_title || "").toLowerCase();
        const tagline = (p.tagline || "").toLowerCase();
        const location = (p.location || "").toLowerCase();

        return (
          pfName.includes(trimmedQuery) ||
          name.includes(trimmedQuery) ||
          jobTitle.includes(trimmedQuery) ||
          tagline.includes(trimmedQuery) ||
          location.includes(trimmedQuery)
        );
      })
    : baseProfiles;

  const total = filteredProfiles.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const visibleProfiles = filteredProfiles.slice(startIndex, endIndex);
  const from = total === 0 ? 0 : startIndex + 1;
  const to = total === 0 ? 0 : Math.min(endIndex, total);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleReset = () => {
    setQuery("");
    setPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (totalPages > 0 && currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  return (
    <div style={mainShadow}>
      <div style={mainSection}>
        <h1 style={mainHeader}>Profile</h1>
        <div
          style={{
            ...buttonRow,
            marginBottom: "1rem",
          }}
        >
          <button style={confirmButtonStyle} onClick={handleCreateProfile}>
            + Create New Profile
          </button>
        </div>

        {showProfileForm && (
          <ProfileForm profile={null} onSaved={handleProfileSaved} onCancel={handleProfileCancel} />
        )}

        {/* When there are no profiles at all (after role filter), keep original message */}
        {baseProfiles.length === 0 ? (
          <p>There is no Profiles.</p>
        ) : (
          <>
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={labelStyle}>Search Profiles</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="Search by profile name, full name, title, tagline, or location…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div
                style={{
                  ...buttonRow,
                  marginTop: 12,
                }}
              >
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: "#2a67d0",
                    color: "white",
                  }}
                >
                  Search
                </button>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: "#eeeeee",
                    color: "#333",
                    border: "1px solid #ccc",
                  }}
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Summary / pagination info */}
            <div style={{ fontSize: 14, color: "#555", margin: "0.5rem 0" }}>
              {total === 0 ? (
                <>No profiles match your search.</>
              ) : (
                <>
                  Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
                  <strong>{total}</strong> profile{total > 1 ? "s" : ""}.
                </>
              )}
            </div>

            {/* Table (same columns & buttons, but using paged results) */}
            {total > 0 && (
              <table style={tableStyle}>
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
                  {visibleProfiles.map((p: any, i: number) => (
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
                          <span style={{ color: "#555", fontStyle: "italic" }}>{p.tagline}</span>
                        )}
                      </td>
                      <td style={tdStyle}>{p.location}</td>
                      <td style={tdStyle}>{p.is_public ? "Yes" : "No"}</td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            ...buttonRow,
                            marginTop: 0,
                          }}
                        >
                          <Link
                            style={{
                              ...confirmButtonStyle,
                              marginTop: 0,
                            }}
                            href={`/profile/${p.id}`}
                          >
                            Edit
                          </Link>
                          <button
                            style={{
                              ...confirmButtonStyle,
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

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 16,
                  fontSize: 14,
                }}
              >
                <div>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background: currentPage > 1 ? "#fff" : "#f0f0f0",
                      cursor: currentPage > 1 ? "pointer" : "default",
                    }}
                  >
                    ◀ Prev
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={totalPages === 0 || currentPage >= totalPages}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background:
                        totalPages > 0 && currentPage < totalPages ? "#fff" : "#f0f0f0",
                      cursor:
                        totalPages > 0 && currentPage < totalPages ? "pointer" : "default",
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete confirmation modal – unchanged logic */}
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
              method: "POST",
            });

            setShowDeleteModal(false);
            setDeleteTarget(null);
            // Re-fetch profiles to reflect deletion
            fetchProfile();
          }}
        />
      </div>
    </div>
  );
}
