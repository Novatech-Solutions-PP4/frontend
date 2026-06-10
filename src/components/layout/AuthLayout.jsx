import { Outlet } from 'react-router-dom';
import MobileContainer from './MobileContainer';

export default function AuthLayout() {
  return (
    <MobileContainer className="transition-all duration-300">
      <Outlet />
    </MobileContainer>
  );
}
