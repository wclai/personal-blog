// src/components/UploadPhoto.tsx
"use client";
import React, { useState } from "react";

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

      const res = await fetch("/api/profile/profile-photo/upload-temp", {
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
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(0,0,0,0.4)",
      zIndex: 1200,
    }}>
      <div style={{
        width: 440,
        background: "white",
        borderRadius: 8,
        padding: 20,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
      }}>
        <h3 style={{ margin: 0 }}>Upload Profile Photo</h3>

        <div style={{ marginTop: 12 }}>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) =>
              handleSelect(e.target.files ? e.target.files[0] : undefined)
            }
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
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

        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button
            onClick={() => { setFile(null); setPreview(null); onClose(); }}
            disabled={uploading}
          >
            Cancel
          </button>

          <button
            onClick={doUpload}
            style={{ padding: "8px 12px", background: uploading ? "#999" : "#0284c7", color: "white", border: "none", borderRadius: 6 }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
