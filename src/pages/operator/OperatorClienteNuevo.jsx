import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

export default function OperatorClienteNuevo() {
  const navigate = useNavigate();
  const { addCliente } = useLaundryData();
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nacimiento, setNacimiento] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const id = addCliente({ nombre, dni, telefono, email, direccion, nacimiento });
    navigate(`/operator/clientes/${id}`, { replace: true });
  };

  return (
    <div>
      <ScreenHeader title="Nuevo cliente" backTo="/operator/clientes" />
      <form className="card" style={{ marginTop: 12 }} onSubmit={submit}>
        <input
          className="input"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Fecha de nacimiento (dd/mm/aaaa)"
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
          placeholder="Email"
          type="email"
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
          <Button type="submit">Crear cliente</Button>
          <Link to="/operator/clientes" className="btn secondary" style={{ textAlign: "center" }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
