import React from "react";
import Button from "../../components/Button";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function OperatorInsumos() {
  const { insumos, hasLowStockAlert } = useLaundryData();

  return (
    <div>
      <ScreenHeader title="Insumos" backTo="/operator" />
      {hasLowStockAlert && (
        <p
          className="muted"
          style={{ color: "#c21", fontWeight: 600, marginTop: 8 }}
        >
          Hay al menos un insumo por debajo de 10 litros.
        </p>
      )}
      <div style={{ marginTop: 12 }}>
        {insumos.map((i) => (
          <div
            key={i.id}
            className={`insumo-card${Number(i.cantidad) < 10 ? " insumo-card--alert" : ""}`}
          >
            <div className="muted" style={{ fontSize: 14 }}>
              {i.nombre}
            </div>
            <div className="insumo-litros">
              {Number(i.cantidad).toFixed(1)} lts.
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Button
          type="button"
          onClick={() => alert("Próximamente: agregar insumos.")}
        >
          Agregar insumos
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => alert("Próximamente: historial de movimientos.")}
        >
          Historial insumos
        </Button>
      </div>
    </div>
  );
}
