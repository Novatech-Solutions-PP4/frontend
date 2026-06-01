import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function ClientPerfil() {
  const { user } = useAuth();
  const { getClienteByDni } = useLaundryData();
  const c = getClienteByDni(user?.dni);

  return (
    <div>
      <h2 style={{ margin: "8px 0 12px", fontSize: "1.25rem" }}>Perfil</h2>
      <div className="card">
        {!c ? (
          <p className="muted">
            No encontramos tu ficha de cliente para este DNI. Pedile al operador
            que te registre.
          </p>
        ) : (
          <>
            <div className="avatar-placeholder" aria-hidden />
            <div className="perfil-rows">
              <div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Nombre
                </div>
                <div>{c.nombre}</div>
              </div>
              {c.nacimiento && (
                <div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Fecha de nacimiento
                  </div>
                  <div>{c.nacimiento}</div>
                </div>
              )}
              <div>
                <div className="muted" style={{ fontSize: 12 }}>
                  DNI
                </div>
                <div>{c.dni}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Teléfono
                </div>
                <div>{c.telefono || "—"}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Email
                </div>
                <div>{c.email || "—"}</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Dirección
                </div>
                <div>{c.direccion || "—"}</div>
              </div>
            </div>
            <Link to="/client/perfil/editar" className="btn btn--pill btn--wide" style={{ marginTop: 18 }}>
              Editar perfil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
