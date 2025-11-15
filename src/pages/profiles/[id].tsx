// src/pages/profiles/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import EducationSection from "../../components/profiles/EducationSection";
//import Modal from "../../components/Modal";
import { labelStyle , inputStyle , sectionBox , buttonRow , buttonStyle, confirmButtonStyle } from "../../styles/globalStyle";

/* ---------- Modal Component ---------- */
function Modal({
  open,
  title,
  message,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 6,
          width: 360,
        }}
      >
        <h3>{title}</h3>
        <p style={{ marginTop: 10 }}>{message}</p>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button style= {buttonStyle} onClick={onClose}>
            Cancel
          </button>
          {onConfirm && (
            <button onClick={onConfirm} style={confirmButtonStyle}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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

/* ---------- Main Component ---------- */
export default function ProfileEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [master, setMaster] = useState<ProfileMaster | null>(null);
  const [education, setEducation] = useState<PfEducation[]>([]);

  const [educationPayload, setEducationPayload] = useState<EducationChange>({
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
        message: "PF Name and Name are required.",
      });
      return;
    }

    if (!educationPayload.isValid) {
      setModal({
        open: true,
        title: "Validation",
        message: "Please check Education fields.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          master,
          education: educationPayload,
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
            Profile Name
            <input style={inputStyle} value={master.pf_name} onChange={(e) => setMaster({ ...master, pf_name: e.target.value })} />
          </label>

          <label style={labelStyle}>
            Full Name
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
              value={master.introduction}
              onChange={(e) => setMaster({ ...master, introduction: e.target.value })}
            />
          </label>

          <label style={labelStyle}>
            Photo URL
            <input style={inputStyle} value={master.photo_path} onChange={(e) => setMaster({ ...master, photo_path: e.target.value })} />
          </label>

          <label style={labelStyle}>
            Public
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
      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />

      <Modal
        open={confirmReturn}
        title="Confirm Return"
        message="Please remember to save before leaving. Are you sure you want to return?"
        onClose={() => setConfirmReturn(false)}
        onConfirm={confirmReturnAction}
      />
    </div>
  );
}
