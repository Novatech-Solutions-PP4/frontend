import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import IconButton from "../../components/IconButton";
import { useAuth } from "../../contexts/AuthContext";
import { useLaundryData } from "../../contexts/LaundryDataContext";

function navClass({ isActive }) {
  return `bottom-nav-item${isActive ? " is-active" : ""}`;
}

export default function OperatorLayout() {
  const { logout, user } = useAuth();
  const { hasLowStockAlert } = useLaundryData();
  const location = useLocation();
  const hideNav =
    location.pathname.includes("/pedidos/nuevo") ||
    location.pathname.includes("/clientes/nuevo") ||
    location.pathname.includes("/servicios/");

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <span className="app-topbar-brand">{user?.name ?? "Operador"}</span>
        <IconButton title="Cerrar sesión" onClick={logout}>
          <span className="icon-logout" aria-hidden>
            ↩
          </span>
        </IconButton>
      </header>

      <main className={`app-main${hideNav ? " app-main--full" : ""}`}>
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="bottom-nav bottom-nav--5" aria-label="Principal">
          <NavLink
            to="/operator/pedidos"
            className={({ isActive }) =>
              `bottom-nav-item${
                isActive || location.pathname.startsWith("/operator/pedidos")
                  ? " is-active"
                  : ""
              }`
            }
          >
            <span className="bottom-nav-dot" />
            Pedidos
          </NavLink>
          <NavLink to="/operator/clientes" className={navClass}>
            <span className="bottom-nav-dot" />
            Clientes
          </NavLink>
          <NavLink to="/operator/insumos" className={navClass}>
            <span
              className={`bottom-nav-dot${hasLowStockAlert ? " bottom-nav-dot--alert" : ""}`}
            />
            Insumos
          </NavLink>
          <NavLink to="/operator/servicios" className={navClass}>
            <span className="bottom-nav-dot" />
            Servicios
          </NavLink>
          <NavLink to="/operator/reclamos" className={navClass}>
            <span className="bottom-nav-dot bottom-nav-dot--alert" />
            Reclamos
          </NavLink>
        </nav>
      )}
    </div>
  );
}
