// src/pages/profiles/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { ConfirmModal } from "../../components/Modal";
import { labelStyle , inputStyle , sectionBox , buttonRow , buttonStyle, confirmButtonStyle, Red } from "../../styles/globalStyle";

import EducationSection from "../../components/profiles/EducationSection";
import WorkSection from "../../components/profiles/WorkSection";

/* ---------- Types ---------- */
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
  location: string;
  degree: string;
  field_of_study: string;
  start_month: string;
  end_month: string;
  remark: string;
}

interface EducationChange {
  upserts: PfEducation[];
  deleteIds: number[];
  isValid: boolean;
}

interface PfWork {
  id: number | null;
  profile_id: number;
  company: string;
  location: string;
  position: string;
  description: string;
  is_present: boolean;
  start_month: string;
  end_month: string;
  remark: string;

}

interface WorkChange {
  upserts: PfWork[];
  deleteIds: number[];
  isValid: boolean;
}

/* ---------- Main Component ---------- */
export default function ProfileEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [master, setMaster] = useState<ProfileMaster | null>(null);
  const [education, setEducation] = useState<PfEducation[]>([]);
  const [work, setWork] = useState<PfWork[]>([]);

  const [educationPayload, setEducationPayload] = useState<EducationChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });
  const [workPayload, setWorkPayload] = useState<WorkChange>({
    upserts: [],
    deleteIds: [],
    isValid: true,
  });

  const [saving, setSaving] = useState(false);

  // Modal states
  const [modal, setModal] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });

  const [confirmReturn, setConfirmReturn] = useState(false);

  /* ---------- Auth Check ---------- */
  useEffect(() => {
    if (!loading) {
      setIsAdmin(user?.role === "admin");
      setAuthLoading(false);
    }
  }, [loading, user]);

  /* ---------- Fetch Profile ---------- */
  useEffect(() => {
    if (!id) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profiles/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        setMaster(data.master);
        setEducation(data.education);
        setWork(data.work);
      } catch (err) {
        console.error(err);
        setModal({
          open: true,
          title: "Error",
          message: "Failed to fetch profile data.",
        });
      }
    }

    fetchProfile();
  }, [id]);

  /* ---------- Save Handler ---------- */
  const handleSave = async () => {
    if (!master) return;

    if (!master.name || !master.pf_name) {
      setModal({
        open: true,
        title: "Validation",
        message: "Profile Name and Full Name are required.",
      });
      return;
    }

    if (educationPayload.isValid === false ||
      workPayload.isValid === false
    ) {
      setModal({
        open: true,
        title: "Validation",
        message: "Please fill in all mandatory fields.",
      });
      return;
    }

    for (const row of education) {
      if (row.start_month && row.end_month < row.start_month) {
        alert("End Month must be later or equal to Start Month.");
        return;
      }
    }

    for (const row of work) {
      if (!row.is_present && row.end_month) {
        if (row.start_month && row.end_month < row.start_month) {
          alert("End Month must be later or equal to Start Month.");
          return;
        }
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master,
          education: educationPayload,
          work: workPayload,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setModal({
        open: true,
        title: "Success",
        message: "Profile saved successfully.",
      });
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        title: "Error",
        message: "Failed to save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Return Handler ---------- */
  const handleReturn = () => {
    setConfirmReturn(true);
  };

  const confirmReturnAction = () => {
    router.push("/profiles");
  };

  /* ---------- UI ---------- */
  if (authLoading) return <p>Checking auth...</p>;
  if (!isAdmin) return <p>Unauthorized</p>;
  if (!master) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Edit Profile</h1>

      {/* ---------- Master Section ---------- */}
      <section style={sectionBox}>
        <h2>Profile</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={labelStyle}>
            <span style={{ fontStyle: "italic" }}>Mandatory field(s) masked with <span style={{ color: "red", fontWeight: "bold" }}>*</span></span>
          </label>

          <label style={labelStyle}>
            <span>Profile Name<span style={{ color: "red", fontWeight: "bold" }}> *</span></span>
            <input style={inputStyle} value={master.pf_name} onChange={(e) => setMaster({ ...master, pf_name: e.target.value })} />
          </label>

          <label style={labelStyle}>
            <span>Full Name<span style={{ color: "red", fontWeight: "bold" }}> *</span></span>
            <input style={inputStyle} value={master.name} onChange={(e) => setMaster({ ...master, name: e.target.value })} />
          </label>

          <label style={labelStyle}>
            Job Title
            <input style={inputStyle} value={master.job_title} onChange={(e) => setMaster({ ...master, job_title: e.target.value })} />
          </label>

          <label style={labelStyle}>
            Tagline
            <input style={inputStyle} value={master.tagline} onChange={(e) => setMaster({ ...master, tagline: e.target.value })} />
          </label>

          <label style={labelStyle}>
            Location
            <input style={inputStyle} value={master.location} onChange={(e) => setMaster({ ...master, location: e.target.value })} />
          </label>

          <label style={labelStyle}>
            Introduction
            <textarea
              style={{ ...inputStyle, height: 80 }}
              value={master.introduction ?? ""}
              onChange={(e) => setMaster({ ...master, introduction: e.target.value })}
            />
          </label>

          <label style={labelStyle}>
            Photo URL
            <input style={inputStyle} value={master.photo_path} onChange={(e) => setMaster({ ...master, photo_path: e.target.value })} />
          </label>

          <label style={labelStyle}>
            Is public?
            <input
              type="checkbox"
              checked={master.is_public}
              onChange={(e) => setMaster({ ...master, is_public: e.target.checked })}
            />
          </label>
        </div>

        {/* Contact */}
        <div style={{ marginTop: 20 }}>
          <h3>Contact Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span></span>
            <label style={labelStyle}>
              Telephone
              <input
                style={inputStyle}
                value={master.contact.telephone}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, telephone: e.target.value } })}
              />
            </label>

            <label style={labelStyle}>
              Mobile
              <input
                style={inputStyle}
                value={master.contact.mobile}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, mobile: e.target.value } })}
              />
            </label>

            <label style={labelStyle}>
              Email
              <input
                style={inputStyle}
                value={master.contact.email}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, email: e.target.value } })}
              />
            </label>

            <label style={labelStyle}>
              Address
              <input
                style={inputStyle}
                value={master.contact.address}
                onChange={(e) => setMaster({ ...master, contact: { ...master.contact, address: e.target.value } })}
              />
            </label>
          </div>
        </div>
      </section>

      {/* ---------- Education Section ---------- */}
      <section style={sectionBox}>
        <EducationSection
          initialRows={education}
          onChange={(packet) => {
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

      {/* ---------- Work Section ---------- */}
      <section style={sectionBox}>
        <WorkSection
          initialRows={work}
          onChange={(packet) => {
            const normalized = {
              ...packet,
              upserts: packet.upserts.map((r) => ({
                ...r,
                profile_id: Number(id),
              })),
            };
            setWorkPayload(normalized);
          }}
        />
      </section>
      
      <label style={labelStyle}>
        <span style={{ fontStyle: "italic" }}>Mandatory field(s) masked with <span style={{ color: "red", fontWeight: "bold" }}>*</span></span>
      </label>
      
      {/* ---------- Buttons ---------- */}
      <div style={buttonRow}>
        <button style={buttonStyle} onClick={handleSave} disabled={saving}>
          Save
        </button>
        <button style={buttonStyle} onClick={handleReturn}>
          Return
        </button>
      </div>

      {/* ---------- Modals ---------- */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />

      <ConfirmModal
        open={confirmReturn}
        title="Confirm Return"
        message="Please remember to save before leaving. Are you sure you want to return?"
        labelClose="Cancel"
        onClose={() => setConfirmReturn(false)}
        labelConfirm="Return"
        onConfirm={confirmReturnAction}
      />
    </div>
  );
}
