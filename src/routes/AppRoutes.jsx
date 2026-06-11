import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import ClientLayout from '../components/layout/ClientLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import ActivarCuenta from '../pages/auth/ActivarCuenta';
import OlvideContrasena from '../pages/auth/OlvideContrasena';
import ResetPassword from '../pages/auth/ResetPassword';

// Client / Shared Pages
import Dashboard from '../pages/panel/Dashboard';
import Pedidos from '../pages/panel/Pedidos';
import DetallePedido from '../pages/panel/DetallePedido';
import Perfil from '../pages/panel/Perfil';
import EditarPerfil from '../pages/panel/EditarPerfil';
import CambiarPassword from '../pages/panel/CambiarPassword';
import ReclamosListado from '../pages/panel/ReclamosListado';
import ReclamoMensajes from '../pages/panel/ReclamoMensajes';
import ReclamoNuevo from '../pages/panel/ReclamoNuevo';

// Staff Specific Pages
import Insumos from '../pages/panel/Insumos';
import Clientes from '../pages/panel/Clientes';
import Usuarios from '../pages/panel/Usuarios';
import Servicios from '../pages/panel/Servicios';
import PedidoNuevo from '../pages/panel/PedidoNuevo';
import PedidoEditar from '../pages/panel/PedidoEditar';

// Route Guards
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de Autenticación */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/activar-cuenta" element={<ActivarCuenta />} />
          <Route path="/recuperar-contrasena" element={<OlvideContrasena />} />
          <Route path="/restablecer-password" element={<ResetPassword />} />
        </Route>

        {/* Rutas Privadas del Panel */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <ClientLayout />
            </PrivateRoute>
          }
        >
          {/* Rutas Compartidas (Todos los Roles) */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route
            path="pedidos/nuevo"
            element={
              <RoleRoute allowedRoles={['operador', 'administrador']}>
                <PedidoNuevo />
              </RoleRoute>
            }
          />
          <Route path="pedidos/:id" element={<DetallePedido />} />
          <Route
            path="pedidos/:id/editar"
            element={
              <RoleRoute allowedRoles={['operador', 'administrador']}>
                <PedidoEditar />
              </RoleRoute>
            }
          />
          <Route path="perfil" element={<Perfil />} />
          <Route path="perfil/editar" element={<EditarPerfil />} />
          <Route path="perfil/password" element={<CambiarPassword />} />
          <Route path="reclamos" element={<ReclamosListado />} />
          <Route path="reclamos/:id" element={<ReclamoMensajes />} />

          {/* Rutas Exclusivas del Cliente */}
          <Route
            path="reclamos/nuevo"
            element={
              <RoleRoute allowedRoles={['cliente']}>
                <ReclamoNuevo />
              </RoleRoute>
            }
          />

          {/* Rutas Compartidas Staff (Operador y Administrador) */}
          <Route
            path="insumos"
            element={
              <RoleRoute allowedRoles={['operador', 'administrador']}>
                <Insumos />
              </RoleRoute>
            }
          />
          <Route
            path="servicios"
            element={
              <RoleRoute allowedRoles={['operador', 'administrador']}>
                <Servicios />
              </RoleRoute>
            }
          />

          {/* Rutas Exclusivas de Operador */}
          <Route
            path="clientes"
            element={
              <RoleRoute allowedRoles={['operador']}>
                <Clientes />
              </RoleRoute>
            }
          />

          {/* Rutas Exclusivas de Administrador */}
          <Route
            path="usuarios"
            element={
              <RoleRoute allowedRoles={['administrador']}>
                <Usuarios />
              </RoleRoute>
            }
          />

          {/* Redirecciones de pagos antiguos de Mercado Pago */}
          <Route path="pago-exitoso" element={<Navigate to="/pedidos" replace />} />
          <Route path="pago-fallido" element={<Navigate to="/pedidos" replace />} />
          <Route path="pago-pendiente" element={<Navigate to="/pedidos" replace />} />

          {/* Redirección por defecto */}
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Redirecciones Generales */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

