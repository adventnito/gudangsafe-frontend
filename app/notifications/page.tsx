'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Bell, Trash2, Check } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [token, setToken]   = useState('');
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    fetchNotifs(t);
  }, []);

  async function fetchNotifs(t: string) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setNotifs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  }

  async function deleteNotif(id: string) {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifs(notifs.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  }

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
            <p className="text-sm text-gray-500">Riwayat peringatan sistem</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {unreadCount} belum dibaca
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border divide-y">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
          ) : notifs.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-start gap-3 transition-colors ${
                  !notif.is_read ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Indikator belum dibaca */}
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  !notif.is_read ? 'bg-blue-500' : 'bg-gray-200'
                }`} />

                {/* Konten */}
                <div className="flex-1 min-w-0">
                  {notif.title && (
                    <p className="text-sm font-medium text-gray-800 mb-0.5">
                      {notif.title}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleString('id-ID')}
                    </p>
                    {notif.type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notif.type === 'warning'  ? 'bg-yellow-100 text-yellow-700' :
                        notif.type === 'critical' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {notif.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Aksi */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      title="Tandai sudah dibaca"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    title="Hapus notifikasi"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 