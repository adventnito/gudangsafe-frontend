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
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

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

  // Konten Sidebar (sama untuk desktop dan mobile)
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Thermometer size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm">GudangSafe</div>
            <div className="text-xs text-gray-400">Toko Bumi Jaya</div>
          </div>
        </div>
        {/* Tombol close untuk mobile */}
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="text-sm font-medium text-gray-700 truncate">{name || 'Loading...'}</div>
        <div className={`text-xs mt-0.5 ${role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`}>
          {role || '...'}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
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
    </>
  );

  return (
    <>
      {/* Tombol Menu untuk Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        >
          <Menu size={22} className="text-gray-600" />
        </button>
      )}

      {/* Overlay gelap saat sidebar terbuka (mobile) */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop - selalu terlihat */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r z-30 flex flex-col overflow-y-auto">
          <SidebarContent />
        </aside>
      )}

      {/* Sidebar Mobile - slide dari kiri */}
      {isMobile && (
        <aside
          className={`fixed top-0 left-0 w-64 h-full bg-white border-r z-50 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col overflow-y-auto">
            <SidebarContent />
          </div>
        </aside>
      )}
    </>
  );
}