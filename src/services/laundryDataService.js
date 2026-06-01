export const STORAGE_KEY = "lav-tech-laundry-data-v4";

const STATUS_SEQUENCE = ["ingresado", "en_proceso", "listo", "entregado"];

const STATUS_LABELS = {
  ingresado: "Ingresado",
  en_proceso: "En proceso",
  listo: "Listo",
  entregado: "Entregado",
  pendiente: "Ingresado",
  processing: "En proceso",
  ready: "Listo",
};

const CONSUMABLE_KEY_MAP = {
  detergente: ["detergente", "i-det"],
  suavizante: ["suavizante", "i-sua"],
  quitamanchas: ["quitamanchas", "i-qm"],
};

function compact(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function normalizeDni(dni) {
  return String(dni || "").replace(/\D/g, "");
}

export function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "pending") return "ingresado";
  if (value === "processing") return "en_proceso";
  if (value === "ready") return "listo";
  if (value === "delivered") return "entregado";
  if (STATUS_SEQUENCE.includes(value)) return value;
  if (value === "en proceso") return "en_proceso";
  return value || "ingresado";
}

export function statusLabel(status) {
  return STATUS_LABELS[normalizeStatus(status)] ?? String(status || "");
}

function normalizeConsumibles(consumibles = {}) {
  return {
    detergente: Number(consumibles.detergente) || 0,
    suavizante: Number(consumibles.suavizante) || 0,
    quitamanchas: Number(consumibles.quitamanchas) || 0,
  };
}

export function normalizeServicio(servicio = {}) {
  return {
    id: servicio.id ?? `s-${Date.now()}`,
    nombre: servicio.nombre?.trim() || "Sin nombre",
    precio: Number(servicio.precio) || 0,
    consumibles: normalizeConsumibles(servicio.consumibles),
    baja: Boolean(servicio.baja),
  };
}

export function normalizeInsumo(insumo = {}) {
  return {
    id: insumo.id ?? `i-${Date.now()}`,
    nombre: insumo.nombre?.trim() || "Sin nombre",
    cantidad: Number(insumo.cantidad) || 0,
    cantidad_alerta: Number(insumo.cantidad_alerta ?? 10) || 10,
    costo_actual: Number(insumo.costo_actual) || 0,
    baja: Boolean(insumo.baja),
  };
}

export function normalizeUsuario(usuario = {}) {
  return {
    id: usuario.id ?? `u-${Date.now()}`,
    role: usuario.role === "operator" ? "operator" : "client",
    nombre: usuario.nombre?.trim() || "Sin nombre",
    apellido: usuario.apellido?.trim() || "",
    dni: normalizeDni(usuario.dni),
    email: usuario.email?.trim() || "",
    telefono: usuario.telefono?.trim() || "",
    password: String(usuario.password ?? "1234"),
    cuenta_activa: usuario.cuenta_activa !== false,
    baja: Boolean(usuario.baja),
  };
}

export function normalizeCliente(cliente = {}) {
  return {
    id: cliente.id ?? `c-${Date.now()}`,
    usuarioId: cliente.usuarioId ?? null,
    nombre: cliente.nombre?.trim() || "Sin nombre",
    dni: normalizeDni(cliente.dni),
    telefono: cliente.telefono?.trim() || "",
    email: cliente.email?.trim() || "",
    direccion: cliente.direccion?.trim() || "",
    nacimiento: cliente.nacimiento?.trim() || "",
    password: String(cliente.password ?? "1234"),
    baja: Boolean(cliente.baja),
  };
}

export function normalizeCanasto(canasto = {}) {
  return {
    uid: canasto.uid ?? `b-${Date.now()}`,
    codigo: String(canasto.codigo || "").trim(),
    estado: canasto.estado === "ocupado" ? "ocupado" : "libre",
    pedidoId: canasto.pedidoId ?? null,
  };
}

export function normalizePedido(pedido = {}) {
  const canastos = Array.isArray(pedido.canastos)
    ? pedido.canastos.map(normalizeCanasto)
    : [];
  return {
    id: pedido.id ?? Number(Date.now()),
    clienteId: pedido.clienteId ?? null,
    clienteNombre: pedido.clienteNombre?.trim() || "Sin cliente",
    clienteDni: normalizeDni(pedido.clienteDni),
    servicioId: pedido.servicioId ?? null,
    servicioNombre: pedido.servicioNombre?.trim() || "Sin servicio",
    status: normalizeStatus(pedido.status),
    canastos,
    subtotal: Number(pedido.subtotal) || 0,
    impuestos: Number(pedido.impuestos) || 0,
    total: Number(pedido.total) || 0,
    pagado: Boolean(pedido.pagado),
    consumoAplicado: Boolean(pedido.consumoAplicado),
    creadoEn: pedido.creadoEn || new Date().toISOString(),
    historial: Array.isArray(pedido.historial) ? pedido.historial : [],
    baja: Boolean(pedido.baja),
  };
}

