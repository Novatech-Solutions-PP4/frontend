import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Tag, AlertTriangle, Settings, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import QrScannerModal from '../ui/QrScannerModal';

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [openClaimsCount, setOpenClaimsCount] = useState(0);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleQRScanSuccess = async (code) => {
    try {
      // 1. Check if it's a client QR or DNI
      const users = await api.getUsuarios();
      const client = users.find(
        (u) => u.rol === 'cliente' && (u.codigo_qr === code || u.DNI === code)
      );

      if (client) {
        addToast(`Cliente detectado: ${client.nombre}. Redirigiendo a nuevo pedido...`, 'success');
        navigate('/pedidos/nuevo', { state: { selectedClient: client } });
        return;
      }

      // 2. Check if it's an order ID
      let matchedOrderId = null;
      const pedMatch = code.match(/LAVAPRO-PED-(\d+)/i) || 
                       code.match(/pedido_(\d+)/i) || 
                       code.match(/data=pedido_(\d+)/i) ||
                       code.match(/data=LAVAPRO-PED-(\d+)/i);

      if (pedMatch) {
        matchedOrderId = pedMatch[1];
      } else if (!isNaN(parseInt(code)) && /^\d+$/.test(code.trim())) {
        matchedOrderId = code.trim();
      }

      const orders = await api.getPedidos(user.rol, user.nombre);
      const order = orders.find((o) => o.id.toString() === matchedOrderId);

      if (order) {
        let nextStatus = '';
        if (order.status === 'Ingresado') nextStatus = 'En proceso';
        else if (order.status === 'En proceso') nextStatus = 'Listo';
        else if (order.status === 'Listo') nextStatus = 'Entregado';

        if (!nextStatus) {
          addToast(`El pedido #${order.id} ya se encuentra ${order.status}.`, 'warning');
          return;
        }

        const confirmed = await confirm({
          title: `Pedido #${order.id} detectado`,
          message: `Cliente: ${order.cliente}\n\n¿Desea avanzar su estado a "${nextStatus}"?`,
          type: 'info',
          confirmLabel: 'Avanzar Estado',
          cancelLabel: 'Cancelar'
        });

        if (confirmed) {
          await api.updatePedido(order.id, { status: nextStatus });
          addToast(`Pedido #${order.id} actualizado a "${nextStatus}" con éxito.`, 'success');
          if (location.pathname === `/pedidos/${order.id}`) {
            window.location.reload();
          } else {
            navigate(`/pedidos/${order.id}`);
          }
        }
        return;
      }

      // 3. Fallback
      addToast(`El código leído no coincide con ningún cliente o pedido: "${code}"`, 'warning');
    } catch (err) {
      console.error('Error handling QR scan in AppHeader:', err);
      addToast('Error al procesar el código escaneado.', 'warning');
    }
  };

  useEffect(() => {
    if (user && (user.rol === 'operador' || user.rol === 'administrador')) {
      api.getReclamos(user.rol, user.nombre)
        .then((data) => {
          const count = data.filter(c => c.status.toLowerCase() !== 'resuelto').length;
          setOpenClaimsCount(count);
        })
        .catch(err => console.error('Error fetching claims for header badge:', err));
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/perfil');
  };

  if (!user) return null;

  const isClient = user.rol === 'cliente';

  if (isClient) {
    return (
      <div className="flex justify-between items-center border-b pb-3 mb-4 shrink-0">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            LavaPro App
          </p>
          <h2 className="text-md font-bold text-gray-800">
            {user.nombre}
          </h2>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  const isAdmin = user.rol === 'administrador';
  const roleName = isAdmin ? 'Admin' : 'Operador';
  const badgeColor = isAdmin 
    ? 'bg-purple-50 text-purple-600 border-purple-100' 
    : 'bg-amber-50 text-amber-700 border-amber-100';
  
  const roleSubtitle = isAdmin ? 'Administrador General' : 'Operador de Planta';

  return (
    <div className="flex justify-between items-center border-b pb-3 mb-4 shrink-0">
      {/* Identidad de usuario clickeable */}
      <button
        onClick={handleProfileClick}
        className="flex items-center gap-2 text-left hover:bg-gray-50 py-1 px-2 rounded-xl transition-all active:scale-[0.98] group cursor-pointer"
        title="Configuración de mi cuenta"
      >
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-black text-gray-800">{user.nombre}</h2>
            <span className={`text-[8px] border px-1.5 py-0.5 rounded font-black uppercase tracking-wide ${badgeColor}`}>
              {roleName}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1 group-hover:text-gray-600 transition-colors">
            {roleSubtitle}
            <Settings size={10} strokeWidth={2.5} className="group-hover:rotate-45 transition-transform" />
          </p>
        </div>
      </button>

      {/* Herramientas globales */}
      <div className="flex items-center gap-0.5">
        {/* Lector QR Global */}
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
          title="Escanear Código QR (Pedido o Cliente)"
        >
          <QrCode size={18} strokeWidth={2.5} />
        </button>

        {/* Acceso Global a Servicios */}
        <button
          onClick={() => navigate('/servicios')}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
          title="Módulo de Servicios"
        >
          <Tag size={18} strokeWidth={2.5} />
        </button>

        {/* Acceso Global a Reclamos */}
        <button
          onClick={() => navigate('/reclamos')}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all relative cursor-pointer"
          title="Centro de Reclamos"
        >
          <AlertTriangle size={18} strokeWidth={2.5} />
          {openClaimsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
              {openClaimsCount}
            </span>
          )}
        </button>

        <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

        {/* Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut size={18} strokeWidth={2.5} />
        </button>
      </div>
      <QrScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        title="Escáner QR LavaPro"
      />
    </div>
  );
}
