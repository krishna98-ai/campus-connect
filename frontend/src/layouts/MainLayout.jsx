
import { Outlet } from "react-router-dom";

import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import RightPanel from "../components/common/RightPanel";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="flex gap-6 py-6">
          {/* Left Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>

          {/* Right Panel */}
          <aside className="hidden w-72 shrink-0 xl:block">
            <div className="sticky top-20">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
