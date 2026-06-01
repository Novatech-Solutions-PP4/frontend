import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLaundryData } from "./LaundryDataContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { usuarios, clientes, getAuthUserByDniRole } = useLaundryData();

  const refreshProfile = useCallback(() => {
    setUser((u) => {
      if (!u || u.role !== "client") return u;
      const match = clientes.find((c) => String(c.dni) === String(u.dni));
      return match ? { ...u, name: match.nombre } : u;
    });
  }, [clientes]);

  const login = async ({ dni, password, role }) => {
    const normalizedDni = String(dni || "").replace(/\D/g, "");
    const matchUser = getAuthUserByDniRole(normalizedDni, role);
    if (!matchUser) {
      const fallback =
        role === "operator"
          ? "DNI no registrado para operador. Demo: 0000."
          : "DNI no registrado en el lavadero.";
      return { ok: false, message: fallback };
    }
    if (password !== matchUser.password) {
      return {
        ok: false,
        message:
          role === "operator"
            ? "Contraseña incorrecta. Demo operador: 1234."
            : "Contraseña incorrecta.",
      };
    }

    if (role === "client") {
      const matchCliente = clientes.find(
        (c) => String(c.dni) === normalizedDni,
      );
      if (!matchCliente) {
        return { ok: false, message: "DNI no registrado en el lavadero." };
      }
      setUser({
        id: matchUser.id,
        dni: normalizedDni,
        role,
        token: "fake-jwt-token",
        name: matchCliente.nombre,
      });
      navigate("/client");
      return { ok: true };
    }

    setUser({
      id: matchUser.id,
      dni: normalizedDni,
      role,
      token: "fake-jwt-token",
      name: `${matchUser.nombre} ${matchUser.apellido || ""}`.trim(),
    });
    navigate("/operator");
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
