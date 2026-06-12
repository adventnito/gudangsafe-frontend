'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { io } from 'socket.io-client';
import DashboardLayout from '@/components/DashboardLayout';
import { Thermometer, Droplets, ShieldCheck, Fan } from 'lucide-react';

interface SensorData {
  temperature: number;
  humidity: number;
  status: string;
  created_at: string;
}

interface ActuatorStatus {
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]         = useState<any>(null);
  const [sensor, setSensor]     = useState<SensorData | null>(null);
  const [actuator, setActuator] = useState<ActuatorStatus>({ status: 'off' });
  const [loading, setLoading]   = useState(false);
  const [token, setToken]       = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (!savedToken) { router.push('/login'); return; }

    setToken(savedToken);
    setUser(savedUser ? JSON.parse(savedUser) : null);
    fetchLatestSensor(savedToken);
    fetchActuatorStatus(savedToken);

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    socket.on('sensor:update',   (data: SensorData)      => setSensor(data));
    socket.on('actuator:update', (data: ActuatorStatus)  => setActuator(data));
    return () => { socket.disconnect(); };
  }, []);

  async function fetchLatestSensor(t: string) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/sensor/latest`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setSensor(res.data);
    } catch (err) { console.error(err); }
  }

  async function fetchActuatorStatus(t: string) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/actuator/status`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setActuator(res.data);
    } catch (err) { console.error(err); }
  }

  async function toggleKipas() {
    setLoading(true);
    const action = actuator.status === 'on' ? 'off' : 'on';
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/actuator/control`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActuator({ status: action });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function getStatusColor(status: string) {
    if (status === 'aman')    return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'waspada') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'kritis')  return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500">Monitoring realtime kondisi gudang</p>
          </div>
          <div className="text-sm text-gray-500">
            Halo, <span className="font-medium text-gray-700">{user?.name}</span>
          </div>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Suhu */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Suhu</span>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Thermometer size={16} className="text-orange-500" />
              </div>
            </div>
            <div className="text-4xl font-bold text-orange-500">
              {sensor ? `${sensor.temperature}°C` : '--'}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {sensor?.created_at
                ? `Update: ${new Date(sensor.created_at).toLocaleTimeString('id-ID')}`
                : 'Menunggu data...'}
            </div>
          </div>

          {/* Kelembaban */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Kelembaban</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Droplets size={16} className="text-blue-500" />
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-500">
              {sensor ? `${sensor.humidity}%` : '--'}
            </div>
            <div className="text-xs text-gray-400 mt-2">Relative Humidity</div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Status Gudang</span>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheck size={16} className="text-green-500" />
              </div>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(sensor?.status || '')}`}>
              {sensor?.status?.toUpperCase() || 'OFFLINE'}
            </div>
            <div className="text-xs text-gray-400 mt-3">Berdasarkan threshold aktif</div>
          </div>

        </div>

        {/* Kontrol Kipas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <Fan size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Kontrol Kipas</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Status Kipas</div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${actuator.status === 'on' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={`text-lg font-bold ${actuator.status === 'on' ? 'text-green-600' : 'text-gray-400'}`}>
                  {actuator.status === 'on' ? 'MENYALA' : 'MATI'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleKipas}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-medium transition-colors text-sm ${
                actuator.status === 'on'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50`}
            >
              {loading ? 'Memproses...' : actuator.status === 'on' ? 'Matikan Kipas' : 'Nyalakan Kipas'}
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}