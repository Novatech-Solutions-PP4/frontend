import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

function formatMoney(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function OperatorPedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getPedido,
    getServicio,
    markPedidoPaid,
    advancePedidoStatus,
    getPedidoTotals,
  } = useLaundryData();
  const pedido = getPedido(id);
  const servicio = useMemo(
    () => (pedido ? getServicio(pedido.servicioId) : null),
    [pedido, getServicio],
  );
  const [message, setMessage] = useState("");
  const [qrOpen, setQrOpen] = useState(false);

  if (!pedido) {
    return (
      <div>
        <ScreenHeader title="Pedido" backTo="/operator/pedidos" />
        <div className="card" style={{ marginTop: 12 }}>
          <p>Pedido no encontrado.</p>
          <Link to="/operator/pedidos" className="btn">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  const totals = getPedidoTotals(pedido);
  const listaCanastos =
    Array.isArray(pedido.canastos) && pedido.canastos.length > 0;
  const siguienteEstado =
    pedido.status === "ingresado"
      ? "En proceso"
      : pedido.status === "en_proceso"
        ? "Listo"
        : pedido.status === "listo"
          ? "Entregado"
          : "Entregado";

  const handleAdvance = () => {
    const result = advancePedidoStatus(pedido.id, "u-op-1");
    if (!result.ok) {
      setMessage(result.message || "No se pudo avanzar el estado.");
      return;
    }
    setMessage("");
  };

  const handlePay = () => {
    markPedidoPaid(pedido.id);
    setMessage("Pago simulado confirmado.");
  };

  return (
    <div>
      <ScreenHeader title={`Pedido #${pedido.id}`} backTo="/operator/pedidos" />
      <div className="card" style={{ marginTop: 12 }}>
        <div className="space-between" style={{ marginBottom: 12 }}>
          <div>
            <div className="muted">{formatDate(pedido.creadoEn)}</div>
          </div>
          <StatusBadge status={pedido.status} />
        </div>

        <p style={{ margin: "8px 0" }}>
          <Link
            to={`/operator/clientes/${pedido.clienteId}`}
            className="link-inline"
          >
            Cliente: {pedido.clienteNombre}
          </Link>
          <span className="muted"> · DNI {pedido.clienteDni}</span>
        </p>

        <h4 style={{ marginBottom: 6, marginTop: 16 }}>Servicio</h4>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          {servicio?.nombre ?? pedido.servicioNombre ?? "Sin servicio"}
          <br />
          <strong>{formatMoney(totals.subtotal)}</strong>
        </div>

        <div style={{ marginTop: 8 }}>
          <span
            className={pedido.pagado ? "status-green" : "status-yellow"}
            style={{ display: "inline-block" }}
          >
            {pedido.pagado ? "PAGADO" : "DEUDA"}
          </span>
        </div>

        <h4 style={{ marginBottom: 6, marginTop: 16 }}>Canastos</h4>
        {listaCanastos ? (
          <>
            <ul className="canasto-list">
              {pedido.canastos.map((c) => (
                <li key={c.uid || c.codigo}>
                  <strong>#{c.codigo || "—"}</strong>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setQrOpen(true)}
            >
              Ver canastos
            </Button>
          </>
        ) : (
          <p className="muted">No hay canastos asociados.</p>
        )}

        <h4 style={{ marginBottom: 6, marginTop: 16 }}>Precio</h4>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          Costo .................... {formatMoney(pedido.subtotal)}
          <br />
          Impuestos ......... {formatMoney(pedido.impuestos)}
          <br />
          <strong>TOTAL: {formatMoney(pedido.total)}</strong>
        </div>

        {message && (
          <p
            style={{
              color: message.includes("No") ? "#c21" : "#0a8a3b",
              marginTop: 14,
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handlePay}
            disabled={pedido.pagado}
          >
            {pedido.pagado ? "Ya pagado" : "Marcar pagado"}
          </Button>
          {pedido.status !== "entregado" ? (
            <Button type="button" onClick={handleAdvance}>
              {siguienteEstado}
            </Button>
          ) : (
            <Button type="button" disabled>
              Entregado
            </Button>
          )}
        </div>
      </div>

      {qrOpen && (
        <Modal title="Canastos del pedido" onClose={() => setQrOpen(false)}>
          <p style={{ marginTop: 0 }}>Número de canasto asociado al pedido.</p>
          <ul className="canasto-list" style={{ marginBottom: 0 }}>
            {pedido.canastos.map((c) => (
              <li key={c.uid || c.codigo}>
                Canasto <strong>#{c.codigo || "—"}</strong>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
