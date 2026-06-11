import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function PedidoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getPedidoById(id)
      .then((data) => {
        if (data) {
          setOrder(data);
          setStatus(data.status);
          setTotal(data.total);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const isAdmin = user?.rol === 'administrador';
  const isOperator = user?.rol === 'operador';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!status) {
      addToast('Por favor seleccione un estado.', 'warning');
      return;
    }
    if (isAdmin && (total === '' || isNaN(parseFloat(total)) || parseFloat(total) <= 0)) {
      addToast('Por favor ingrese un importe válido mayor a 0.', 'warning');
      return;
    }

    const updateData = isAdmin 
      ? { status, total: parseFloat(total) } 
      : { status };

    api.updatePedido(id, updateData)
      .then(() => {
        if (isAdmin) {
          addToast(
            `Control de auditoría exitoso. Datos financieros e independientes guardados. Nuevo total: $${total}`,
            'success'
          );
        } else {
          addToast(
            'Estado del pedido actualizado con éxito.',
            'success'
          );
        }
        navigate(`/pedidos/${order.id}`);
      })
      .catch((err) => {
        console.error(err);
        addToast('Error al actualizar el pedido', 'warning');
      });
  };

  const focusBorderColor = isAdmin ? 'focus:border-purple-500' : 'focus:border-amber-500';
  const roleName = isAdmin ? 'Admin' : 'Operador';
  const badgeColor = isAdmin 
    ? 'bg-purple-50 text-purple-600 border-purple-100' 
    : 'bg-amber-50 text-amber-700 border-amber-100';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando datos del pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <h3 className="text-lg font-bold text-gray-800">Pedido no encontrado</h3>
        <Button onClick={() => navigate('/pedidos')} variant="secondary" className="mt-4">
          Volver a Pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start space-y-5 overflow-y-auto pr-1">
      {/* HEADER SUPERIOR INTERNO */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-gray-800">{user?.nombre}</h2>
              <span className={`text-[8px] border px-1.5 py-0.5 rounded font-black uppercase tracking-wide ${badgeColor}`}>
                {roleName}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              {isAdmin ? 'Auditoría Financiera' : 'Planta de Mostrador'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/pedidos/${order.id}`)}
          className="p-1 text-gray-400 hover:text-gray-600 bg-gray-50 border rounded-lg transition-colors cursor-pointer"
          aria-label="Cerrar y volver al detalle"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col justify-start space-y-4 p-6 overflow-y-auto">
        <div>
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-gray-800">
              {isAdmin ? `Auditar Pedido #${order.id}` : `Editar Pedido #${order.id}`}
            </h3>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wide ${
              isAdmin ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isAdmin ? 'Acceso Total' : 'Modificación Manual'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-1">
            Titular de la orden: {order.cliente}
          </p>
        </div>

        {/* CAMPO 1: DESPLEGABLE ESTADOS */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
            {isAdmin ? 'Modificar Estado Logístico' : 'Forzar Estado del Pedido'}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white transition-all cursor-pointer ${focusBorderColor}`}
          >
            <option value="Ingresado">Pendiente (En espera de tanda)</option>
            <option value="En Proceso">En Proceso (Lavado/Secado)</option>
            <option value="Listo">Listo (Empaquetado para retirar)</option>
            <option value="Entregado">Entregado (Cierre físico de orden)</option>
            <option value="Cancelado">Cancelado (Anulación del servicio)</option>
          </select>
          {isOperator && (
            <p className="text-[9px] text-gray-400 font-medium italic pl-1">
              Nota: Forzar un estado insertará automáticamente una fila en HistorialEstados.
            </p>
          )}
        </div>

        {/* CAMPO 2: IMPORTE (Bloqueado para operador, libre para admin) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
            {isAdmin ? 'Corregir Importe del Pedido (monto_actual)' : 'Importe de la Orden (Solo Lectura)'}
          </label>
          {isAdmin ? (
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-black text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(parseFloat(e.target.value))}
                required
                className={`w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-xs font-black text-gray-800 focus:outline-none focus:bg-white transition-all ${focusBorderColor}`}
              />
            </div>
          ) : (
            <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-black text-gray-500 cursor-not-allowed">
              ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          )}
          {isAdmin && (
            <p className="text-[9px] text-gray-400 font-medium italic pl-1">
              Utilice este campo solo para rectificaciones de facturación o descuentos excepcionales.
            </p>
          )}
        </div>

        {/* ACCIÓN */}
        <div className="pt-4 shrink-0">
          <Button
            type="submit"
            variant={isAdmin ? 'primary' : 'primary'}
            className={isAdmin ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
          >
            {isAdmin ? 'Aplicar Auditoría e Impactar BD' : 'Aplicar Cambios Manuales'}
          </Button>
        </div>
      </form>
    </div>
  );
}
