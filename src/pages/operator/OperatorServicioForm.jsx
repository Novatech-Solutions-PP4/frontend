import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import ScreenHeader from "../../components/ScreenHeader";
import { useLaundryData } from "../../contexts/LaundryDataContext";

function normalizeConsumibles(consumibles) {
  return {
    detergente: String(consumibles.detergente ?? ""),
    suavizante: String(consumibles.suavizante ?? ""),
    quitamanchas: String(consumibles.quitamanchas ?? ""),
  };
}

export default function OperatorServicioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getServicio, addServicio, updateServicio } = useLaundryData();
  const servicio = useMemo(
    () => (id ? getServicio(id) : null),
    [getServicio, id],
  );
  const isNew = !id;

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [consumibles, setConsumibles] = useState(
    normalizeConsumibles({ detergente: "", suavizante: "", quitamanchas: "" }),
  );

  useEffect(() => {
    if (!servicio) return;
    setNombre(servicio.nombre ?? "");
    setPrecio(String(servicio.precio ?? ""));
    setConsumibles(normalizeConsumibles(servicio.consumibles ?? {}));
  }, [servicio]);

  if (!isNew && !servicio) {
    return (
      <div>
        <ScreenHeader title="Servicio" backTo="/operator/servicios" />
        <div className="card" style={{ marginTop: 12 }}>
          <p>Servicio no encontrado.</p>
        </div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      nombre,
      precio: Number(precio) || 0,
      consumibles: {
        detergente: Number(consumibles.detergente) || 0,
        suavizante: Number(consumibles.suavizante) || 0,
        quitamanchas: Number(consumibles.quitamanchas) || 0,
      },
    };

    if (isNew) {
      const newId = addServicio(payload);
      navigate(`/operator/servicios/${newId}`, { replace: true });
      return;
    }

    updateServicio(id, payload);
  };

  return (
    <div>
      <ScreenHeader
        title={isNew ? "Nuevo servicio" : "Editar servicio"}
        backTo="/operator/servicios"
      />

      <form className="card" style={{ marginTop: 12 }} onSubmit={submit}>
        <input
          className="input"
          placeholder="Nombre del servicio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Precio"
          type="number"
          min="0"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />

        <div style={{ marginTop: 14 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Consumibles
          </div>
          <input
            className="input"
            placeholder="Cantidad detergente (L)"
            type="number"
            min="0"
            value={consumibles.detergente}
            onChange={(e) =>
              setConsumibles((prev) => ({
                ...prev,
                detergente: e.target.value,
              }))
            }
          />
          <input
            className="input"
            placeholder="Cantidad suavizante (L)"
            type="number"
            min="0"
            value={consumibles.suavizante}
            onChange={(e) =>
              setConsumibles((prev) => ({
                ...prev,
                suavizante: e.target.value,
              }))
            }
          />
          <input
            className="input"
            placeholder="Cantidad quitamanchas (L)"
            type="number"
            min="0"
            value={consumibles.quitamanchas}
            onChange={(e) =>
              setConsumibles((prev) => ({
                ...prev,
                quitamanchas: e.target.value,
              }))
            }
          />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Button type="submit">Guardar</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/operator/servicios")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
