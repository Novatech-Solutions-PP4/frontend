import { Outlet } from 'react-router-dom';
import MobileContainer from './MobileContainer';

export default function AuthLayout() {
  return (
    <MobileContainer className="transition-all duration-300 md:items-center md:justify-center md:bg-gray-50 md:p-0">
      <div className="w-full h-full flex flex-col md:h-auto md:max-w-md md:bg-white md:shadow-2xl md:rounded-3xl md:p-10 md:border md:border-gray-100">
        <Outlet />
      </div>
    </MobileContainer>
  );
}
