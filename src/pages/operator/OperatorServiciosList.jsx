import React from "react";
import { Link } from "react-router-dom";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function OperatorServiciosList() {
  const { servicios } = useLaundryData();

  return (
    <div>
      <ScreenHeader title="Servicios" backTo="/operator" />

      <div style={{ marginTop: 12 }}>
        {servicios.map((service) => (
          <div key={service.id} className="card service-card">
            <div className="service-card-head">
              <div>
                <strong>{service.nombre}</strong>
                <div className="muted" style={{ marginTop: 4 }}>
                  Precio {formatMoney(service.precio)}
                </div>
              </div>
              <Link
                to={`/operator/servicios/${service.id}`}
                className="service-edit-btn"
                aria-label={`Editar ${service.nombre}`}
                title="Editar servicio"
              >
                +
              </Link>
            </div>

            <div className="service-consumibles">
              <div>
                <span className="muted">Detergente</span>
                <strong>{service.consumibles.detergente} L</strong>
              </div>
              <div>
                <span className="muted">Suavizante</span>
                <strong>{service.consumibles.suavizante} L</strong>
              </div>
              <div>
                <span className="muted">Quitamanchas</span>
                <strong>{service.consumibles.quitamanchas} L</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <Link
          to="/operator/servicios/nuevo"
          className="btn btn--pill btn--wide"
        >
          Crear servicio
        </Link>
      </div>
    </div>
  );
}
