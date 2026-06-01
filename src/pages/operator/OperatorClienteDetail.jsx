import React from "react";
import { Link, useParams } from "react-router-dom";
import CardPedido from "../../components/CardPedido";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function OperatorClienteDetail() {
  const { id } = useParams();
  const { getCliente, pedidosPorCliente } = useLaundryData();
  const cliente = getCliente(id);
  const pedidos = cliente ? pedidosPorCliente(cliente.id) : [];

  if (!cliente) {
    return (
      <div>
        <ScreenHeader title="Cliente" backTo="/operator/clientes" />
        <div className="card" style={{ marginTop: 12 }}>
          <p>Cliente no encontrado.</p>
          <Link to="/operator/clientes" className="btn">
            Volver a clientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title={cliente.nombre} backTo="/operator/clientes" />
      <div className="card" style={{ marginTop: 12 }}>
        <div className="muted" style={{ lineHeight: 1.6 }}>
          <div>DNI {cliente.dni}</div>
          {cliente.direccion && <div>{cliente.direccion}</div>}
          {cliente.telefono && <div>{cliente.telefono}</div>}
          {cliente.email && <div>{cliente.email}</div>}
          {cliente.nacimiento && <div>Nac.: {cliente.nacimiento}</div>}
        </div>

        <div style={{ marginTop: 16 }}>
          <Link
            to={`/operator/pedidos/nuevo?clienteId=${encodeURIComponent(cliente.id)}`}
            className="btn"
          >
            Crear pedido
          </Link>
        </div>

        <h4 style={{ marginTop: 20, marginBottom: 8 }}>Pedidos</h4>
        {pedidos.length === 0 && (
          <p className="muted">No hay pedidos para este cliente.</p>
        )}
        {[...pedidos]
          .sort((a, b) => Number(b.id) - Number(a.id))
          .map((p) => (
            <CardPedido
              key={p.id}
              to={`/operator/pedidos/${p.id}`}
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
