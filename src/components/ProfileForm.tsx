// src/components/ProfileForm.tsx
"use client";

import { useState } from "react";
import type { Profile } from "../types";

interface ProfileFormProps {
  profile: Profile | null; // null for new profile
  onSaved: (saved: Profile) => void;
  onCancel?: () => void;
}

export default function ProfileForm({ profile, onSaved, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState<Profile>({
    id: profile?.id || 0,
    pf_name: profile?.pf_name || "",
    name: profile?.name || "",
    job_title: profile?.job_title || "",
    location: profile?.location || "",
    tagline: profile?.tagline || "",
    is_public: profile?.is_public || false,
    photo_path: profile?.photo_path || "",
    user_id: profile?.user_id || 0,
    created_at: profile?.created_at || Date.now(),
    updated_at: profile?.updated_at || Date.now(),
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, type } = target;
    const value = type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validation: ensure mandatory fields
    if (!formData.pf_name?.trim() || !formData.name?.trim()) {
      alert("Profile Name and Full Name are required.");
      return;
    }
    setSaving(true);
    try {
      const method = profile ? "PUT" : "POST";
      const url = profile ? `/api/profiles/${profile.id}` : "/api/profiles";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const saved: Profile = await res.json();
      onSaved(saved);
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 6,
          minWidth: 300,
          maxWidth: 600,
        }}
      >
        <h2>{profile ? "Edit Profile" : "New Profile"}</h2>

        <input
          type="text"
          name="pf_name"
          value={formData.pf_name}
          onChange={handleChange}
          placeholder="Profile Name"
          style={{ display: "block", marginBottom: 5, width: "100%" }}
        />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          style={{ display: "block", marginBottom: 5, width: "100%" }}
        />
        <input
          type="text"
          name="job_title"
          value={formData.job_title}
          onChange={handleChange}
          placeholder="Job Title"
          style={{ display: "block", marginBottom: 5, width: "100%" }}
        />
        <input
          type="text"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          placeholder="Tagline"
          style={{ display: "block", marginBottom: 5, width: "100%" }}
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          style={{ display: "block", marginBottom: 5, width: "100%" }}
        />
        <label style={{ display: "block", marginBottom: 5 }}>
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
          />{" "}
          Public
        </label>

        <div style={{ marginTop: 10, textAlign: "right" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "6px 12px", marginRight: 10 }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 4,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
