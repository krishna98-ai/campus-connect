import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import RightPanel from '../components/common/RightPanel';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-16">
        <div className="flex gap-6 py-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

          {/* Right Panel */}
          <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-20">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
