// src/components/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({ isOpen, title, message, onConfirm, onCancel }: ModalProps) {
  if (!isOpen) return null;

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
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: 8,
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        {title && <h3 style={{ marginBottom: "1rem" }}>{title}</h3>}
        <p style={{ marginBottom: "1.5rem" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 14px",
              fontSize: 14,
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#f5f5f5",
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
                padding: "8px 14px",
                fontSize: 14,
                borderRadius: 4,
                border: "1px solid #ccc",
                background: "#4f46e5",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
