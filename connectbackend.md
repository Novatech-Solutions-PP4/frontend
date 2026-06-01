# Conexión Frontend + Backend

Este documento resume el contrato esperado para migrar el frontend de mock local a datos reales del backend.

## Estado actual del frontend

- Login por rol `client` / `operator`.
- Datos locales persistidos en `localStorage` como fallback.
- Flujo de pedidos con estados `ingresado`, `en_proceso`, `listo`, `entregado`.
- Simulación de pago desde la vista del cliente.
- Modal de canastos en lugar de QR real.
- Servicios editables desde el panel de operador.
- Alertas de stock basadas en `cantidad < 10`.

## Endpoints existentes en el backend

Los docs públicos actuales exponen solo estas áreas:

- Insumos
- Servicios
- Estados
- Modalidades de servicio
- Unidades de limpieza

No aparecen todavía endpoints para auth, usuarios/clientes, pedidos, canastos, reclamos, pagos ni movimientos de stock.

### Servicios

- `GET /servicios/`
- `GET /servicios/{servicio_id}`
- `POST /servicios/`
- `PATCH /servicios/{servicio_id}`
- `DELETE /servicios/{servicio_id}`

### Insumos

- `GET /insumos/`
- `GET /insumos/{insumo_id}`
- `POST /insumos/`
- `PATCH /insumos/{insumo_id}`
- `DELETE /insumos/{insumo_id}`

### Estados

- `GET /estados/`
- `GET /estados/{estado_id}`

### Modalidades de servicio

- `GET /modalidades-servicio/`
- `GET /modalidades-servicio/{id}`
- `POST /modalidades-servicio/`
- `PATCH /modalidades-servicio/{id}`
- `DELETE /modalidades-servicio/{id}`

### Unidades de limpieza

- `GET /unidades-limpieza/`
- `GET /unidades-limpieza/{unidad_id}`
- `POST /unidades-limpieza/`
- `PATCH /unidades-limpieza/{unidad_id}`
- `DELETE /unidades-limpieza/{unidad_id}`

### OpenAPI y docs

- `GET /openapi.json`
- `GET /docs`
- `GET /redoc`

## Endpoints faltantes para el frontend

Estas rutas siguen faltando para poder reemplazar por completo el mock local:

