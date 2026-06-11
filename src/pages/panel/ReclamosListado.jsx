import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, BASE_URL } from '../../services/api';
import ClaimCard from '../../components/client/ClaimCard';
import Button from '../../components/ui/Button';

export default function ReclamosListado() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [claimsList, setClaimsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros para staff
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchClaims = () => {
    if (!user) return;
    setLoading(true);
    api.getReclamos(user.rol, user.nombre)
      .then((data) => {
        setClaimsList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

    useEffect(() => {
    fetchClaims();

    const token = localStorage.getItem('lavapro_token');
    if (!token) return;

    let ws;
    try {
      // Evitamos errores si BASE_URL es undefined usando fallbacks y try/catch
      const apiHost = (BASE_URL || window.location.host).replace(/^https?:\/\//, '');
      const wsProto = (BASE_URL || '').startsWith('https') ? 'wss' : 'ws';
      ws = new WebSocket(`${wsProto}://${apiHost}/reclamos/notificaciones/ws?token=${token}`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'unread_update') {
            setClaimsList((prevList) =>
              prevList.map((claim) =>
                claim.id === data.claim_id
                  ? { ...claim, unread_count: data.unread_count }
                  : claim
              )
            );
          }
        } catch (err) {
          console.error('Error al procesar notificación de WebSocket:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket de notificaciones cerrado.');
      };
    } catch (err) {
      console.error('No se pudo establecer la conexión de WebSocket de notificaciones:', err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user]);

  if (!user) return null;

  const isClient = user.rol === 'cliente';
  const isAdmin = user.rol === 'administrador';

  // Lógica de filtrado de reclamos para staff
  const filteredClaims = claimsList.filter((claim) => {
    const matchesSearch = searchQuery === '' || 
      (claim.cliente && claim.cliente.toLowerCase().includes(searchQuery.toLowerCase())) ||
      claim.id.includes(searchQuery);

    const matchesStatus = statusFilter === '' || 
      claim.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Ordenar: primero los reclamos con mensajes no leídos, luego por ID descendente (cronológico)
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    const aUnread = (a.unread_count || 0) > 0 ? 1 : 0;
    const bUnread = (b.unread_count || 0) > 0 ? 1 : 0;
    if (aUnread !== bUnread) {
      return bUnread - aUnread;
    }
    return parseInt(b.id) - parseInt(a.id);
  });

  const focusBorderColor = isAdmin ? 'focus:border-purple-500 border-l-purple-500' : 'focus:border-amber-500 border-l-amber-500';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando incidencias...</p>
      </div>
    );
  }

  if (isClient) {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
        <div className="flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Centro de Soporte
          </span>
          <button
            onClick={() => navigate('/reclamos/nuevo')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={12} strokeWidth={3} />
            Nuevo Reclamo
          </button>
        </div>

        <div className="space-y-3.5 pt-1">
          {sortedClaims.length > 0 ? (
            sortedClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))
          ) : (
            <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 border rounded-xl">
              No tienes reclamos abiertos.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista de Planta (Operador/Admin)
  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      {/* Encabezado */}
      <div className="shrink-0">
        <h3 className="text-base font-black text-gray-800">
          Bandeja de Incidencias
        </h3>
        <p className="text-[11px] text-gray-400 font-medium">
          Audite, supervise y gestione las resoluciones de soporte del negocio.
        </p>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 shrink-0">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider pl-0.5">
          Filtrar incidencias
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por cliente o ID..."
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
            <option value="En Revisión">En Revisión</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        </div>
      </div>

      {/* Listado de incidencias */}
      <div className="space-y-3.5 pt-1 flex-1">
        {sortedClaims.length > 0 ? (
          sortedClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))
        ) : (
          <div className="text-center py-8 text-xs text-gray-400">
            No hay incidencias registradas con esos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
