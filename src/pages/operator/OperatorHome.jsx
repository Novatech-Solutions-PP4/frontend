import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function OperatorHome() {
  const { user } = useAuth();
  const { pedidos } = useLaundryData();

  const counts = useMemo(() => {
    return pedidos.reduce(
      (acc, p) => {
        if (p.status === "ingresado") acc.ingresado += 1;
        else if (p.status === "en_proceso") acc.enProceso += 1;
        else if (p.status === "listo") acc.listo += 1;
        else if (p.status === "entregado") acc.entregado += 1;
        return acc;
      },
      { ingresado: 0, enProceso: 0, listo: 0, entregado: 0 },
    );
  }, [pedidos]);

  const hoy = useMemo(() => {
    return new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  return (
    <div>
      <p className="muted app-kicker">Dashboard empleado</p>
      <div className="card card--greet">
        <h2 className="greet-title">Hola {user?.name ?? "equipo"}</h2>
        <div className="greet-line" />
      </div>

      <div style={{ textAlign: "center", margin: "18px 0" }}>
        <Link to="/operator/pedidos/nuevo" className="btn btn--pill btn--wide">
          Crear pedido
        </Link>
      </div>

      <div className="date-pill">{hoy.replace(/\//g, " / ")}</div>

      <div className="dash-cards">
        <div className="card dash-stat">
          <div className="muted">Ingresados</div>
          <div className="dash-stat-num">{counts.ingresado}</div>
        </div>
        <div className="card dash-stat">
          <div className="muted">En proceso</div>
          <div className="dash-stat-num">{counts.enProceso}</div>
        </div>
        <div className="card dash-stat">
          <div className="muted">Listos</div>
          <div className="dash-stat-num">{counts.listo}</div>
        </div>
        <div className="card dash-stat">
          <div className="muted">Entregados</div>
          <div className="dash-stat-num">{counts.entregado}</div>
        </div>
      </div>

      <p
        className="muted"
        style={{ marginTop: 16, textAlign: "center", fontSize: 13 }}
      >
        Historial y listado completo en{" "}
        <Link to="/operator/pedidos" className="link-inline">
          Pedidos
        </Link>
        .
      </p>
    </div>
  );
}
