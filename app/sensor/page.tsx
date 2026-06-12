'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Thermometer, Droplets, Clock, Search, X } from 'lucide-react';

interface SensorData {
  id: string;
  temperature: number;
  humidity: number;
  status: string;
  created_at: string;
}

export default function SensorHistoryPage() {
  const router = useRouter();
  const [data, setData]       = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState('');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    fetchSensor(t);
  }, []);

  async function fetchSensor(t: string, fromDate = '', toDate = '') {
    setLoading(true);
    try {
      const params: any = {};
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate)   params.to   = new Date(toDate + 'T23:59:59').toISOString();

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/sensor`,
        {
          headers: { Authorization: `Bearer ${t}` },
          params,
        }
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    fetchSensor(token, from, to);
  }

  function handleReset() {
    setFrom('');
    setTo('');
    fetchSensor(token);
  }

  function getStatusStyle(status: string) {
    if (status === 'aman')    return 'bg-green-100 text-green-700';
    if (status === 'waspada') return 'bg-yellow-100 text-yellow-700';
    if (status === 'kritis')  return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sensor History</h1>
          <p className="text-sm text-gray-500">Riwayat pembacaan suhu dan kelembaban</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Search size={15} />
                Filter
              </button>
              {(from || to) && (
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <X size={15} />
                  Reset
                </button>
              )}
            </div>
            <div className="sm:ml-auto">
              <span className="text-xs text-gray-400">
                {data.length} data ditemukan
              </span>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-sm border">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data pada rentang tanggal ini</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '650px' }}>
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Waktu</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Suhu</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Kelembaban</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm">{new Date(row.created_at).toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-orange-500 font-medium">
                          <Thermometer size={14} className="shrink-0" />
                          {row.temperature}°C
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                          <Droplets size={14} className="shrink-0" />
                          {row.humidity}%
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(row.status)}`}>
                          {row.status?.toUpperCase() || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}