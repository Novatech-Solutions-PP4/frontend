import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    if (user && (user.rol === 'operador' || user.rol === 'administrador')) {
      api.getInsumos()
        .then(data => {
          const count = data.filter(ins => ins.cantidad < ins.alerta).length;
          setCriticalCount(count);
        })
        .catch(err => console.error('Error fetching insumos for sidebar badge:', err));
    }
  }, [user, location.pathname]);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  if (!user) return null;

  const getNavItems = () => {
    const dashboardIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
    );

    const pedidosIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
    );

    const insumosIcon = (
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        {criticalCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm animate-bounce">
            {criticalCount}
          </span>
        )}
      </div>
    );

    if (user.rol === 'cliente') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: dashboardIcon },
        { name: 'Pedidos', path: '/pedidos', icon: pedidosIcon },
        { name: 'Reclamos', path: '/reclamos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg> },
        { name: 'Perfil', path: '/perfil', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }
      ];
    } else if (user.rol === 'operador') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: dashboardIcon },
        { name: 'Pedidos', path: '/pedidos', icon: pedidosIcon },
        { name: 'Clientes', path: '/clientes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
        { name: 'Insumos', path: '/insumos', icon: insumosIcon }
      ];
    } else if (user.rol === 'administrador') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: dashboardIcon },
        { name: 'Pedidos', path: '/pedidos', icon: pedidosIcon },
        { name: 'Usuarios', path: '/usuarios', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
        { name: 'Insumos', path: '/insumos', icon: insumosIcon }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full shrink-0">
      {/* Cabecera de barra lateral */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-center shrink-0">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          LavaPro
        </h1>
      </div>

      {/* Links de navegacion */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                active
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-blue-500 font-medium'
              }`}
            >
              <div className={active ? 'text-blue-600' : 'text-gray-400'}>
                {item.icon}
              </div>
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Pie de pagina */}
      <div className="p-4 border-t border-gray-100 text-center shrink-0">
         <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
          LavaPro App v1.0
        </p>
      </div>
    </div>
  );
}
