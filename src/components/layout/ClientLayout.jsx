import { Outlet, useLocation } from 'react-router-dom';
import MobileContainer from './MobileContainer';
import AppHeader from './AppHeader';
import BottomNavbar from './BottomNavbar';

export default function ClientLayout() {
  const location = useLocation();

  const isChatPage = location.pathname.match(/\/reclamos\/\w+/) && 
                     !location.pathname.endsWith('/nuevo') && 
                     location.pathname !== '/reclamos';
                     
  const isNewClaimPage = location.pathname === '/reclamos/nuevo';
  const isEditProfilePage = location.pathname === '/perfil/editar' || location.pathname === '/perfil/password';
  const isEditOrderPage = location.pathname.match(/\/pedidos\/\w+\/editar/);
  
  const hideDefaultHeader = isChatPage || isNewClaimPage || isEditProfilePage || isEditOrderPage;
  
  const hideNavbar = isChatPage || isEditProfilePage;

  return (
    <MobileContainer 
      padding={(isChatPage || isEditOrderPage) ? "p-0" : "p-6"} 
      className={(isChatPage || isEditOrderPage) ? "overflow-hidden" : ""}
    >
      <div className="flex-1 flex flex-col justify-between h-full relative">
        {/* Cabecera adaptativa */}
        {!hideDefaultHeader && <AppHeader />}

        {/* Contenido dinámico */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet />
        </div>

        {/* Navbar inferior */}
        {!hideNavbar && <div className="h-16 shrink-0"></div>} {/* Espaciador para no tapar contenido */}
        {!hideNavbar && <BottomNavbar />}
      </div>
    </MobileContainer>
  );
}
