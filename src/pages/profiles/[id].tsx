// src/pages/profiles/[id].tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import EducationSection from "../../components/profiles/EducationSection";

// ---------- Types ----------
interface ProfileMaster {
  id: number;
  pf_name: string;
  name: string;
  job_title: string;
  tagline: string;
  location: string;
  introduction: string;
  photo_path: string;
  is_public: boolean;
  contact: {
    telephone: string;
    mobile: string;
    email: string;
    address: string;
  };
}

interface PfEducation {
  id: number | null;
  profile_id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_month: string;
  end_month: string;
  remark: string;
  location: string;
}

interface EducationChange {
  upserts: PfEducation[];
  deleteIds: number[];
  isValid: boolean;
}

// ---------- Main Component ----------
export default function ProfileEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [master, setMaster] = useState<ProfileMaster | null>(null);
  const [education, setEducation] = useState<PfEducation[]>([]);

  // Payload from child components (CRUD packet)
  const [educationPayload, setEducationPayload] = useState<EducationChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });

  const [saving, setSaving] = useState(false);

  // ---------- Auth Check ----------
  useEffect(() => {
    if (!loading) {
      setIsAdmin(user?.role === "admin");
      setAuthLoading(false);
    }
  }, [loading, user]);

  // ---------- Fetch Profile ----------
  useEffect(() => {
    if (!id) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profiles/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        setMaster(data.master);
        setEducation(data.education); // ONLY set once
      } catch (err) {
        console.error(err);
        alert("Failed to fetch profile data");
      }
    }

    fetchProfile();
  }, [id]);

  // ---------- Save Handler ----------
  const handleSave = async () => {
    if (!master) return;
  // Frontend validation: basic required fields check
    if (!master.name || !master.pf_name) {
      alert("PF Name and Name are required");
      return;
    }

    // Optional: also check child validity
    if (!educationPayload.isValid) {
      alert("Please check Education fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master,
          education: educationPayload, // send CRUD packet
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      alert("Profile saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  if (authLoading) return <p>Checking auth...</p>;
  if (!isAdmin) return <p>Unauthorized</p>;
  if (!master) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Edit Profile</h1>

      {/* ---------- Master Section ---------- */}
      <section style={{ marginBottom: 30 }}>
        <h2>Profile Master</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label>
            PF Name: <input value={master.pf_name} onChange={e => setMaster({ ...master, pf_name: e.target.value })} />
          </label>
          <label>
            Name: <input value={master.name} onChange={e => setMaster({ ...master, name: e.target.value })} />
          </label>
          <label>
            Job Title: <input value={master.job_title} onChange={e => setMaster({ ...master, job_title: e.target.value })} />
          </label>
          <label>
            Tagline: <input value={master.tagline} onChange={e => setMaster({ ...master, tagline: e.target.value })} />
          </label>
          <label>
            Location: <input value={master.location} onChange={e => setMaster({ ...master, location: e.target.value })} />
          </label>
          <label>
            Introduction: <textarea value={master.introduction} onChange={e => setMaster({ ...master, introduction: e.target.value })} />
          </label>
          <label>
            Photo URL: <input value={master.photo_path} onChange={e => setMaster({ ...master, photo_path: e.target.value })} />
          </label>
          <label>
            Public: <input type="checkbox" checked={master.is_public} onChange={e => setMaster({ ...master, is_public: e.target.checked })} />
          </label>
        </div>

        {/* Contact */}
        <div style={{ marginTop: 20 }}>
          <h3>Contact Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label>
              Telephone: <input value={master.contact.telephone} onChange={e => setMaster({ ...master, contact: { ...master.contact, telephone: e.target.value } })} />
            </label>
            <label>
              Mobile: <input value={master.contact.mobile} onChange={e => setMaster({ ...master, contact: { ...master.contact, mobile: e.target.value } })} />
            </label>
            <label>
              Email: <input value={master.contact.email} onChange={e => setMaster({ ...master, contact: { ...master.contact, email: e.target.value } })} />
            </label>
            <label>
              Address: <input value={master.contact.address} onChange={e => setMaster({ ...master, contact: { ...master.contact, address: e.target.value } })} />
            </label>
          </div>
        </div>
      </section>

      {/* ---------- Education Section ---------- */}
      <section style={{ marginBottom: 30 }}>
        <EducationSection
          initialRows={education} // stable, only from backend
          onChange={(packet) => {
            // Only store CRUD packet
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setEducationPayload(normalized);
          }}
        />
      </section>

      {/* ---------- Save ---------- */}
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={handleSave} disabled={saving}>
          Save
        </button>
        <button onClick={() => router.push("/profiles")}>Return</button>
      </div>
    </div>
  );
}
