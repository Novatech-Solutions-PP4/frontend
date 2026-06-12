import { Outlet, useLocation } from 'react-router-dom';
import MobileContainer from './MobileContainer';
import AppHeader from './AppHeader';
import BottomNavbar from './BottomNavbar';
import Sidebar from './Sidebar';

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
      padding={(isChatPage || isEditOrderPage) ? "p-0" : "p-6 md:p-0"} 
      className={`md:flex md:flex-row ${(isChatPage || isEditOrderPage) ? "overflow-hidden" : ""}`}
    >
      {/* Sidebar en desktop */}
      <Sidebar />

      <div className="flex-1 flex flex-col justify-between h-full relative md:bg-gray-50/30 w-full overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 md:p-8 overflow-hidden">
          {/* Cabecera adaptativa */}
          {!hideDefaultHeader && <AppHeader />}

          {/* Contenido dinámico */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Outlet />
          </div>
        </div>

        {/* Navbar inferior */}
        {!hideNavbar && <div className="h-16 shrink-0 md:hidden"></div>}
        {!hideNavbar && <BottomNavbar />}
      </div>
    </MobileContainer>
  );
}
