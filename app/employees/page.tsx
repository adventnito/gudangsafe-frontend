'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Trash2, Plus, X, Pencil } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [token, setToken]       = useState('');
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [editForm, setEditForm] = useState({ id: '', name: '', email: '', role: 'employee', password: '' });

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    fetchUsers(t);
  }, []);

  async function fetchUsers(t: string) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    setSaving(true);
    setError('');
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers([...users, res.data.user]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'employee' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambah user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus user ini?')) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.filter(u => u.id !== id));
    } catch (err) { console.error(err); }
  }

  // FUNGSI EDIT - Buka modal edit
  function handleEdit(user: User) {
    setEditForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setShowEditModal(true);
  }

  // FUNGSI UPDATE - Simpan perubahan
  async function handleUpdate() {
    setSaving(true);
    setError('');
    try {
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role
      };
      
      // Kirim password hanya jika diisi
      if (editForm.password && editForm.password.trim() !== '') {
        updateData.password = editForm.password;
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${editForm.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update state users
      setUsers(users.map(u => 
        u.id === editForm.id 
          ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role }
          : u
      ));
      
      setShowEditModal(false);
      setEditForm({ id: '', name: '', email: '', role: 'employee', password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengupdate user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Karyawan</h1>
            <p className="text-sm text-gray-500">Kelola akun karyawan</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Tambah Karyawan
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
          ) : (
            /* ✅ PERBAIKAN: Bungkus tabel dengan overflow-x-auto untuk scroll horizontal di HP */
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '600px' }}>
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Nama</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{user.name}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {/* Tombol EDIT */}
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-400 hover:text-blue-600 p-1 mr-2"
                        >
                          <Pencil size={15} />
                        </button>
                        {/* Tombol DELETE */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">Tambah Karyawan Baru</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? 'Menyimpan...' : 'Tambah User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT KARYAWAN */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">Edit Karyawan</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password (kosongkan jika tidak diubah)"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}