import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import OrderCard from '../../components/client/OrderCard';
import Button from '../../components/ui/Button';

export default function Pedidos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtro para staff
  const [searchQuery, setSearchQuery] = useState(location.state?.searchName || '');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (location.state && location.state.searchName !== undefined) {
      setSearchQuery(location.state.searchName);
    } else {
      setSearchQuery('');
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    setLoading(true);
    
    api.getPedidos(user.rol, user.nombre)
      .then((data) => {
        if (isMounted) {
          setPedidos(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) return null;

  const isClient = user.rol === 'cliente';
  const isAdmin = user.rol === 'administrador';

  // Separar pedidos para cliente
  const clientActiveOrders = pedidos.filter(
    (order) => order.status !== 'Entregado'
  );
  const clientHistoricalOrders = pedidos.filter(
    (order) => order.status === 'Entregado'
  );

  // Filtrado de pedidos para staff
  const filteredStaffOrders = pedidos.filter((order) => {
    const matchesSearch = searchQuery === '' || 
      order.id.includes(searchQuery) || 
      (order.cliente && order.cliente.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === '' || 
      order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = () => {
    navigate('/pedidos/nuevo');
  };

  const focusBorderColor = isAdmin ? 'focus:border-purple-500 border-l-purple-500' : 'focus:border-amber-500 border-l-amber-500';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando cola de pedidos...</p>
      </div>
    );
  }

  if (isClient) {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-5 overflow-y-auto pr-1">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Mis Pedidos
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
            Activos
          </h3>
          {clientActiveOrders.length > 0 ? (
            clientActiveOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 border rounded-xl">
              No tienes pedidos activos.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
            Historial
          </h3>
          {clientHistoricalOrders.length > 0 ? (
            clientHistoricalOrders.map((order) => (
              <OrderCard key={order.id} order={order} isHistory />
            ))
          ) : (
            <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 border rounded-xl">
              Aún no tienes pedidos entregados en tu historial.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista de Operador e Admin (Cola General de Planta)
  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      {/* Botón Crear Pedido */}
      <div className="shrink-0">
        <Button onClick={handleCreateOrder} variant="primary">
          <Plus size={16} strokeWidth={3} />
          Crear Nuevo Pedido
        </Button>
      </div>

      {/* Caja de Filtros */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 shrink-0">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider pl-0.5">
          Filtrar Pedidos
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cliente o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-white border border-gray-200 rounded-lg pl-8 pr-2 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none transition-all border-l-4 ${focusBorderColor}`}
            />
            <Search className="absolute left-2.5 top-3 text-gray-400" size={12} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold text-gray-600 focus:outline-none transition-all ${focusBorderColor}`}
          >
            <option value="">Todos los estados</option>
            <option value="Ingresado">Pendiente / Ingresado</option>
            <option value="En proceso">En Proceso</option>
            <option value="Listo">Listo</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>
      </div>

      {/* Listado de Pedidos */}
      <div className="space-y-3 flex-1">
        {filteredStaffOrders.length > 0 ? (
          filteredStaffOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-8 text-xs text-gray-400">
            No se encontraron pedidos con los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}
