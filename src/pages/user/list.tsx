// src/pages/user/list.tsx

import React, { useEffect, useState, FormEvent } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import {
  mainShadow,
  mainSection,
  mainHeader,
  labelStyle,
  inputStyle,
  buttonRow,
  thStyle,
  tdStyle,
} from "../../styles/globalStyle";

interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface UserSearchResult {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const UsersListPage: NextPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Search & pagination
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Guard: only admin can access
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // not logged in → go to login
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      // logged in but not admin → optional: redirect or show message
      router.replace("/"); // send them home
    }
  }, [authLoading, user, router]);

  // Sync state from URL on load / URL change
  useEffect(() => {
    if (!router.isReady) return;
    if (!user || user.role !== "admin") return; // wait for admin check

    const qParam = router.query.q;
    const pageParam = router.query.page;

    const qStr = Array.isArray(qParam) ? qParam[0] : qParam;
    const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam;

    const initialQ = qStr ?? "";
    const initialPage = pageStr ? parseInt(pageStr, 10) || 1 : 1;

    setQuery(initialQ);
    setPage(initialPage);

    // For admin list, even empty query should list all users
    performSearch(initialQ, initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.q, router.query.page, user?.role]);

  async function performSearch(q: string, pageNum: number = 1) {
    const trimmed = q.trim();

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      params.set("page", String(pageNum));

      const url = `/api/user/userSearch?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }

      const data: UserSearchResult = await res.json();

      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
      setTotalPages(data.totalPages);

      // Sync URL
      const nextQuery: Record<string, string> = { page: String(data.page) };
      if (trimmed) nextQuery.q = trimmed;

      router.replace(
        {
          pathname: "/user/list",
          query: nextQuery,
        },
        undefined,
        { shallow: true }
      );
    } catch (err: any) {
      console.error("Users search error:", err);
      setError(err.message || "Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearch(query, 1);
  };

  const handleReset = () => {
    setQuery("");
    performSearch("", 1);
  };

  const handlePrevPage = () => {
    if (page <= 1) return;
    performSearch(query, page - 1);
  };

  const handleNextPage = () => {
    if (totalPages === 0 || page >= totalPages) return;
    performSearch(query, page + 1);
  };

  const from = hasSearched && total > 0 ? (page - 1) * pageSize + 1 : 0;
  const to = hasSearched && total > 0 ? Math.min(page * pageSize, total) : 0;

  async function handleToggleActive(target: UserListItem) {
    if (target.role === "admin") return; // safety on client

    const newStatus = !target.is_active;
    setUpdatingId(target.id);
    setError(null);

    try {
      const res = await fetch("/api/user/userSearch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: target.id, is_active: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to update user.");
      }

      // Update local state
      setItems(prev =>
        prev.map(u =>
          u.id === target.id ? { ...u, is_active: newStatus } : u
        )
      );
    } catch (err: any) {
      console.error("Update user error:", err);
      setError(err.message || "Failed to update user.");
    } finally {
      setUpdatingId(null);
    }
  }

  // while auth is loading or redirecting
  if (authLoading || !user || user.role !== "admin") {
    return (
      <div style={mainShadow}>
        <div style={mainSection}>
          <h1 style={mainHeader}>User Management</h1>
          <p>Checking permissions…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={mainShadow}>
      <div style={mainSection}>
        <h1 style={mainHeader}>User Management</h1>
        <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
          Search and manage users. Only admins can access this page.
        </p>

        {/* Search form (similar style to portfolio/search form) */}
        <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Search by name or email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
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

        {/* Status / messages */}
        {loading && (
          <div style={{ fontSize: 14, color: "#555", marginTop: 12 }}>
            Loading users…
          </div>
        )}

        {error && (
          <div
            style={{
              fontSize: 14,
              color: "#cc0000",
              marginTop: 12,
              fontStyle: "italic",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ fontSize: 14, color: "#555", margin: "12px 0" }}>
              {total === 0 ? (
                <>No users found.</>
              ) : (
                <>
                  Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
                  <strong>{total}</strong> user{total > 1 ? "s" : ""}.
                </>
              )}
            </div>

            {total > 0 && (
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: "white",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Role</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(u => (
                      <tr key={u.id}>
                        <td style={tdStyle}>{u.name}</td>
                        <td style={tdStyle}>{u.email}</td>
                        <td style={tdStyle}>{u.role}</td>
                        <td style={tdStyle}>
                          {u.is_active ? "Active" : "Inactive"}
                        </td>
                        <td style={tdStyle}>
                          {u.role === "admin" ? (
                            <span style={{ fontSize: 12, color: "#777" }}>
                              Admin (always active)
                            </span>
                          ) : (
                            <label
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                cursor:
                                  updatingId === u.id ? "wait" : "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={u.is_active}
                                disabled={updatingId === u.id}
                                onChange={() => handleToggleActive(u)}
                              />
                              <span style={{ fontSize: 13 }}>
                                {u.is_active ? "Deactivate" : "Activate"}
                              </span>
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
                  Page <strong>{page}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={page <= 1}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background: page > 1 ? "#fff" : "#f0f0f0",
                      cursor: page > 1 ? "pointer" : "default",
                    }}
                  >
                    ◀ Prev
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={totalPages === 0 || page >= totalPages}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background:
                        totalPages > 0 && page < totalPages
                          ? "#fff"
                          : "#f0f0f0",
                      cursor:
                        totalPages > 0 && page < totalPages
                          ? "pointer"
                          : "default",
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersListPage;
