// src/pages/portfolio/index.tsx

import React, { useEffect, useState, FormEvent } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
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

interface PublicProfileListItem {
  id: number;
  name: string;
  job_title: string | null;
  tagline: string | null;
  location: string | null;
  pf_name: string | null;
}

interface PublicProfileSearchResult {
  items: PublicProfileListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PortfolioPage: NextPage = () => {
  const router = useRouter();

  // Search input
  const [query, setQuery] = useState("");
  // Results & pagination
  const [items, setItems] = useState<PublicProfileListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // On first load or URL change, sync state from query params
  useEffect(() => {
    if (!router.isReady) return;

    const qParam = router.query.q;
    const pageParam = router.query.page;

    const qStr = Array.isArray(qParam) ? qParam[0] : qParam;
    const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam;

    const initialQ = qStr ?? "";
    const initialPage = pageStr ? parseInt(pageStr, 10) || 1 : 1;

    setQuery(initialQ);
    setPage(initialPage);

    const hasPageParam = typeof pageParam !== "undefined";

    if (initialQ.trim() || hasPageParam) {
      performSearch(initialQ, initialPage);
    } else {
      // Only the true initial load (no q, no page) shows "No search yet"
      setHasSearched(false);
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.q, router.query.page]);

  async function performSearch(q: string, pageNum: number = 1) {
    const trimmed = q.trim();

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Build query string: if trimmed is empty, omit q → API returns ALL public profiles
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      params.set("page", String(pageNum));

      const url = `/api/portfolio/profileSearch?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data: PublicProfileSearchResult = await res.json();

      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
      setTotalPages(data.totalPages);

      // Sync URL with current search
      const nextQuery: Record<string, string> = { page: String(data.page) };
      if (trimmed) nextQuery.q = trimmed;

      router.replace(
        {
          pathname: "/portfolio",
          query: nextQuery,
        },
        undefined,
        { shallow: true }
      );
    } catch (err: any) {
      console.error("Portfolio search error:", err);
      setError("Failed to search portfolios. Please try again.");
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

  return (
    <div style={mainShadow}>
      <div style={mainSection}>
          <h1 style={mainHeader}>
            Portfolio Directory
          </h1>
          <p style={{ marginBottom: 16, fontSize: 14, color: "#555" }}>
            Browse public portfolios. Enter keywords and click{" "}
            <strong>Search</strong>.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={labelStyle}>Search</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Search by name, title, tagline, location…"
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
          {!hasSearched && !loading && !error && (
            <div style={{ fontSize: 14, color: "#777", marginTop: 12 }}>
              No search yet. Enter keywords (e.g. &quot;frontend taipei&quot;) and
              click <strong>Search</strong>.
            </div>
          )}

          {loading && (
            <div style={{ fontSize: 14, color: "#555", marginTop: 12 }}>
              Searching portfolios…
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

          {hasSearched && !loading && !error && (
            <>
              {/* Summary */}
              <div style={{ fontSize: 14, color: "#555", margin: "12px 0" }}>
                {total === 0 ? (
                  <>
                    No results found for <strong>{query}</strong>.
                  </>
                ) : (
                  <>
                    Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
                    <strong>{total}</strong> result{total > 1 ? "s" : ""} for{" "}
                    <strong>{query}</strong>.
                  </>
                )}
              </div>

              {/* Result table */}
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
                        <th style={thStyle}>Full Name</th>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Tagline</th>
                        <th style={thStyle}>Location</th>
                        <th style={thStyle}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(profile => (
                        <tr key={profile.id}>
                          <td style={tdStyle}>{profile.name}</td>
                          <td style={tdStyle}>{profile.job_title ?? ""}</td>
                          <td style={tdStyle}>{profile.tagline ?? ""}</td>
                          <td style={tdStyle}>{profile.location ?? ""}</td>
                          <td style={tdStyle}>
                            <a
                              href={`/portfolio/${profile.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: "none" }}
                            >
                              <button
                                type="button"
                                style={{
                                  padding: "6px 10px",
                                  background: "#2a67d0",
                                  color: "white",
                                  borderRadius: 4,
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 13,
                                }}
                                aria-label={`View portfolio of ${profile.name}`}
                              >
                                View
                              </button>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
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

export default PortfolioPage;
