import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function AppShell() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-mist">
      <Outlet />
      <BottomNav />
    </div>
  );
}
