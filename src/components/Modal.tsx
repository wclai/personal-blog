
// src/components/Modal.tsx
import React from "react";
import { popupShadow, popupForm, buttonStyle, buttonRow } from "../styles/globalStyle";

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
      style={popupShadow}
    >
      <div
        style={popupForm}
      >
        {children}

        {/* --- Action Buttons Row --- */}
        {actions.length > 0 && (
          <div
            style={{
              ... buttonRow,
              justifyContent: "flex-end",
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