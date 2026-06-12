'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Clock, User, Zap, Search, X } from 'lucide-react';

interface ActuatorLog {
  id: string;
  actuator_name: string;
  action: string;
  trigger_type: string;
  triggered_at: string;
}

export default function ActuatorLogsPage() {
  const router = useRouter();
  const [logs, setLogs]       = useState<ActuatorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState('');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    fetchLogs(t);
  }, []);

  async function fetchLogs(t: string, fromDate = '', toDate = '') {
    setLoading(true);
    try {
      const params: any = {};
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate)   params.to   = new Date(toDate + 'T23:59:59').toISOString();

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/actuator/logs`,
        {
          headers: { Authorization: `Bearer ${t}` },
          params,
        }
      );
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    fetchLogs(token, from, to);
  }

  function handleReset() {
    setFrom('');
    setTo('');
    fetchLogs(token);
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Actuator Logs</h1>
          <p className="text-sm text-gray-500">Riwayat kontrol kipas</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleFilter}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Search size={15} />
              Filter
            </button>
            {(from || to) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <X size={15} />
                Reset
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {logs.length} log ditemukan
            </span>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada log pada rentang tanggal ini</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Waktu</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Aktuator</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Aksi</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(log.triggered_at).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Zap size={14} className="text-yellow-500" />
                        {log.actuator_name === 'fan_1' ? 'Kipas Angin' : log.actuator_name}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.action === 'on'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <User size={14} className="text-gray-400" />
                        {log.trigger_type === 'manual' ? 'Manual' : 'Otomatis'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}