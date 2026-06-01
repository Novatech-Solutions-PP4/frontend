import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyPedidoConsumption,
  canMarkDelivered,
  getAuthUserByDniRole,
  getClientByDni,
  getClientById,
  getLowStockAlert,
  getPedidoById,
  getPedidoConsumptionTotals,
  getPedidoTotals,
  getServicioById,
  loadLaundryStateFromStorage,
  normalizeCliente,
  normalizeDni,
  normalizeInsumo,
  normalizePedido,
  normalizeServicio,
  normalizeUsuario,
  nextPedidoStatus,
  persistLaundryState,
  releaseCanastosForPedido,
  reserveCanastosForPedido,
  statusLabel,
  updatePedidoFinancials,
} from "../services/laundryDataService";

const LaundryDataContext = createContext(null);

function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { nombre: "Sin nombre", apellido: "" };
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };
  return { nombre: parts.slice(0, -1).join(" "), apellido: parts.slice(-1)[0] };
}

function nowIso() {
  return new Date().toISOString();
}

export function LaundryDataProvider({ children }) {
  const [data, setData] = useState(() => loadLaundryStateFromStorage());

  useEffect(() => {
    localStorage.setItem("lav-tech-laundry-data-v4", persistLaundryState(data));
  }, [data]);

  const hasLowStockAlert = useMemo(() => getLowStockAlert(data), [data]);

  const refreshProfile = useCallback((dni) => {
    const normalizedDni = normalizeDni(dni);
    setData((prev) => {
      const cliente = getClientByDni(prev, normalizedDni);
      if (!cliente) return prev;
      return {
        ...prev,
        usuarios: prev.usuarios.map((usuario) =>
          normalizeDni(usuario.dni) === normalizedDni &&
          usuario.role === "client"
            ? {
                ...usuario,
                nombre: cliente.nombre,
                email: cliente.email,
                telefono: cliente.telefono,
              }
            : usuario,
        ),
      };
    });
  }, []);

  const addCliente = useCallback((payload) => {
    const id = `c-${Date.now()}`;
    const usuarioId = `u-${Date.now()}`;
    const nombreCompleto = payload.nombre?.trim() || "Sin nombre";
    const { nombre, apellido } = splitFullName(nombreCompleto);
    const user = normalizeUsuario({
      id: usuarioId,
      role: "client",
      nombre: nombreCompleto,
      apellido,
      dni: payload.dni,
      email: payload.email,
      telefono: payload.telefono,
      password: payload.password,
    });
    const cliente = normalizeCliente({
      id,
      usuarioId,
      nombre: nombreCompleto,
      dni: payload.dni,
      telefono: payload.telefono,
      email: payload.email,
      direccion: payload.direccion,
      nacimiento: payload.nacimiento,
      password: payload.password,
    });
    setData((prev) => ({
      ...prev,
      usuarios: [...prev.usuarios, user],
      clientes: [...prev.clientes, cliente],
    }));
    return id;
  }, []);

  const updateCliente = useCallback((id, patch) => {
    setData((prev) => {
      const clienteActual = prev.clientes.find((cliente) => cliente.id === id);
      if (!clienteActual) return prev;
      const nextCliente = normalizeCliente({ ...clienteActual, ...patch });
      return {
        ...prev,
        clientes: prev.clientes.map((cliente) =>
          cliente.id === id ? nextCliente : cliente,
        ),
        usuarios: prev.usuarios.map((usuario) =>
          usuario.id === nextCliente.usuarioId
            ? {
                ...usuario,
                nombre: nextCliente.nombre,
                email: nextCliente.email,
                telefono: nextCliente.telefono,
              }
            : usuario,
        ),
      };
    });
  }, []);

  const addServicio = useCallback((payload) => {
    const id = `s-${Date.now()}`;
    const row = normalizeServicio({
      id,
      nombre: payload.nombre,
      precio: payload.precio,
      consumibles: payload.consumibles,
    });
    setData((prev) => ({ ...prev, servicios: [...prev.servicios, row] }));
    return id;
  }, []);

  const updateServicio = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      servicios: prev.servicios.map((servicio) =>
        servicio.id === id
          ? normalizeServicio({ ...servicio, ...patch })
          : servicio,
      ),
    }));
  }, []);

  const addPedido = useCallback((payload) => {
    let newId = null;
    setData((prev) => {
      const cliente = getClientById(prev, payload.clienteId);
      const servicio = getServicioById(prev, payload.servicioId);
      if (!cliente || !servicio) return prev;
      const id =
        1 +
        prev.pedidos.reduce(
          (maxId, pedido) =>
            Number(pedido.id) > maxId ? Number(pedido.id) : maxId,
          0,
        );
      newId = id;
      const canastos = Array.isArray(payload.canastos)
        ? payload.canastos.map((canasto, index) => ({
            uid: canasto.uid || `n-${id}-${index}`,
            codigo: String(canasto.codigo || "").trim() || "—",
            estado: "ocupado",
            pedidoId: id,
            servicioId: servicio.id,
          }))
        : [];
      const totals = getPedidoTotals({ canastos }, servicio);
      const row = normalizePedido({
        id,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        clienteDni: cliente.dni,
        servicioId: servicio.id,
        servicioNombre: servicio.nombre,
        status: payload.status || "ingresado",
        canastos,
        subtotal: totals.subtotal,
        impuestos: totals.impuestos,
        total: totals.total,
        pagado: Boolean(payload.pagado),
        consumoAplicado: false,
        creadoEn: nowIso(),
        historial: [
          {
            status: payload.status || "ingresado",
            fechaHora: nowIso(),
            usuarioId: payload.usuarioId ?? null,
          },
        ],
        pagos: [],
        entregadoEn: null,
      });
      const nextState = reserveCanastosForPedido(
        {
          ...prev,
          pedidos: [...prev.pedidos, row],
        },
        id,
        canastos,
      );
      return nextState;
    });
    return newId;
  }, []);

  const updatePedido = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      pedidos: prev.pedidos.map((pedido) => {
        if (String(pedido.id) !== String(id)) return pedido;
        const merged = normalizePedido({ ...pedido, ...patch });
        const service = getServicioById(prev, merged.servicioId);
        if (service) {
          return { ...merged, ...getPedidoTotals(merged, service) };
        }
        return merged;
      }),
    }));
  }, []);

  const markPedidoPaid = useCallback(
    (id, metodoPago = "mercado_pago_simulado") => {
      const pagoId = `pago-${Date.now()}`;
      setData((prev) => {
        const pedido = getPedidoById(prev, id);
        if (!pedido) return prev;
        const updatedPedido = {
          ...pedido,
          pagado: true,
          pagos: [
            ...(pedido.pagos || []),
            {
              id: pagoId,
              id_pedido: pedido.id,
              id_metodo_pago: metodoPago,
              estado: "pagado",
              monto: pedido.total,
              fecha_pago: nowIso(),
            },
          ],
        };
        return {
          ...prev,
          pedidos: prev.pedidos.map((row) =>
            String(row.id) === String(id) ? updatedPedido : row,
          ),
          pagos: [
            ...prev.pagos,
            {
              id: pagoId,
              id_pedido: pedido.id,
              metodo: metodoPago,
              estado: "pagado",
              monto: pedido.total,
              fecha_pago: nowIso(),
            },
          ],
        };
      });
      return { ok: true };
    },
    [],
  );

  const advancePedidoStatus = useCallback(
    (id, usuarioId = null) => {
      const current = getPedidoById(data, id);
      if (!current) {
        return { ok: false, message: "Pedido no encontrado." };
      }
      const nextStatus = nextPedidoStatus(current.status);
      if (nextStatus === current.status) {
        return { ok: false, message: "El pedido ya está en el último estado." };
      }
      if (nextStatus === "entregado" && !canMarkDelivered(current)) {
        return {
          ok: false,
          message: "Solo se puede marcar entregado si el pedido está pagado.",
        };
      }

      setData((prev) => {
        let working = prev;
        if (nextStatus === "en_proceso") {
          working = applyPedidoConsumption(working, id);
        }
        if (nextStatus === "entregado") {
          working = releaseCanastosForPedido(working, id);
        }
        const timestamp = nowIso();
        return {
          ...working,
          pedidos: working.pedidos.map((pedido) => {
            if (String(pedido.id) !== String(id)) return pedido;
            const historial = [
              ...(pedido.historial || []),
              { status: nextStatus, fechaHora: timestamp, usuarioId },
            ];
            return {
              ...normalizePedido({ ...pedido, status: nextStatus }),
              status: nextStatus,
              consumoAplicado:
                pedido.consumoAplicado || nextStatus === "en_proceso",
              entregadoEn:
                nextStatus === "entregado" ? timestamp : pedido.entregadoEn,
              historial,
            };
          }),
        };
      });

      return { ok: true, nextStatus };
    },
    [data],
  );

  const value = useMemo(
    () => ({
      usuarios: data.usuarios,
      clientes: data.clientes,
      pedidos: data.pedidos,
      insumos: data.insumos,
      servicios: data.servicios,
      canastos: data.canastos,
      reclamos: data.reclamos,
      pagos: data.pagos,
      movimientosInsumos: data.movimientosInsumos,
      hasLowStockAlert,
      refreshProfile,
      addCliente,
      updateCliente,
      addServicio,
      updateServicio,
      addPedido,
      updatePedido,
      markPedidoPaid,
      advancePedidoStatus,
      getAuthUserByDniRole: (dni, role) =>
        getAuthUserByDniRole(data, dni, role),
      getClientByDni: (dni) => getClientByDni(data, dni),
      getClient: (id) => getClientById(data, id),
      getPedido: (id) => getPedidoById(data, id),
      getServicio: (id) => getServicioById(data, id),
      getPedidoTotals: (pedido) => {
        const service = getServicioById(data, pedido?.servicioId);
        return getPedidoTotals(pedido, service);
      },
      getPedidoConsumptionTotals: (pedido) => {
        const service = getServicioById(data, pedido?.servicioId);
        return getPedidoConsumptionTotals(pedido, service);
      },
      pedidosPorCliente: (clienteId) =>
        data.pedidos.filter(
          (pedido) => pedido.clienteId === clienteId && !pedido.baja,
        ),
      pedidosParaDniCliente: (dni) => {
        const normalizedDni = normalizeDni(dni);
        return data.pedidos.filter(
          (pedido) => pedido.clienteDni === normalizedDni && !pedido.baja,
        );
      },
      statusLabel,
    }),
    [
      data,
      hasLowStockAlert,
      refreshProfile,
      addCliente,
      updateCliente,
      addServicio,
      updateServicio,
      addPedido,
      updatePedido,
      markPedidoPaid,
      advancePedidoStatus,
    ],
  );

  return (
    <LaundryDataContext.Provider value={value}>
      {children}
    </LaundryDataContext.Provider>
  );
}

export function useLaundryData() {
  const ctx = useContext(LaundryDataContext);
  if (!ctx)
    throw new Error("useLaundryData debe usarse dentro de LaundryDataProvider");
  return ctx;
}
