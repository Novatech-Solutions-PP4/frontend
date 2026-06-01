import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import IconButton from "../../components/IconButton";
import { useAuth } from "../../contexts/AuthContext";

function tabClass({ isActive }) {
  return `bottom-nav-item bottom-nav-item--client${isActive ? " is-active" : ""}`;
}

export default function ClientLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <span className="app-topbar-brand">{user?.name ?? "Cliente"}</span>
        <IconButton title="Cerrar sesión" onClick={logout}>
          <span className="icon-logout" aria-hidden>
            ↩
          </span>
        </IconButton>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav bottom-nav--2" aria-label="Principal">
        <NavLink to="/client" end className={tabClass}>
          <span className="bottom-nav-dot" />
          Dashboard
        </NavLink>
        <NavLink to="/client/perfil" className={tabClass}>
          <span className="bottom-nav-dot" />
          Perfil
        </NavLink>
      </nav>
    </div>
  );
}
