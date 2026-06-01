import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/login/login";
import OperatorLayout from "./pages/operator/OperatorLayout";
import OperatorHome from "./pages/operator/OperatorHome";
import OperatorPedidosList from "./pages/operator/OperatorPedidosList";
import OperatorPedidoDetail from "./pages/operator/OperatorPedidoDetail";
import OperatorPedidoNuevo from "./pages/operator/OperatorPedidoNuevo";
import OperatorClientesList from "./pages/operator/OperatorClientesList";
import OperatorClienteDetail from "./pages/operator/OperatorClienteDetail";
import OperatorClienteNuevo from "./pages/operator/OperatorClienteNuevo";
import OperatorInsumos from "./pages/operator/OperatorInsumos";
import OperatorServiciosList from "./pages/operator/OperatorServiciosList";
import OperatorServicioForm from "./pages/operator/OperatorServicioForm";
import OperatorReclamos from "./pages/operator/OperatorReclamos";
import ClientLayout from "./pages/client/ClientLayout";
import ClientHome from "./pages/client/Home";
import ClientPedidosList from "./pages/client/ClientPedidosList";
import ClientPedidoDetail from "./pages/client/ClientPedidoDetail";
import ClientPerfil from "./pages/client/ClientPerfil";
import ClientPerfilEditar from "./pages/client/ClientPerfilEditar";

function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/operator"
          element={
            <RequireAuth role="operator">
              <OperatorLayout />
            </RequireAuth>
          }
        >
          <Route index element={<OperatorHome />} />
          <Route path="pedidos/nuevo" element={<OperatorPedidoNuevo />} />
          <Route path="pedidos/:id" element={<OperatorPedidoDetail />} />
          <Route path="pedidos" element={<OperatorPedidosList />} />
          <Route path="clientes/nuevo" element={<OperatorClienteNuevo />} />
          <Route path="clientes/:id" element={<OperatorClienteDetail />} />
          <Route path="clientes" element={<OperatorClientesList />} />
          <Route path="servicios/nuevo" element={<OperatorServicioForm />} />
          <Route path="servicios/:id" element={<OperatorServicioForm />} />
          <Route path="servicios" element={<OperatorServiciosList />} />
          <Route path="reclamos" element={<OperatorReclamos />} />
          <Route path="insumos" element={<OperatorInsumos />} />
          <Route
            path="finanzas"
            element={<Navigate to="/operator/servicios" replace />}
          />
        </Route>
        <Route
          path="/client"
          element={
            <RequireAuth role="client">
              <ClientLayout />
            </RequireAuth>
          }
        >
          <Route index element={<ClientHome />} />
          <Route path="perfil/editar" element={<ClientPerfilEditar />} />
          <Route path="perfil" element={<ClientPerfil />} />
          <Route path="pedidos/:id" element={<ClientPedidoDetail />} />
          <Route path="pedidos" element={<ClientPedidosList />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
