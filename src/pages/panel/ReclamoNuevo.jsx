import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function ReclamoNuevo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [pedidoId, setPedidoId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [pedidoOptions, setPedidoOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getPedidos('cliente', user.nombre)
        .then((orders) => {
          const options = orders.map(p => ({
            value: p.id,
            label: `Pedido #${p.id} — $${p.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })} (${p.status})`
          }));
          setPedidoOptions(options);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching orders:', err);
          setLoading(false);
        });
    }
  }, [user]);

  const categoriaOptions = [
    { value: '1', label: 'Prenda Dañada o Manchada' },
    { value: '2', label: 'Falta una Prenda en la Entrega' },
    { value: '3', label: 'Demora excesiva en los plazos' },
    { value: '4', label: 'Error en el Cobro / Precio de Lista' },
    { value: '5', label: 'Otro motivo específico' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pedidoId) {
      addToast('Por favor seleccione el pedido afectado.', 'warning');
      return;
    }
    if (!categoriaId) {
      addToast('Por favor seleccione el motivo del reclamo.', 'warning');
      return;
    }
    if (!mensaje.trim()) {
      addToast('Por favor ingrese una explicación detallada.', 'warning');
      return;
    }

    setLoading(true);
    api.addReclamo({
      pedidoId: parseInt(pedidoId),
      categoriaId: parseInt(categoriaId),
      mensaje: mensaje
    })
      .then(() => {
        addToast('Reclamo creado con éxito.', 'success');
        navigate('/reclamos');
      })
      .catch((err) => {
        addToast(err.message || 'Error al crear reclamo', 'warning');
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400">Preparando reclamo...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start space-y-5 overflow-y-auto pr-1">
      {/* HEADER SUPERIOR INTERNO */}
      <div className="flex items-center gap-2 text-gray-800 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/reclamos')}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          aria-label="Volver a la lista de reclamos"
        >
          <ArrowLeft size={16} strokeWidth={3} />
        </button>
        <h3 className="text-base font-black tracking-tight">
          Iniciar Nuevo Reclamo
        </h3>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed pl-1 shrink-0">
        Por favor, seleccioná el pedido afectado y detallanos lo ocurrido.
        Nuestro equipo auditará el caso a la brevedad.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2 flex-1">
        {/* Selector de Pedido */}
        <Select
          label="Seleccionar Pedido"
          id="pedido"
          value={pedidoId}
          onChange={(e) => setPedidoId(e.target.value)}
          options={pedidoOptions}
          placeholder="Elegí una orden..."
          required
        />

        {/* Selector de Categoría */}
        <Select
          label="Motivo del Reclamo"
          id="categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          options={categoriaOptions}
          placeholder="¿Cuál es el inconveniente?"
          required
        />

        {/* Mensaje Explicativo */}
        <div className="space-y-1.5">
          <label
            htmlFor="mensaje"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 block"
          >
            Explicación Detallada
          </label>
          <textarea
            id="mensaje"
            rows={5}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
            placeholder="Describí detalladamente lo sucedido con tus servicios..."
            className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl p-3.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none placeholder-gray-400 leading-relaxed"
          ></textarea>
        </div>

        {/* Botonera de Acción */}
        <div className="pt-4 space-y-2 shrink-0">
          <Button type="submit" variant="primary">
            Confirmar e Iniciar Reclamo
          </Button>

          <Button
            type="button"
            onClick={() => navigate('/reclamos')}
            variant="secondary"
          >
            Cancelar
          </Button>
        </div>
      </form>

      {/* Nota de pie de página */}
      <div className="text-center mt-2 shrink-0 pb-2">
        <p className="text-[9px] text-gray-400 font-medium tracking-wide">
          LavaPro garantiza la auditoría fotográfica de todos los procesos físicos.
        </p>
      </div>
    </div>
  );
}
