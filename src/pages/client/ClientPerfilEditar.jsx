import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ScreenHeader from "../../components/ScreenHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function ClientPerfilEditar() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { getClienteByDni, updateCliente } = useLaundryData();
  const c = getClienteByDni(user?.dni);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nacimiento, setNacimiento] = useState("");

  useEffect(() => {
    if (!c) return;
    setNombre(c.nombre || "");
    setTelefono(c.telefono || "");
    setEmail(c.email || "");
    setDireccion(c.direccion || "");
    setNacimiento(c.nacimiento || "");
  }, [c]);

  const submit = (e) => {
    e.preventDefault();
    if (!c) return;
    updateCliente(c.id, { nombre, telefono, email, direccion, nacimiento });
    refreshProfile();
    navigate("/client/perfil", { replace: true });
  };

  if (!c) {
    return (
      <div>
        <ScreenHeader title="Editar perfil" backTo="/client/perfil" />
        <div className="card" style={{ marginTop: 12 }}>
          <p className="muted">No hay perfil para editar.</p>
          <Link to="/client/perfil" className="btn">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title="Editar perfil" backTo="/client/perfil" />
      <form className="card" style={{ marginTop: 12 }} onSubmit={submit}>
        <label className="field-label">DNI (no editable)</label>
        <input className="input" value={c.dni} disabled />

        <input
          className="input"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Fecha de nacimiento"
          value={nacimiento}
          onChange={(e) => setNacimiento(e.target.value)}
        />
        <input
          className="input"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Button type="submit">Guardar cambios</Button>
          <Link to="/client/perfil" className="btn secondary" style={{ textAlign: "center" }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
