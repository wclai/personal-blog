// src/components/ChangePasswordForm.tsx

"use client";
import { useState } from "react";
import { popupShadow, popupForm, popupClose, popupSection, inputStyle, confirmButtonStyle, errorMessage } from "../styles/globalStyle";

export default function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setMessage(null);
    setError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password.");
      } else {
        setMessage(data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        style={confirmButtonStyle}
        onClick={toggleModal}
      >
        Change Password
      </button>

      {isOpen && (
        <div style={popupShadow}>
          <div
            style={{
              ... popupForm,
              minWidth: 320,
              maxWidth: 400,
            }}
          >
            <button
              style={popupClose}
              onClick={toggleModal}
            >
              ×
            </button>

            <h2 style={{ marginBottom: "1rem" }}>Change Password</h2>

            <form onSubmit={handleSubmit} 
              style={popupSection}>
              <input
                style={inputStyle}
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                style={inputStyle}
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                style={inputStyle}
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && <p style={errorMessage}>{error}</p>}
              {message && <p>{message}</p>}

              <button
                style={confirmButtonStyle}
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
