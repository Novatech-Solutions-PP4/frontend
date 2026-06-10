import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../ui/StatusBadge';

export default function ClaimCard({ claim }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAction = () => {
    navigate(`/reclamos/${claim.id}`);
  };

  const isClient = user?.rol === 'cliente';
  const isAdmin = user?.rol === 'administrador';
  const isResuelto = claim.status.toLowerCase() === 'resuelto';

  const hoverColorClass = isAdmin 
    ? 'hover:border-purple-300' 
    : 'hover:border-blue-300';

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 transition-all ${hoverColorClass} ${isResuelto ? 'opacity-70 hover:opacity-100' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
            Reclamo #{claim.id}
          </span>
          <h4 className="font-black text-gray-800 text-sm mt-1.5">
            Pedido Asociado: #{claim.pedidoId}
          </h4>
          {!isClient && claim.cliente && (
            <p className="text-[11px] font-bold text-gray-500 mt-0.5">
              Cliente: {claim.cliente}
            </p>
          )}
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <div className="text-xs bg-gray-50 p-2.5 rounded-lg flex justify-between items-center">
        <div>
          <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">
            Categoría
          </p>
          <p className="font-bold text-gray-700">{claim.categoria}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            {isResuelto ? 'Cerrado: ' : 'Creado: '} {claim.fecha}
          </p>
        </div>
        <button
          onClick={handleAction}
          className={`p-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer relative ${
            isResuelto
              ? 'text-gray-400 hover:text-gray-600'
              : isAdmin 
                ? 'text-purple-600 hover:text-purple-800' 
                : 'text-blue-600 hover:text-blue-800'
          }`}
          aria-label={`Ver mensajes del Reclamo #${claim.id}`}
        >
          <div className="relative">
            <MessageSquare size={16} strokeWidth={2.5} />
            {claim.unread_count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border border-white shadow-sm animate-pulse" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
