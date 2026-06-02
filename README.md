# Novatech - Lavadero

Frontend del lavadero preparado para migrar de datos mock en navegador a backend real.

## Estado actual

- React + Vite en JavaScript.
- Login por rol `client` / `operator` con usuario demo separado.
- Estado local centralizado en `src/services/laundryDataService.js` y persistido en `localStorage` como fallback.
- Flujo de pedidos con `ingresado`, `en_proceso`, `listo` y `entregado`.
- Simulación de pago desde la vista del cliente.
- Popup de canastos en lugar de QR real.
- Servicios editables con precio y consumibles.
- Insumos con alerta automática cuando el stock baja de 10 litros.

## Estructura relevante

- `src/contexts/AuthContext.jsx` - autenticación simulada por rol.
- `src/contexts/LaundryDataContext.jsx` - estado compartido y reglas de negocio.
- `src/services/laundryDataService.js` - datos semilla, normalización y helpers de dominio.
- `connectbackend.md` - contrato esperado para backend.
- `src/pages/operator/*` - panel operador.
- `src/pages/client/*` - panel cliente.

## Qué hace hoy

- El cliente puede ver pedidos, abrir el detalle y simular el pago.
- El operador puede crear y avanzar pedidos, ver canastos y marcar pagos.
- Los pedidos entregados pasan al historial; los pedidos listos siguen en activos.
- Al pasar un pedido a `en_proceso` se descuenta stock según el servicio elegido.

## Backend esperado

La guía completa está en [connectbackend.md](connectbackend.md).

## Cómo ejecutar

```powershell
Set-Location -LiteralPath 'c:\wamp64\www\Lav-tech'
npm install
npm run dev
```

## Notas

- Hoy el backend todavía no está conectado; el frontend usa la capa local para avanzar sin bloquear la UI.
- Cuando el backend quede listo, la transición será reemplazar la fuente de datos en `src/services/laundryDataService.js` por llamadas HTTP manteniendo el contrato.
