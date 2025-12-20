import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-[#0b0f1a]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#020617] border-r border-gray-800 p-6">
        <h1 className="text-xl font-bold text-indigo-400 mb-8">
          RTLVision
        </h1>

        <nav className="space-y-4 text-gray-300">
          <NavItem label="Dashboard" />
          <NavItem label="Projects" />
          <NavItem label="Jobs" />
          <NavItem label="Lint Reports" />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ label }) {
  return (
    <div className="cursor-pointer hover:text-white transition">
      {label}
    </div>
  );
}
