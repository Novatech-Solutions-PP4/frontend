/**
 * Tabla local de precios por tipo de lavado (por canasto).
 * Luego se reemplaza por datos del backend.
 */
export const IVA_RATE = 0.21;

export const WASH_TYPES = [
  { id: "standard", label: "Estándar", precio: 1150 },
  { id: "delicate", label: "Delicado", precio: 1650 },
  { id: "express", label: "Express", precio: 2100 },
];

export function washLabel(id) {
  return WASH_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function precioPorCanasto(tipoId) {
  const t = WASH_TYPES.find((x) => x.id === tipoId);
  return t ? Number(t.precio) : 0;
}

export function totalesDesdeCanastos(canastos) {
  const list = Array.isArray(canastos) ? canastos : [];
  const subtotal = list.reduce(
    (s, c) => s + precioPorCanasto(c.tipoLavado || "standard"),
    0,
  );
  const impuestos = Math.round(subtotal * IVA_RATE * 100) / 100;
  const total = Math.round((subtotal + impuestos) * 100) / 100;
  return { subtotal, impuestos, total };
}

export function textoResumenCanastos(canastos) {
  const list = Array.isArray(canastos) ? canastos : [];
  return list
    .map((c) => {
      const code = c.codigo?.trim() || "—";
      return `#${code} · ${washLabel(c.tipoLavado || "standard")}`;
    })
    .join("\n");
}
