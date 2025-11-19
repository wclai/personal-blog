// src/components/UploadPhoto.tsx

"use client";
import React, { useState } from "react";
import { popupShadow, popupForm, popupSection, buttonRow, buttonStyle, confirmButtonStyle, errorMessage } from "../styles/globalStyle";

export default function UploadPhoto({
  open,
  onClose,
  profileId,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  profileId: number | string;
  onUploaded?: (temp_id: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSelect = (f?: File) => {
    setError(null);
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Unsupported file type");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("File too large (max 2MB)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const doUpload = async () => {
    if (!file) return setError("No file selected");

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/profile-photo/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Temp upload failed");
      const json = await res.json(); // { temp_id }

      onUploaded?.(json.temp_id);

      setFile(null);
      setPreview(null);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={popupShadow}>
      <div style={{
        ... popupForm,
        width: 480,
      }}>
        <h3 style={{ marginBottom: "1rem" }}>Upload Profile Photo</h3>

        <div style={{ marginTop: 12 }}>
          <input
            style={{ marginBottom: "1rem" }}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) =>
              handleSelect(e.target.files ? e.target.files[0] : undefined)
            }
          />
        </div>
        <p>
          <span style={{ fontStyle: "italic" }}>
            Accepted: JPG / PNG / WebP • Max size: 2 MB
          </span>
        </p>

        {preview && (
          <div style={{ marginTop: 12 }}>
            <div style={{
              width: 160, height: 160,
              borderRadius: 8, overflow: "hidden",
              border: "1px solid #ddd"
            }}>
              <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        )}

        {error && <div style={ errorMessage }>{error}</div>}

        <div style={{ ... buttonRow, justifyContent: "flex-end" }}>
          <button
            style={buttonStyle}
            onClick={() => { setFile(null); setPreview(null); onClose(); }}
            disabled={uploading}
          >
            Cancel
          </button>

          <button
            style={confirmButtonStyle}  
            onClick={doUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
