import { Outlet, Link } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-[#0b0f1a]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#020617] border-r border-gray-800 p-6">
        <h1 className="text-xl font-bold text-indigo-400 mb-10">
          RTLVision
        </h1>

        <nav className="space-y-4 text-gray-400">
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/projects" label="Projects" />
          <NavLink to="/jobs" label="RTL Jobs" />
          <NavLink to="/lint" label="Lint Reports" />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block hover:text-white transition"
    >
      {label}
    </Link>
  );
}
