import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function ClientHome() {
  const { user } = useAuth();
  const { pedidosParaDniCliente } = useLaundryData();

  const lista = useMemo(
    () => pedidosParaDniCliente(user?.dni),
    [pedidosParaDniCliente, user?.dni],
  );

  const counts = useMemo(() => {
    return lista.reduce(
      (acc, p) => {
        if (p.status === "ingresado") acc.ingresado += 1;
        else if (p.status === "en_proceso") acc.enProceso += 1;
        else if (p.status === "listo") acc.listo += 1;
        return acc;
      },
      { ingresado: 0, enProceso: 0, listo: 0 },
    );
  }, [lista]);

  const hoy = useMemo(() => {
    return new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  return (
    <div>
      <p className="muted app-kicker">Dashboard cliente</p>
      <div className="card card--greet">
        <h2 className="greet-title">Hola {user?.name ?? "cliente"}</h2>
        <div className="greet-line" />
      </div>

      <div className="date-pill" style={{ marginTop: 14 }}>
        {hoy.replace(/\//g, " / ")}
      </div>

      <div className="dash-cards" style={{ marginTop: 16 }}>
        <div className="card dash-stat">
          <div className="muted">Ingresado</div>
          <div className="dash-stat-num">{counts.ingresado}</div>
        </div>
        <div className="card dash-stat">
          <div className="muted">En proceso</div>
          <div className="dash-stat-num">{counts.enProceso}</div>
        </div>
        <div className="card dash-stat">
          <div className="muted">Listo</div>
          <div className="dash-stat-num">{counts.listo}</div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link to="/client/pedidos" className="btn btn--pill btn--wide">
          Ver pedidos
        </Link>
      </div>

      {lista.length === 0 && (
        <p
          className="muted"
          style={{ marginTop: 16, textAlign: "center", fontSize: 13 }}
        >
          No hay datos para tu DNI. Usá un cliente demo: <strong>1234</strong>,{" "}
          <strong>5678</strong> o <strong>8987</strong> (clave{" "}
          <strong>1234</strong>
          ).
        </p>
      )}
    </div>
  );
}
