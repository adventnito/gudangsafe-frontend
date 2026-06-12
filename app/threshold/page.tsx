'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings } from 'lucide-react';

export default function ThresholdPage() {
  const router = useRouter();
  const [token, setToken]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');
  const [form, setForm] = useState({
    temp_min: '',
    temp_max: '',
    humidity_min: '',
    humidity_max: '',
  });

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    fetchThreshold(t);
  }, []);

  async function fetchThreshold(t: string) {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/threshold`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      if (res.data) {
        setForm({
          temp_min:     res.data.temp_min     ?? '',
          temp_max:     res.data.temp_max     ?? '',
          humidity_min: res.data.humidity_min ?? '',
          humidity_max: res.data.humidity_max ?? '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/threshold`,
            {
                temp_min:     Number(form.temp_min),
                temp_max:     Number(form.temp_max),
                humidity_min: Number(form.humidity_min),
                humidity_max: Number(form.humidity_max),
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Threshold berhasil disimpan!');
        // Refresh data threshold setelah save
        await fetchThreshold(token);
    } catch (err) {
        setError('Gagal menyimpan threshold.');
    } finally {
        setSaving(false);
    }
}

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Threshold Setting</h1>
          <p className="text-sm text-gray-500">Atur batas aman suhu dan kelembaban gudang</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Batas Suhu & Kelembaban</h3>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 text-sm py-4">Memuat data...</div>
          ) : (
            <div className="space-y-4">
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suhu Minimum (°C)
                  </label>
                  <input
                    type="number"
                    value={form.temp_min}
                    onChange={(e) => setForm({ ...form, temp_min: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contoh: 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suhu Maximum (°C)
                  </label>
                  <input
                    type="number"
                    value={form.temp_max}
                    onChange={(e) => setForm({ ...form, temp_max: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contoh: 35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelembaban Minimum (%)
                  </label>
                  <input
                    type="number"
                    value={form.humidity_min}
                    onChange={(e) => setForm({ ...form, humidity_min: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contoh: 40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelembaban Maximum (%)
                  </label>
                  <input
                    type="number"
                    value={form.humidity_max}
                    onChange={(e) => setForm({ ...form, humidity_max: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contoh: 80"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2"
              >
                {saving ? 'Menyimpan...' : 'Simpan Threshold'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}