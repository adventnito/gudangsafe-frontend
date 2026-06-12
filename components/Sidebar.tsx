'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Thermometer,
  Zap,
  Settings,
  Bell,
  User,
  Users,
  LogOut,
} from 'lucide-react';

const allMenus = [
  { href: '/dashboard',     label: 'Dashboard',          icon: LayoutDashboard, roles: ['admin', 'employee'] },
  { href: '/sensor',        label: 'Sensor History',     icon: Thermometer,     roles: ['admin', 'employee'] },
  { href: '/actuator',      label: 'Actuator Logs',      icon: Zap,             roles: ['admin', 'employee'] },
  { href: '/threshold',     label: 'Threshold',          icon: Settings,        roles: ['admin'] },
  { href: '/notifications', label: 'Notifikasi',         icon: Bell,            roles: ['admin', 'employee'] },
  { href: '/profile',       label: 'Profile',            icon: User,            roles: ['admin', 'employee'] },
  { href: '/employees',     label: 'Manajemen Karyawan', icon: Users,           roles: ['admin'] },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [role, setRole]   = useState('');
  const [name, setName]   = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      setRole(parsed.role);
      setName(parsed.name);
    }
  }, []);

  const menus = allMenus.filter(m => m.roles.includes(role));

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Thermometer size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm">GudangSafe</div>
            <div className="text-xs text-gray-400">Toko Bumi Jaya</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="text-sm font-medium text-gray-700">{name}</div>
        <div className={`text-xs mt-0.5 ${role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`}>
          {role}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                pathname === menu.href
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={17} />
              <span>{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}