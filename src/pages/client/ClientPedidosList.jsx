import React, { useMemo } from "react";
import CardPedido from "../../components/CardPedido";
import ScreenHeader from "../../components/ScreenHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function ClientPedidosList() {
  const { user } = useAuth();
  const { pedidosParaDniCliente } = useLaundryData();

  const lista = useMemo(
    () => pedidosParaDniCliente(user?.dni),
    [pedidosParaDniCliente, user?.dni],
  );

  const { activos, historial } = useMemo(() => {
    const a = [];
    const h = [];
    lista.forEach((p) => {
      if (p.status === "entregado") h.push(p);
      else a.push(p);
    });
    const sortDesc = (x, y) => Number(y.id) - Number(x.id);
    a.sort(sortDesc);
    h.sort(sortDesc);
    return { activos: a, historial: h };
  }, [lista]);

  return (
    <div>
      <ScreenHeader title="Pedidos" backTo="/client" />
      <div className="card" style={{ marginTop: 12 }}>
        <div className="muted" style={{ marginBottom: 10, fontWeight: 600 }}>
          Activos
        </div>
        {activos.length === 0 && (
          <p className="muted" style={{ marginBottom: 12 }}>
            No tenés pedidos activos.
          </p>
        )}
        {activos.map((p) => (
          <CardPedido
            key={p.id}
            to={`/client/pedidos/${p.id}`}
            pedido={{
              id: p.id,
              cliente: p.clienteNombre,
              status: p.status,
              pagado: p.pagado,
            }}
          />
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="muted" style={{ marginBottom: 10, fontWeight: 600 }}>
          Historial
        </div>
        {historial.length === 0 && (
          <p className="muted">Sin pedidos entregados.</p>
        )}
        {historial.map((p) => (
          <CardPedido
            key={p.id}
            to={`/client/pedidos/${p.id}`}
            pedido={{
              id: p.id,
              cliente: p.clienteNombre,
              status: p.status,
              pagado: p.pagado,
            }}
          />
        ))}
      </div>
    </div>
  );
}
