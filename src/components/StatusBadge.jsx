import React from "react";

export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "ingresado" || normalized === "pending") {
    return <span className="status-red">Ingresado</span>;
  }
  if (
    normalized === "en_proceso" ||
    normalized === "processing" ||
    normalized === "en proceso"
  ) {
    return <span className="status-yellow">En proceso</span>;
  }
  if (normalized === "listo" || normalized === "ready") {
    return <span className="status-green">Listo</span>;
  }
  if (normalized === "entregado") {
    return <span className="status-green">Entregado</span>;
  }
  return <span className="muted">{status}</span>;
}
