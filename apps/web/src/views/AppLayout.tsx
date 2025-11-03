import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';

export default function AppLayout() {
  return (
    <div className="h-full grid md:grid-cols-[16rem_1fr] p-2 md:p-4">
      <Sidebar />
      <div className="flex flex-col min-h-0 rounded-2xl glass">
        <Header />
        <main className="flex-1 min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