function buildPedidoAmounts(servicio, canastos) {
  const count = Math.max(1, Array.isArray(canastos) ? canastos.length : 0);
  const subtotal = Math.round(((Number(servicio?.precio) || 0) * count) * 100) / 100;
  const impuestos = Math.round(subtotal * 0.21 * 100) / 100;
  const total = Math.round((subtotal + impuestos) * 100) / 100;
  return { subtotal, impuestos, total };
}

function initialUsers() {
  return [
    normalizeUsuario({
      id: "u-op-1",
      role: "operator",
      nombre: "Ramiro",
      apellido: "P.",
      dni: "0000",
      email: "operador@lavadero.local",
      telefono: "",
      password: "1234",
    }),
    normalizeUsuario({
      id: "u-cli-1",
      role: "client",
      nombre: "Ricardo",
      apellido: "Darín",
      dni: "1234",
      email: "ricardo.darin.set@gmail.com",
      telefono: "+54 9 11 6244-8871",
      password: "1234",
    }),
    normalizeUsuario({
      id: "u-cli-2",
      role: "client",
      nombre: "Cecilia",
      apellido: "Roth",
      dni: "5678",
      email: "cecilia.roth.contacto@yahoo.com.ar",
      telefono: "+54 9 11 5533-1029",
      password: "1234",
    }),
    normalizeUsuario({
      id: "u-cli-3",
      role: "client",
      nombre: "Guillermo",
      apellido: "Francella",
      dni: "8987",
      email: "gfrancella.agencia@gmail.com",
      telefono: "+54 9 11 7788-3340",
      password: "1234",
    }),
  ];
}

function initialClients() {
  return [
    normalizeCliente({
      id: "c-darin",
      usuarioId: "u-cli-1",
      nombre: "Ricardo Darín",
      dni: "1234",
      telefono: "+54 9 11 6244-8871",
      email: "ricardo.darin.set@gmail.com",
      direccion: "Av. Corrientes 1847, CABA",
      nacimiento: "16/01/1957",
      password: "1234",
    }),
    normalizeCliente({
      id: "c-roth",
      usuarioId: "u-cli-2",
      nombre: "Cecilia Roth",
      dni: "5678",
      telefono: "+54 9 11 5533-1029",
      email: "cecilia.roth.contacto@yahoo.com.ar",
      direccion: "Gurruchaga 1150, CABA",
      nacimiento: "08/08/1956",
      password: "1234",
    }),
    normalizeCliente({
      id: "c-francella",
      usuarioId: "u-cli-3",
      nombre: "Guillermo Francella",
      dni: "8987",
      telefono: "+54 9 11 7788-3340",
      email: "gfrancella.agencia@gmail.com",
      direccion: "Av. Santa Fe 4500, CABA",
      nacimiento: "14/05/1955",
      password: "1234",
    }),
  ];
}

function initialServicios() {
  return [
    normalizeServicio({
      id: "s-clasico",
      nombre: "Lavado Clasico",
      precio: 6500,
      consumibles: { detergente: 0.5, suavizante: 0.2, quitamanchas: 0.025 },
    }),
    normalizeServicio({
      id: "s-acolchado",
      nombre: "Lavado Acolchado",
      precio: 8200,
      consumibles: { detergente: 0.65, suavizante: 0.25, quitamanchas: 0.03 },
    }),
    normalizeServicio({
      id: "s-deluxe",
      nombre: "Lavado Deluxe",
      precio: 9800,
      consumibles: { detergente: 0.9, suavizante: 0.35, quitamanchas: 0.04 },
    }),
  ];
}

function initialInsumos() {
  return [
    normalizeInsumo({ id: "i-det", nombre: "Detergente", cantidad: 450, cantidad_alerta: 10 }),
    normalizeInsumo({ id: "i-sua", nombre: "Suavizante", cantidad: 98, cantidad_alerta: 10 }),
    normalizeInsumo({ id: "i-qm", nombre: "Quita manchas", cantidad: 14, cantidad_alerta: 10 }),
  ];
}

function initialCanastos() {
  return [
    normalizeCanasto({ uid: "b-245", codigo: "245", estado: "ocupado", pedidoId: 101 }),
    normalizeCanasto({ uid: "b-246", codigo: "246", estado: "ocupado", pedidoId: 101 }),
    normalizeCanasto({ uid: "b-301", codigo: "301", estado: "ocupado", pedidoId: 102 }),
    normalizeCanasto({ uid: "b-112", codigo: "112", estado: "ocupado", pedidoId: 103 }),
    normalizeCanasto({ uid: "b-113", codigo: "113", estado: "ocupado", pedidoId: 103 }),
  ];
}

