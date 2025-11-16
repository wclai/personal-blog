
// src/components/Modal.tsx
import React from "react";
import { buttonStyle } from "../styles/globalStyle";

interface ModalAction {
  label: string;
  onClick: () => void;
  style?: React.CSSProperties; // allow per-button styling
}

export function Modal({
  open,
  children,
  actions = [],
}: {
  open: boolean;
  children: React.ReactNode;
  actions?: ModalAction[];
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
        {children}

        {/* --- Action Buttons Row --- */}
        {actions.length > 0 && (
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            {actions.map((btn, i) => (
              <button
                key={i}
                style={{ ...buttonStyle, ...btn.style }}
                onClick={btn.onClick}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  onClose,
  onConfirm,
  labelClose = "Cancel",
  labelConfirm = "OK",
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  labelClose?: string;
  labelConfirm?: string;
}) {
  return (
    <Modal
      open={open}
      actions={[
        { label: labelClose, onClick: onClose },
        ...(onConfirm
          ? [{ label: labelConfirm, onClick: onConfirm, style: { color: "#f5f5f5", background: "#4f46e5" } }]
          : []),
      ]}
    >
      <h3>{title}</h3>
      <p style={{ marginTop: 10 }}>{message}</p>
    </Modal>
  );
}