### Autenticación

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`

### Usuarios / clientes

- `GET /usuarios/`
- `GET /usuarios/{id}`
- `POST /usuarios/`
- `PATCH /usuarios/{id}`
- `DELETE /usuarios/{id}` o baja lógica
- `GET /clientes/`
- `GET /clientes/{id}`
- `POST /clientes/`
- `PATCH /clientes/{id}`

### Pedidos

- `GET /pedidos/`
- `GET /pedidos/{id}`
- `POST /pedidos/`
- `PATCH /pedidos/{id}`
- `PATCH /pedidos/{id}/estado`
- `PATCH /pedidos/{id}/pago`
- `GET /pedidos/{id}/historial`

### Canastos

- `GET /canastos/`
- `GET /canastos/{id}`
- `POST /canastos/`
- `PATCH /canastos/{id}`
- `PATCH /canastos/{id}/ocupar`
- `PATCH /canastos/{id}/liberar`

### Reclamos

- `GET /reclamos/`
- `GET /reclamos/{id}`
- `POST /reclamos/`
- `PATCH /reclamos/{id}`
- `GET /reclamos/{id}/mensajes`
- `POST /reclamos/{id}/mensajes`

### Pagos / facturación

- `GET /pagos/`
- `GET /pagos/{id}`
- `POST /pagos/`
- `PATCH /pagos/{id}`
- `GET /metodos-pago/`

### Stock / movimientos

- `GET /movimientos-insumos/`
- `POST /movimientos-insumos/`
- `GET /stock-alertas/`

## Modelos publicados hoy por el backend

### Insumos

- `InsumoCreate`
- `InsumoUpdate`
- `InsumoResponse`

### Servicios

- `ServicioCreate`
- `ServicioUpdate`
- `ServicioResponse`

### Estados

- `EstadoResponse`

### Modalidades de servicio

- `ModalidadServicioCreate`
- `ModalidadServicioUpdate`
- `ModalidadServicioResponse`

### Unidades de limpieza

- `UnidadLimpiezaCreate`
- `UnidadLimpiezaUpdate`
- `UnidadLimpiezaResponse`

## Brechas importantes detectadas en la API actual

- `ServicioCreate` en la API actual no contempla `id_unidad_limpieza`, `id_modalidad` ni relación con insumos, aunque el modelo SQL sí los tiene.
- No existe modelo público de usuarios/clientes, por lo que el login por DNI todavía no se puede conectar.
- No existe modelo público de pedidos, por lo que tampoco se puede conectar el flujo de estados, historial, pago o canastos.
- No existe modelo público de reclamos.
- No existe modelo público de movimientos de stock.

## Modelos esperados para integrar el frontend

### Usuarios

```json
{
  "id": 1,
  "rol": "client",
  "dni": "1234",
  "email": "cliente@correo.com",
  "telefono": "",
  "nombre": "Ricardo",
  "apellido": "Darin",
  "password": "***",
  "cuenta_activa": true,
  "password_cambiada": false
}
```

### Clientes

```json
{
  "id": 1,
  "usuario_id": 1,
  "dni": "1234",
  "nombre": "Ricardo Darin",
  "telefono": "",
  "email": "cliente@correo.com",
  "direccion": "...",
  "nacimiento": "16/01/1957"
}
```

### Servicios

```json
{
  "id": 1,
  "nombre": "Lavado Clasico",
  "precio": 6500,
  "baja": false,
  "id_unidad_limpieza": 1,
  "id_modalidad": 1,
  "modalidad_nombre": "Estandar",
  "unidad_limpieza_nombre": "Canasto",
  "insumos": [
    { "id_insumo": 1, "cantidad_utilizada": 0.5 },
    { "id_insumo": 2, "cantidad_utilizada": 0.2 }
  ]
}
```

### Insumos

```json
{
  "id": 1,
  "nombre": "Detergente",
  "cantidad": 450,
  "cantidad_alerta": 10,
  "costo_actual": 0,
  "baja": false
}
```

### Canastos

```json
{
  "id": 1,
  "codigo": "245",
  "estado": "libre",
  "pedido_id": null
}
```

### Pedidos

```json
{
  "id": 101,
  "usuario_id": 1,
  "estado_actual": "ingresado",
  "pagado": false,
  "subtotal": 6500,
  "impuestos": 1365,
  "total": 7865,
  "fecha_recepcion": "2025-02-14T14:25:00Z",
  "fecha_entrega_estimada": null,
  "servicio_id": 1,
  "servicio_nombre": "Lavado Clasico",
  "canastos": [{ "codigo": "245" }],
  "historial": [
    {
      "estado": "ingresado",
      "fecha_hora": "2025-02-14T14:25:00Z",
      "usuario_id": 99
    }
  ]
}
```

### Reclamos

```json
{
  "id": 1,
  "pedido_id": 101,
  "categoria_id": 1,
  "estado_id": 1,
  "fecha_creacion": "2025-02-14T14:25:00Z"
}
```

### Pagos

```json
{
  "id": 1,
  "pedido_id": 101,
  "metodo_pago_id": 1,
  "estado": "pagado",
  "monto": 7865,
  "fecha_pago": "2025-02-14T14:30:00Z"
}
```

## Contratos que el backend debería respetar

- Un pedido solo pasa a `entregado` si está pagado.
- Un pedido permanece en activos mientras no esté `entregado`.
- El estado `listo` no debe moverlo al historial.
- El consumo de insumos debe aplicarse al entrar en `en_proceso`.
- Los canastos deben poder marcarse como `ocupado` y luego liberarse.
- El login debe aceptar `dni + password + rol`.
- La respuesta de perfil debe incluir rol y datos personales para refrescar la UI.
- Los endpoints de servicios deberían devolver también la relación necesaria para consumo de insumos cuando se agreguen esas tablas al API.

## Checklist para el equipo backend

- [ ] Crear auth JWT o equivalente.
- [ ] Exponer usuarios/clientes con rol.
- [ ] Exponer pedidos completos con estado actual e historial.
- [ ] Exponer pagos y métodos de pago.
- [ ] Exponer canastos con estado libre/ocupado.
- [ ] Exponer reclamos y mensajes.
- [ ] Exponer movimientos de insumos.
- [ ] Alinear nombres de estados y contratos JSON con el frontend.
- [ ] Publicar en la API los campos relacionales de `servicios` (`id_unidad_limpieza`, `id_modalidad`, insumos).

## Nota de integración

Hoy el frontend usa `src/services/laundryDataService.js` como fuente local de datos. Cuando el backend esté listo, ese archivo se puede reemplazar por llamadas HTTP manteniendo la misma forma de datos.