function initialPedidos() {
  return [
    normalizePedido({
      id: 101,
      clienteId: "c-darin",
      clienteNombre: "Ricardo Darín",
      clienteDni: "1234",
      servicioId: "s-clasico",
      servicioNombre: "Lavado Clasico",
      status: "ingresado",
      canastos: [
        { uid: "a1", codigo: "245", estado: "ocupado", pedidoId: 101 },
        { uid: "a2", codigo: "246", estado: "ocupado", pedidoId: 101 },
      ],
      ...buildPedidoAmounts({ precio: 6500 }, [1, 2]),
      pagado: false,
      consumoAplicado: false,
      historial: [
        { status: "ingresado", fechaHora: "2025-02-14T14:25:00", usuarioId: "u-op-1" },
      ],
      creadoEn: "2025-02-14T14:25:00",
    }),
    normalizePedido({
      id: 102,
      clienteId: "c-roth",
      clienteNombre: "Cecilia Roth",
      clienteDni: "5678",
      servicioId: "s-acolchado",
      servicioNombre: "Lavado Acolchado",
      status: "en_proceso",
      canastos: [{ uid: "b1", codigo: "301", estado: "ocupado", pedidoId: 102 }],
      ...buildPedidoAmounts({ precio: 8200 }, [1]),
      pagado: false,
      consumoAplicado: true,
      historial: [
        { status: "ingresado", fechaHora: "2025-02-13T10:00:00", usuarioId: "u-op-1" },
        { status: "en_proceso", fechaHora: "2025-02-13T11:00:00", usuarioId: "u-op-1" },
      ],
      creadoEn: "2025-02-13T10:00:00",
    }),
    normalizePedido({
      id: 103,
      clienteId: "c-francella",
      clienteNombre: "Guillermo Francella",
      clienteDni: "8987",
      servicioId: "s-deluxe",
      servicioNombre: "Lavado Deluxe",
      status: "entregado",
      canastos: [
        { uid: "c1", codigo: "112", estado: "libre", pedidoId: null },
        { uid: "c2", codigo: "113", estado: "libre", pedidoId: null },
      ],
      ...buildPedidoAmounts({ precio: 9800 }, [1, 2]),
      pagado: true,
      consumoAplicado: true,
      historial: [
        { status: "ingresado", fechaHora: "2025-02-12T09:30:00", usuarioId: "u-op-1" },
        { status: "en_proceso", fechaHora: "2025-02-12T10:00:00", usuarioId: "u-op-1" },
        { status: "listo", fechaHora: "2025-02-12T18:15:00", usuarioId: "u-op-1" },
        { status: "entregado", fechaHora: "2025-02-13T09:20:00", usuarioId: "u-op-1" },
      ],
      creadoEn: "2025-02-12T09:30:00",
    }),
  ];
}

export function createSeedLaundryState() {
  return {
    usuarios: initialUsers(),
    clientes: initialClients(),
    pedidos: initialPedidos(),
    insumos: initialInsumos(),
    servicios: initialServicios(),
    canastos: initialCanastos(),
    reclamos: [],
    pagos: [],
    movimientosInsumos: [],
  };
}

export function hydrateLaundryState(stored) {
  const seed = createSeedLaundryState();
  if (!stored) return seed;
  return {
    usuarios: Array.isArray(stored.usuarios) ? stored.usuarios.map(normalizeUsuario) : seed.usuarios,
    clientes: Array.isArray(stored.clientes) ? stored.clientes.map(normalizeCliente) : seed.clientes,
    pedidos: Array.isArray(stored.pedidos) ? stored.pedidos.map(normalizePedido) : seed.pedidos,
    insumos: Array.isArray(stored.insumos) ? stored.insumos.map(normalizeInsumo) : seed.insumos,
    servicios: Array.isArray(stored.servicios) ? stored.servicios.map(normalizeServicio) : seed.servicios,
    canastos: Array.isArray(stored.canastos) ? stored.canastos.map(normalizeCanasto) : seed.canastos,
    reclamos: Array.isArray(stored.reclamos) ? stored.reclamos : seed.reclamos,
    pagos: Array.isArray(stored.pagos) ? stored.pagos : seed.pagos,
    movimientosInsumos: Array.isArray(stored.movimientosInsumos) ? stored.movimientosInsumos : seed.movimientosInsumos,
  };
}

export function persistLaundryState(state) {
  return JSON.stringify(state);
}

export function loadLaundryStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedLaundryState();
    return hydrateLaundryState(JSON.parse(raw));
  } catch {
    return createSeedLaundryState();
  }
}

export function getAuthUserByDniRole(state, dni, role) {
  const normalized = normalizeDni(dni);
  return (
    state.usuarios.find(
      (user) => normalizeDni(user.dni) === normalized && user.role === role && !user.baja,
    ) ?? null
  );
}

