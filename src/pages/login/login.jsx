import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button";

export default function Login() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login({ dni, password, role });
    if (res && res.ok === false)
      setError(res.message || "No se pudo ingresar.");
  };

  return (
    <div className="container">
      <div style={{ height: 24 }} />
      <div className="card">
        <h2>Novatech - Lavadero</h2>
        <p className="muted">Iniciar sesión</p>
        <p className="muted" style={{ fontSize: 12, lineHeight: 1.4 }}>
          Clientes demo: DNI <strong>1234</strong>, <strong>5678</strong> o{" "}
          <strong>8987</strong> · contraseña <strong>1234</strong>. Operador:
          DNI <strong>0000</strong> · contraseña <strong>1234</strong>.
        </p>
        {error && (
          <p style={{ color: "#c21", fontSize: 13, margin: "8px 0 0" }}>
            {error}
          </p>
        )}
        <form onSubmit={submit}>
          <input
            className="input"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          <input
            className="input"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ margin: "8px 0 12px" }}>
            <label
              className="muted"
              htmlFor="role"
              style={{ display: "block", marginBottom: 6 }}
            >
              Tipo de cuenta
            </label>
            <select
              id="role"
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ marginTop: 0 }}
            >
              <option value="client">Cliente</option>
              <option value="operator">Operador</option>
            </select>
          </div>

          <Button type="submit">Ingresar</Button>
        </form>
      </div>
    </div>
  );
}
