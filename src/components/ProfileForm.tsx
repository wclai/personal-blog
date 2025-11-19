// src/components/ProfileForm.tsx
"use client";

import { useState } from "react";
import type { Profile } from "../types";
import { popupShadow, popupForm, popupSection, inputStyle, checkboxStyle, buttonRow, buttonStyle, confirmButtonStyle } from "../styles/globalStyle";

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
      const url = profile ? `/api/profile/${profile.id}` : "/api/profile";
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
      style={popupShadow}
    >
      <div
        style={{
          ... popupForm,
          minWidth: 500,
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>{profile ? "Edit Profile" : "New Profile"}</h2>
        <div style={popupSection}>
          <input
            style={inputStyle}
            type="text"
            name="pf_name"
            value={formData.pf_name}
            onChange={handleChange}
            placeholder="Profile Name"
          />
          <input
            style={inputStyle}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
          />
          <input
            style={inputStyle}
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="Job Title"
          />
          <input
            style={inputStyle}
            type="text"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            placeholder="Tagline"
          />
          <input
            style={inputStyle}
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
          />
          <label style={checkboxStyle}>
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
            />
              Go public
          </label>
        </div>

        <div
          style={{
            ... buttonRow,
            justifyContent: "flex-end",
          }}
        >
          <button
            style={buttonStyle}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            style={confirmButtonStyle}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