export function getClientByDni(state, dni) {
  const normalized = normalizeDni(dni);
  return state.clientes.find((cliente) => normalizeDni(cliente.dni) === normalized && !cliente.baja) ?? null;
}

export function getClientById(state, id) {
  return state.clientes.find((cliente) => String(cliente.id) === String(id) && !cliente.baja) ?? null;
}

export function getPedidoById(state, id) {
  return state.pedidos.find((pedido) => String(pedido.id) === String(id) && !pedido.baja) ?? null;
}

export function getServicioById(state, id) {
  return state.servicios.find((service) => String(service.id) === String(id) && !service.baja) ?? null;
}

export function nextPedidoStatus(status) {
  const current = normalizeStatus(status);
  const index = STATUS_SEQUENCE.indexOf(current);
  if (index < 0 || index >= STATUS_SEQUENCE.length - 1) return current;
  return STATUS_SEQUENCE[index + 1];
}

export function canMarkDelivered(pedido) {
  return normalizeStatus(pedido?.status) !== "entregado" && Boolean(pedido?.pagado);
}

export function getPedidoTotals(pedido, service) {
  const servicePrice = Number(service?.precio) || 0;
  const count = Math.max(1, Array.isArray(pedido?.canastos) ? pedido.canastos.length : 0);
  const subtotal = Math.round(servicePrice * count * 100) / 100;
  const impuestos = Math.round(subtotal * 0.21 * 100) / 100;
  const total = Math.round((subtotal + impuestos) * 100) / 100;
  return { subtotal, impuestos, total };
}

export function getPedidoConsumptionTotals(pedido, service) {
  const count = Math.max(1, Array.isArray(pedido?.canastos) ? pedido.canastos.length : 0);
  const consumibles = service?.consumibles ?? {};
  return {
    detergente: Math.round((Number(consumibles.detergente) || 0) * count * 1000) / 1000,
    suavizante: Math.round((Number(consumibles.suavizante) || 0) * count * 1000) / 1000,
    quitamanchas: Math.round((Number(consumibles.quitamanchas) || 0) * count * 1000) / 1000,
  };
}

export function applyPedidoConsumption(state, pedidoId) {
  const pedido = getPedidoById(state, pedidoId);
  if (!pedido || pedido.consumoAplicado) return state;
  const servicio = getServicioById(state, pedido.servicioId);
  if (!servicio) return state;
  const consumption = getPedidoConsumptionTotals(pedido, servicio);
  const nextInsumos = state.insumos.map((insumo) => {
    const key = compact(insumo.nombre);
    const matchedKey = Object.keys(CONSUMABLE_KEY_MAP).find((mapKey) =>
      CONSUMABLE_KEY_MAP[mapKey].some((candidate) => key.includes(compact(candidate))),
    );
    if (!matchedKey) return insumo;
    const decrement = Number(consumption[matchedKey]) || 0;
    return {
      ...insumo,
      cantidad: Math.max(0, Math.round((Number(insumo.cantidad) - decrement) * 1000) / 1000),
    };
  });
  return {
    ...state,
    insumos: nextInsumos,
    movimientosInsumos: [
      ...state.movimientosInsumos,
      {
        id: `mov-${Date.now()}`,
        pedidoId: pedido.id,
        servicioId: servicio.id,
        fechaHora: new Date().toISOString(),
        consumo: consumption,
      },
    ],
    pedidos: state.pedidos.map((row) =>
      String(row.id) === String(pedidoId)
        ? { ...row, consumoAplicado: true }
        : row,
    ),
  };
}

export function reserveCanastosForPedido(state, pedidoId, canastos = []) {
  const codes = new Set(canastos.map((c) => String(c.codigo || "").trim()).filter(Boolean));
  const nextCanastos = state.canastos.map((canasto) => {
    if (!codes.has(String(canasto.codigo))) return canasto;
    return { ...canasto, estado: "ocupado", pedidoId };
  });
  return {
    ...state,
    canastos: nextCanastos,
  };
}

export function releaseCanastosForPedido(state, pedidoId) {
  return {
    ...state,
    canastos: state.canastos.map((canasto) =>
      String(canasto.pedidoId) === String(pedidoId)
        ? { ...canasto, estado: "libre", pedidoId: null }
        : canasto,
    ),
  };
}

export function getLowStockAlert(state) {
  return state.insumos.some((insumo) => !insumo.baja && Number(insumo.cantidad) < 10);
}

export function updatePedidoFinancials(pedido, state) {
  const service = getServicioById(state, pedido.servicioId);
  const totals = getPedidoTotals(pedido, service);
  return {
    ...pedido,
    ...totals,
  };
}
