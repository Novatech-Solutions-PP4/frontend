import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../hooks/useAuth.js";

import { useLaundryData } from "./LaundryDataContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const { clientes, getAuthUserByDniRole } = useLaundryData();

  useEffect(() => {
    const userData = localStorage.getItem("auth_user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const login = async ({ dni, password, role }) => {
    try {
      const result = await loginMutation.mutateAsync({ dni, password, role });
      const userData = {
        id: result.user?.id || dni,
        dni: result.user?.dni || dni,
        role: role,
        token: result.token,
        name: result.user?.name || dni,
      };
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      navigate(role === "client" ? "/client" : "/operator");
      return { ok: true };
    } catch (error) {
      // Fallback local
      const normalizedDni = String(dni || "").replace(/\D/g, "");
      const matchUser = getAuthUserByDniRole(normalizedDni, role);
      if (!matchUser) {
        return {
          ok: false,
          message:
            role === "operator"
              ? "DNI no registrado para operador. Demo: 0000."
              : "DNI no registrado en el lavadero.",
        };
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

      const matchCliente =
        role === "client"
          ? clientes.find((c) => String(c.dni) === normalizedDni)
          : null;
      const userData = {
        id: matchUser.id,
        dni: normalizedDni,
        role,
        token: "fake-jwt-token",
        name: matchCliente?.nombre || matchUser.nombre || normalizedDni,
      };
      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      navigate(role === "client" ? "/client" : "/operator");
      return { ok: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  const refreshProfile = useCallback(() => {
    if (user?.role === "client") {
      const match = clientes.find((c) => String(c.dni) === String(user.dni));
      if (match) {
        const updated = { ...user, name: match.nombre };
        setUser(updated);
        localStorage.setItem("auth_user", JSON.stringify(updated));
      }
    }
  }, [user, clientes]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
