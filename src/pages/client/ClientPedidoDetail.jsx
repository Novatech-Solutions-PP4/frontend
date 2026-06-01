import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import ScreenHeader from "../../components/ScreenHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useLaundryData } from "../../contexts/LaundryDataContext";
import { normalizeDni } from "../../services/laundryDataService";

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

export default function ClientPedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPedido, getServicio, markPedidoPaid, getPedidoTotals } =
    useLaundryData();
  const pedido = getPedido(id);
  const servicio = useMemo(
    () => (pedido ? getServicio(pedido.servicioId) : null),
    [pedido, getServicio],
  );
  const userDni = normalizeDni(user?.dni);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const permitido = pedido && userDni && pedido.clienteDni === userDni;

  if (!pedido || !permitido) {
    return (
      <div>
        <ScreenHeader title="Pedido" backTo="/client/pedidos" />
        <div className="card" style={{ marginTop: 12 }}>
          <p>Pedido no disponible o no corresponde a tu cuenta.</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/client/pedidos")}
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const totals = getPedidoTotals(pedido);
  const listaCanastos =
    Array.isArray(pedido.canastos) && pedido.canastos.length > 0;

  const confirmPayment = () => {
    markPedidoPaid(pedido.id);
    setPaymentOpen(false);
  };

  return (
    <div>
      <ScreenHeader title={`Pedido #${pedido.id}`} backTo="/client/pedidos" />
      <div className="card" style={{ marginTop: 12 }}>
        <div className="space-between" style={{ marginBottom: 12 }}>
          <div>
            <div className="muted">{formatDate(pedido.creadoEn)}</div>
          </div>
          <StatusBadge status={pedido.status} />
        </div>

        <div style={{ marginTop: 8 }}>
          <span
            className={pedido.pagado ? "status-green" : "status-red"}
            style={{ display: "inline-block" }}
          >
            {pedido.pagado ? "PAGADO" : "PENDIENTE DE PAGO"}
          </span>
        </div>

        <h4 style={{ marginBottom: 6, marginTop: 16 }}>Servicio</h4>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          {servicio?.nombre ?? pedido.servicioNombre ?? "Sin servicio"}
          <br />
          <strong>{formatMoney(totals.subtotal)}</strong>
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

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            flexDirection: "column",
          }}
        >
          {!pedido.pagado && (
            <Button type="button" onClick={() => setPaymentOpen(true)}>
              Pagar
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/client/pedidos")}
          >
            Volver
          </Button>
        </div>
      </div>

      {paymentOpen && (
        <Modal
          title="Mercado Pago simulado"
          onClose={() => setPaymentOpen(false)}
        >
          <p style={{ marginTop: 0 }}>
            Estás simulando el checkout para{" "}
            {pedido.servicioNombre || servicio?.nombre || "el pedido"}.
          </p>
          <p className="muted">Monto a pagar: {formatMoney(pedido.total)}</p>
          <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
            <Button type="button" onClick={confirmPayment}>
              Confirmar pago
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPaymentOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </Modal>
      )}

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
