import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function OperatorClientesList() {
  const { clientes } = useLaundryData();
  const sorted = useMemo(
    () => [...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [clientes],
  );

  return (
    <div>
      <ScreenHeader title="Clientes" backTo="/operator" />
      <div className="card" style={{ marginTop: 12 }}>
      <div className="space-between" style={{ marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Clientes</h3>
          <div className="muted">Toca un cliente para ver detalle</div>
        </div>
        <Link to="/operator/clientes/nuevo" className="btn">
          Nuevo cliente
        </Link>
      </div>

      <div style={{ marginTop: 8 }}>
        {sorted.map((c) => (
          <Link
            key={c.id}
            to={`/operator/clientes/${c.id}`}
            className="card-link"
          >
            <div className="card" style={{ marginBottom: 10 }}>
              <strong>{c.nombre}</strong>
              <div className="muted">DNI {c.dni}</div>
              {c.telefono && (
                <div className="muted" style={{ fontSize: 13 }}>
                  {c.telefono}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
