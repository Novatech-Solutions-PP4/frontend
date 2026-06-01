import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

let uidSeq = 0;
function nextUid() {
  uidSeq += 1;
  return `can-${Date.now()}-${uidSeq}`;
}

export default function OperatorPedidoNuevo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preClienteId = searchParams.get("clienteId") || "";

  const { clientes, servicios, addPedido } = useLaundryData();
  const [clienteId, setClienteId] = useState(preClienteId);
  const [servicioId, setServicioId] = useState("");
  const [canastos, setCanastos] = useState(() => [
    { uid: nextUid(), codigo: "" },
  ]);

  useEffect(() => {
    if (!servicios.length) return;
    setServicioId((current) => current || servicios[0].id);
  }, [servicios]);

  useEffect(() => {
    const q = searchParams.get("clienteId");
    if (q) setClienteId(q);
  }, [searchParams]);

  const options = useMemo(
    () =>
      clientes.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nombre} — DNI {c.dni}
        </option>
      )),
    [clientes],
  );

  const selectedService = useMemo(
    () =>
      servicios.find((service) => service.id === servicioId) ??
      servicios[0] ??
      null,
    [servicios, servicioId],
  );

  const totales = useMemo(() => {
    const price = Number(selectedService?.precio) || 0;
    const subtotal = Math.round(price * canastos.length * 100) / 100;
    const impuestos = Math.round(subtotal * 0.21 * 100) / 100;
    const total = Math.round((subtotal + impuestos) * 100) / 100;
    return { subtotal, impuestos, total };
  }, [canastos.length, selectedService]);

  const scanCliente = () => {
    alert("Lectura de QR del cliente: próximamente con la cámara.");
  };

  const scanCanasto = (uid) => {
    alert(`Lectura de QR del canasto (${uid}): próximamente con la cámara.`);
  };

  const updateCanasto = (uid, patch) => {
    setCanastos((prev) =>
      prev.map((c) => (c.uid === uid ? { ...c, ...patch } : c)),
    );
  };

  const addCanasto = () => {
    setCanastos((prev) => [...prev, { uid: nextUid(), codigo: "" }]);
  };

  const removeCanasto = (uid) => {
    setCanastos((prev) =>
      prev.length <= 1 ? prev : prev.filter((c) => c.uid !== uid),
    );
  };

  const submit = (e) => {
    e.preventDefault();
    if (!clienteId) return;
    const id = addPedido({
      clienteId,
      servicioId,
      canastos,
      pagado: false,
      status: "ingresado",
    });
    if (id != null) navigate(`/operator/pedidos/${id}`, { replace: true });
  };

  return (
    <div>
      <ScreenHeader title="Nuevo pedido" backTo="/operator/pedidos" />

      <form className="card" style={{ marginTop: 12 }} onSubmit={submit}>
        <label className="field-label">Cliente</label>
        <div className="row-input-qr">
          <select
            className="input input--flex"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">Seleccionar…</option>
            {options}
          </select>
          <button
            type="button"
            className="btn btn--qr"
            onClick={scanCliente}
            title="Escanear QR"
          >
            QR
          </button>
        </div>

        <label className="field-label">Servicio</label>
        <select
          className="input"
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          required
        >
          <option value="">Seleccionar…</option>
          {servicios.map((service) => (
            <option key={service.id} value={service.id}>
              {service.nombre} — ${Number(service.precio).toFixed(0)}
            </option>
          ))}
        </select>

        <div className="canastos-head">
          <span className="field-label" style={{ margin: 0 }}>
            Canastos
          </span>
          <button type="button" className="btn-mini" onClick={addCanasto}>
            Agregar
          </button>
        </div>

        {canastos.map((c, idx) => (
          <div key={c.uid} className="card canasto-card">
            <div className="row-input-qr">
              <span className="canasto-idx">{idx + 1}</span>
              <input
                className="input input--flex"
                placeholder="# código"
                value={c.codigo}
                onChange={(e) =>
                  updateCanasto(c.uid, { codigo: e.target.value })
                }
              />
              <button
                type="button"
                className="btn btn--qr"
                onClick={() => scanCanasto(c.uid)}
                title="Escanear QR"
              >
                QR
              </button>
            </div>
            {canastos.length > 1 && (
              <button
                type="button"
                className="btn-text"
                onClick={() => removeCanasto(c.uid)}
              >
                Quitar canasto
              </button>
            )}
          </div>
        ))}

        <div className="totales-box">
          <div className="muted">Subtotal</div>
          <strong>{totales.subtotal.toFixed(2)} ARS</strong>
          <div className="muted" style={{ marginTop: 8 }}>
            Impuestos (21% IVA)
          </div>
          <strong>{totales.impuestos.toFixed(2)} ARS</strong>
          <div className="muted" style={{ marginTop: 8 }}>
            Total estimado
          </div>
          <strong className="total-strong">
            {totales.total.toFixed(2)} ARS
          </strong>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Button type="submit">Crear pedido</Button>
          <Link
            to="/operator/pedidos"
            className="btn secondary"
            style={{ textAlign: "center" }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
