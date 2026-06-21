import { useState } from 'react';
import { LayoutDashboard, Building2, DollarSign, BarChart3, LogOut, UserCheck, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const baseNav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/properties', label: 'Properties', icon: Building2 },
  { path: '/rent-tracker', label: 'Rent Tracker', icon: DollarSign },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
        <Building2 size={18} className="text-white" />
      </div>
      <div>
        <p className="text-white font-semibold text-sm leading-tight">RentTrack</p>
        <p className="text-slate-500 text-xs">Property Manager</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { logout, isOwner } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = isOwner
    ? [...baseNav, { path: '/approvals', label: 'Approvals', icon: UserCheck }]
    : baseNav;

  const NavLinks = ({ onNavigate }) => (
    <nav className="flex-1 p-4 space-y-1">
      {nav.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            location.pathname === path
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Icon size={17} />
          {label}
        </Link>
      ))}
    </nav>
  );

  const Footer = ({ onNavigate }) => (
    <div className="p-4 border-t border-slate-800 space-y-3">
      <button
        onClick={() => { onNavigate?.(); logout(); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
      >
        <LogOut size={17} />
        Logout
      </button>
      <p className="text-slate-600 text-xs text-center">© 2026 RentTrack</p>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3">
        <Brand />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-slate-300 p-2 hover:text-white cursor-pointer"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-64 max-w-[80%] h-full bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <Footer onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex-col">
        <div className="p-6 border-b border-slate-800">
          <Brand />
        </div>
        <NavLinks />
        <Footer />
      </aside>
    </>
  );
}
