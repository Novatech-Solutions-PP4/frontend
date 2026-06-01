import React from "react";
import ScreenHeader from "../../components/ScreenHeader";

export default function OperatorFinanzas() {
  return (
    <div>
      <ScreenHeader title="Finanzas" backTo="/operator" />
      <div className="card" style={{ marginTop: 16 }}>
        <p className="muted" style={{ margin: 0 }}>
          Resumen de caja y cobranzas. Esta sección se conectará al backend más
          adelante.
        </p>
      </div>
    </div>
  );
}
