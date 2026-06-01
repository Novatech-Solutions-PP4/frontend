import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function CardPedido({ pedido, to }) {
  const nombreCliente = pedido.cliente ?? pedido.clienteNombre;

  const inner = (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="space-between">
        <div>
          <strong>Pedido #{pedido.id}</strong>
          <div className="muted">Cliente: {nombreCliente}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {pedido.pagado !== undefined && (
            <span
              className={pedido.pagado ? "status-green" : "status-red"}
              style={{ fontSize: 11, padding: "4px 6px", borderRadius: 6 }}
            >
              {pedido.pagado ? "PAGADO" : "DEUDA"}
            </span>
          )}
          <StatusBadge status={pedido.status} />
        </div>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="card-link">
        {inner}
      </Link>
    );
  }

  return inner;
}
