export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const token = localStorage.getItem('lavapro_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'Error en la petición';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
    }
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

// --- Timezone and Date Helpers ---

const parseUTCDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.lastIndexOf('-') > 10)) {
    return new Date(dateStr);
  }
  let formattedStr = dateStr.replace(' ', 'T');
  if (!formattedStr.endsWith('Z')) {
    formattedStr += 'Z';
  }
  return new Date(formattedStr);
};

const formatDateToLocal = (dateStr) => {
  const d = parseUTCDate(dateStr);
  if (!d || isNaN(d.getTime())) return dateStr || '';
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTimeToLocal = (dateStr, separator = ' •') => {
  const d = parseUTCDate(dateStr);
  if (!d || isNaN(d.getTime())) return dateStr || '';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', separator);
};

// --- Mappings ---

const roleToId = (roleName) => {
  const norm = (roleName || '').toLowerCase();
  if (norm === 'administrador' || norm === 'admin') return 1;
  if (norm === 'operador') return 2;
  return 3;
};

const mapUserToFrontend = (user) => {
  if (!user) return null;
  let roleStr = 'cliente';
  if (user.rol) {
    if (typeof user.rol === 'object') {
      roleStr = user.rol.nombre.toLowerCase();
    } else {
      roleStr = user.rol.toLowerCase();
    }
  }
  return {
    id: user.id,
    nombre: `${user.nombre} ${user.apellido || ''}`.trim(),
    DNI: user.dni || '',
    email: user.email,
    telefono: user.telefono || '',
    rol: roleStr,
    codigo_qr: user.codigo_qr
  };
};

const mapPedidoToFrontend = (order) => {
  if (!order) return null;
  
  let dateFormatted = '';
  if (order.fecha_recepcion) {
    dateFormatted = formatDateTimeToLocal(order.fecha_recepcion, ' •');
  }

  const stateMap = {
    'pendiente': 'Ingresado',
    'en proceso': 'En proceso',
    'listo': 'Listo',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
  };
  const status = stateMap[(order.estado_actual || '').toLowerCase()] || order.estado_actual;

  let paymentStatus = 'Deuda';
  let paymentMethod = '';
  let paymentDate = '';
  let checkoutUrl = '';
  
  if (order.pagos && order.pagos.length > 0) {
    const approvedPayment = order.pagos.find(p => p.estado.toLowerCase() === 'approved');
    if (approvedPayment) {
      paymentStatus = 'Pagado';
      paymentMethod = approvedPayment.metodo_pago?.nombre || 'Mercado Pago';
      if (approvedPayment.fecha_pago) {
        paymentDate = formatDateTimeToLocal(approvedPayment.fecha_pago, ' -');
      }
    } else {
      const payingPayment = order.pagos.find(p => p.id_transaccion_externa);
      if (payingPayment) {
        checkoutUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${payingPayment.id_transaccion_externa}`;
      }

      const lastPayment = order.pagos[0];
      const mpStatus = (lastPayment?.estado || '').toLowerCase();
      if (mpStatus === 'in_process') {
        paymentStatus = 'Procesando Pago';
      } else if (mpStatus === 'rejected') {
        paymentStatus = 'Deuda';
      } else {
        paymentStatus = 'Deuda';
      }
    }
  }

  const services = (order.detalles || []).map(d => ({
    name: d.servicio?.nombre || 'Servicio',
    price: d.precio_unitario_momento || d.servicio?.precio || 0
  }));

  const colorMap = {
    'pendiente': 'bg-amber-500',
    'en proceso': 'bg-blue-500 animate-pulse',
    'listo': 'bg-green-500 animate-pulse',
    'entregado': 'bg-emerald-600',
    'cancelado': 'bg-red-500'
  };
  
  const sortedTracing = [...(order.historial_estados || [])].sort(
    (a, b) => parseUTCDate(a.fecha_hora) - parseUTCDate(b.fecha_hora)
  );

  const trazabilidad = sortedTracing.map(he => {
    const estName = he.estado?.nombre || '';
    const normEst = estName.toLowerCase();
    
    let displayTitle = estName;
    if (normEst === 'pendiente') displayTitle = 'Orden Recibida (Pendiente)';
    else if (normEst === 'en proceso') displayTitle = 'Lavado Iniciado (En Proceso)';
    else if (normEst === 'listo') displayTitle = 'Empaquetado y Colgado (Listo)';
    else if (normEst === 'entregado') displayTitle = 'Pedido Entregado';
    else if (normEst === 'cancelado') displayTitle = 'Pedido Cancelado';

    const localDate = formatDateTimeToLocal(he.fecha_hora, ' —');

    return {
      title: displayTitle,
      date: localDate,
      active: true,
      color: colorMap[normEst] || 'bg-gray-400'
    };
  });

  if (trazabilidad.length === 0) {
    trazabilidad.push({
      title: 'Orden Recibida (Pendiente)',
      date: dateFormatted.replace('•', '—'),
      active: true,
      color: 'bg-amber-500'
    });
  }

  return {
    id: order.id.toString(),
    date: dateFormatted,
    status,
    paymentStatus,
    cliente: order.usuario ? `${order.usuario.nombre} ${order.usuario.apellido || ''}`.trim() : 'Desconocido',
    clienteDni: order.usuario?.dni || 'Consumidor Final',
    clienteEmail: order.usuario?.email || '-',
    clienteTelefono: order.usuario?.telefono || '-',
    services,
    subtotal: (order.monto_actual || 0) / 1.21,
    tax: (order.monto_actual || 0) - ((order.monto_actual || 0) / 1.21),
    total: order.monto_actual,
    paymentMethod,
    paymentDate,
    trazabilidad,
    checkoutUrl
  };
};

const mapInsumoToFrontend = (ins) => {
  if (!ins) return null;
  return {
    id: ins.id,
    nombre: ins.nombre,
    cantidad: ins.cantidad,
    alerta: ins.cantidad_alerta,
    costo: ins.costo_actual
  };
};

const mapServicioToFrontend = (serv) => {
  if (!serv) return null;
  return {
    id: serv.id,
    nombre: serv.nombre,
    precio: serv.precio,
    unidad: serv.unidad_limpieza?.nombre || '',
    modalidad: serv.modalidad?.nombre === 'Standar' ? 'Estándar' : (serv.modalidad?.nombre || ''),
    insumos: (serv.insumos_utilizados || []).map(iu => ({
      insumoId: iu.insumo?.id,
      nombre: iu.insumo?.nombre,
      cantidad: iu.cantidad_utilizada,
      unidadMedida: iu.insumo?.nombre.toLowerCase().includes('mancha') ? 'gr' : 'ml'
    }))
  };
};

// --- Exported API Client Methods ---

export const api = {
  // === AUTENTICACION ===
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res && res.usuario) {
      res.usuario = mapUserToFrontend(res.usuario);
    }
    return res;
  },

  async activarCuenta(token, password) {
    const res = await request('/auth/activar-cuenta', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
    if (res) {
      return mapUserToFrontend(res);
    }
    return res;
  },

  async forgotPassword(email) {
    const res = await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return res;
  },

  async resetPassword(token, password) {
    const res = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password })
    });
    return res;
  },

  // === PEDIDOS ===
  async getPedidos(userRole, clientName = '') {
    const list = await request('/pedidos');
    const mapped = list.map(mapPedidoToFrontend);
    if (userRole === 'cliente' && clientName) {
      return mapped.filter(p => p.cliente.toLowerCase() === clientName.toLowerCase() || p.cliente.toLowerCase().includes(clientName.toLowerCase()));
    }
    return mapped;
  },

  async getPedidoById(id) {
    const data = await request(`/pedidos/${id}`);
    return mapPedidoToFrontend(data);
  },

  async updatePedido(id, data) {
    const updateBody = { ...data };
    if (updateBody.status) {
      const stateMapInv = {
        'ingresado': 'Pendiente',
        'en proceso': 'En Proceso',
        'listo': 'Listo',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
      };
      updateBody.status = stateMapInv[updateBody.status.toLowerCase()] || updateBody.status;
    }
    
    const backendKeys = ['estado_actual', 'status', 'fecha_entrega_estimada', 'baja', 'monto_actual', 'total'];
    const filteredUpdate = {};
    Object.keys(updateBody).forEach(k => {
      if (backendKeys.includes(k)) {
        filteredUpdate[k] = updateBody[k];
      }
    });

    let resultOrder;
    if (Object.keys(filteredUpdate).length > 0) {
      resultOrder = await request(`/pedidos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(filteredUpdate)
      });
    } else {
      resultOrder = await request(`/pedidos/${id}`);
    }
    
    return mapPedidoToFrontend(resultOrder);
  },

  async deletePedido(id) {
    await request(`/pedidos/${id}`, { method: 'DELETE' });
    return true;
  },

  async addPedido(data) {
    const res = await request('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        id_usuario: data.id_usuario,
        id_servicios: data.id_servicios
      })
    });
    const mapped = mapPedidoToFrontend(res.pedido);
    mapped.init_point_mercadopago = res.init_point_mercadopago;
    return mapped;
  },

  // === INSUMOS ===
  async getInsumos() {
    const list = await request('/insumos');
    return list.map(mapInsumoToFrontend);
  },

  async addInsumo(data) {
    const body = {
      nombre: data.nombre,
      cantidad: parseFloat(data.cantidad) || 0,
      cantidad_alerta: parseFloat(data.alerta) || 0,
      costo_actual: parseFloat(data.costo) || 0
    };
    const res = await request('/insumos/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return mapInsumoToFrontend(res);
  },

  async updateInsumo(id, data) {
    const body = {
      nombre: data.nombre,
      cantidad: parseFloat(data.cantidad) || 0,
      cantidad_alerta: parseFloat(data.alerta) || 0,
      costo_actual: parseFloat(data.costo) || 0
    };
    const res = await request(`/insumos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    return mapInsumoToFrontend(res);
  },

  async deleteInsumo(id) {
    await request(`/insumos/${id}`, { method: 'DELETE' });
    return true;
  },

  // === USUARIOS ===
  async getUsuarios() {
    const list = await request('/usuarios');
    return list.map(mapUserToFrontend);
  },

  async getUsuario(id) {
    const res = await request(`/usuarios/${id}`);
    return mapUserToFrontend(res);
  },

  async addUsuario(data) {
    const parts = (data.nombre || '').trim().split(' ');
    const nombre = parts[0] || '';
    const apellido = parts.slice(1).join(' ') || '';
    
    const body = {
      nombre,
      apellido,
      dni: data.DNI || '',
      email: data.email,
      telefono: data.telefono || null,
      id_rol: roleToId(data.rol)
    };
    const res = await request('/usuarios/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return mapUserToFrontend(res);
  },

  async updateUsuario(id, data) {
    const parts = (data.nombre || '').trim().split(' ');
    const nombre = parts[0] || '';
    const apellido = parts.slice(1).join(' ') || '';
    
    const body = {
      nombre,
      apellido,
      dni: data.DNI || '',
      email: data.email,
      telefono: data.telefono || null
    };
    if (data.rol) {
      body.id_rol = roleToId(data.rol);
    }
    const res = await request(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    return mapUserToFrontend(res);
  },

  async deleteUsuario(id) {
    await request(`/usuarios/${id}`, { method: 'DELETE' });
    return true;
  },

  // === SERVICIOS ===
  async getServicios() {
    const list = await request('/servicios');
    return list.map(mapServicioToFrontend);
  },

  async addServicio(data) {
    const [units, modalities] = await Promise.all([
      request('/unidades-limpieza'),
      request('/modalidades-servicio')
    ]);
    
    const unitObj = units.find(u => u.nombre.toLowerCase() === data.unidad.toLowerCase());
    const modObj = modalities.find(m => {
      const name = m.nombre.toLowerCase();
      const target = data.modalidad.toLowerCase();
      return name === target || (name === 'standar' && target === 'estándar');
    });

    if (!unitObj || !modObj) {
      throw new Error(`Unidad '${data.unidad}' o Modalidad '${data.modalidad}' no válida`);
    }

    const body = {
      nombre: data.nombre,
      precio: parseFloat(data.precio) || 0.0,
      id_unidad_limpieza: unitObj.id,
      id_modalidad: modObj.id,
      insumos_utilizados: (data.insumos || []).map(i => ({
        id_insumo: parseInt(i.insumoId),
        cantidad_utilizada: parseFloat(i.cantidad) || 0
      }))
    };

    const res = await request('/servicios/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return mapServicioToFrontend(res);
  },

  async updateServicio(id, data) {
    const [units, modalities] = await Promise.all([
      request('/unidades-limpieza'),
      request('/modalidades-servicio')
    ]);
    
    const unitObj = units.find(u => u.nombre.toLowerCase() === data.unidad.toLowerCase());
    const modObj = modalities.find(m => {
      const name = m.nombre.toLowerCase();
      const target = data.modalidad.toLowerCase();
      return name === target || (name === 'standar' && target === 'estándar');
    });

    if (!unitObj || !modObj) {
      throw new Error(`Unidad '${data.unidad}' o Modalidad '${data.modalidad}' no válida`);
    }

    const body = {
      nombre: data.nombre,
      precio: parseFloat(data.precio) || 0.0,
      id_unidad_limpieza: unitObj.id,
      id_modalidad: modObj.id,
      insumos_utilizados: (data.insumos || []).map(i => ({
        id_insumo: parseInt(i.insumoId),
        cantidad_utilizada: parseFloat(i.cantidad) || 0
      }))
    };

    const res = await request(`/servicios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    return mapServicioToFrontend(res);
  },

  async deleteServicio(id) {
    await request(`/servicios/${id}`, { method: 'DELETE' });
    return true;
  },

  // === RECLAMOS ===
  async getReclamos(userRole, clientName = '') {
    const list = await request('/reclamos');
    const mapped = list.map(c => ({
      id: c.id.toString(),
      pedidoId: c.pedidoId,
      cliente: c.cliente,
      status: c.status,
      categoria: c.categoria,
      fecha: formatDateToLocal(c.fecha_creacion || c.fecha),
      unread_count: c.unread_count || 0
    }));
    return mapped;
  },

  async getReclamoMensajes(claimId) {
    const data = await request(`/reclamos/${claimId}/mensajes`);
    return data.map(msg => ({
      ...msg,
      time: formatDateTimeToLocal(msg.fecha_envio || msg.time, ' —')
    }));
  },

  async addReclamoMensaje(claimId, sender, text) {
    const res = await request(`/reclamos/${claimId}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ mensaje: text })
    });
    return {
      ...res,
      time: formatDateTimeToLocal(res.fecha_envio || res.time, ' —')
    };
  },

  async addReclamo(data) {
    const body = {
      id_pedido: parseInt(data.id_pedido || data.pedidoId),
      id_categoria: parseInt(data.id_categoria || data.categoriaId),
      mensaje_inicial: data.mensaje_inicial || data.mensaje
    };
    const res = await request('/reclamos', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return {
      id: res.id.toString(),
      pedidoId: res.pedidoId,
      cliente: res.cliente,
      status: res.status,
      categoria: res.categoria,
      fecha: formatDateToLocal(res.fecha_creacion || res.fecha),
      unread_count: res.unread_count || 0
    };
  },

  async updateReclamo(id, status) {
    const res = await request(`/reclamos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return {
      id: res.id.toString(),
      pedidoId: res.pedidoId,
      cliente: res.cliente,
      status: res.status,
      categoria: res.categoria,
      fecha: formatDateToLocal(res.fecha_creacion || res.fecha),
      unread_count: res.unread_count || 0
    };
  }
};
