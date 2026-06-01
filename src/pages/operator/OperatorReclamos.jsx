import React from "react";
import ScreenHeader from "../../components/ScreenHeader";

export default function OperatorReclamos() {
  return (
    <div>
      <ScreenHeader title="Reclamos" backTo="/operator" />
      <div className="card" style={{ marginTop: 12 }}>
        <p style={{ marginTop: 0 }}>
          Bandeja de reclamos de clientes. Aquí se podrán ver, responder y
          cerrar reclamos.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Por ahora esta sección queda como base para conectar el flujo
          completo.
        </p>
      </div>
    </div>
  );
}
