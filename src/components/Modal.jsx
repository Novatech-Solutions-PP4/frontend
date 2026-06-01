import React from "react";

export default function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div className="space-between" style={{ marginBottom: 12 }}>
          <strong>{title}</strong>
          <button className="btn secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
