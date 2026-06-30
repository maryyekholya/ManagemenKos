import React, { useState, useEffect } from 'react';
import { useApp } from '../../App';
import { User, Role } from '../../types';
import { Button, FormInput, Modal } from '../../components/shared/UI';
import { Plus, Edit2, PowerOff, Shield, User as UserIcon, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminAkunProps {
  onNavigateToCreate?: () => void;
}

export const AdminAkun: React.FC<AdminAkunProps> = ({ onNavigateToCreate }) => {
  const { state, dispatch } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${state.currentUser?.token}`,
          'Accept': 'application/json'
        }
      });
      const json = await response.json();
      if (json.success) {
        setUsers(json.data);
      } else {
        // Fallback to global state
        setUsers(state.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // Fallback
      setUsers(state.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [state.users]); // Refresh if global state changes as a fallback

  const handleOpenModal = (user?: User) => {
    setError('');
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setPassword(''); // Don't fill password on edit
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setPhone('');
      setAddress('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!name || !email || (!editingUser && !password)) {
      setError('Nama, Email, dan Password wajib diisi untuk pengguna baru.');
      return;
    }

    const payload: any = { name, email, role, phone, address };
    if (password) payload.password = password;

    try {
      const url = editingUser 
        ? `http://127.0.0.1:8000/api/v1/admin/users/${editingUser.id}` 
        : 'http://127.0.0.1:8000/api/v1/admin/users';
        
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setError(json.message || 'Gagal menyimpan data pengguna.');
        return;
      }

      // Update global state
      if (editingUser) {
        dispatch({ type: 'UPDATE_USER', payload: { id: editingUser.id, data: json.data } });
      } else {
        dispatch({ type: 'ADD_USER', payload: json.data });
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    }
  };

  const handleToggleActive = async (user: User) => {
    if (user.id === state.currentUser?.id) {
      alert('Anda tidak dapat mengubah status akun Anda sendiri.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin mengubah status pengguna ${user.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/users/${user.id}/toggle-active`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${state.currentUser?.token}`,
          'Accept': 'application/json' 
        }
      });
      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: { id: user.id, data: { is_active: !user.is_active } } });
        fetchUsers();
        alert(data.message || 'Status akun berhasil diubah.');
      } else {
        alert(data.message || 'Gagal mengubah status akun.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan saat mengubah status.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="label-upper">Admin Control</div>
          <h1 className="text-3xl font-normal leading-tight">Manajemen Akun</h1>
        </div>
        <Button onClick={() => onNavigateToCreate ? onNavigateToCreate() : handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Nama & Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Memuat data pengguna...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Tidak ada pengguna ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? <Shield className="w-4 h-4 text-purple-500" /> : <UserIcon className="w-4 h-4 text-slate-400" />}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-widest",
                          user.role === 'admin' ? 'text-purple-600' : 'text-slate-600'
                        )}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest",
                        user.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {user.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(user)}
                          className={cn("p-2 rounded-lg transition-colors", user.is_active !== false ? "text-slate-400 hover:text-red-600 hover:bg-red-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50")}
                          title={user.is_active !== false ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
      >
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Nama Lengkap" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Masukkan nama pengguna" 
            />
            <FormInput 
              label="Email" 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="email@example.com" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role Pengguna</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="guest">Guest</option>
                <option value="user">User (Tenant)</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <FormInput 
              label={editingUser ? "Password Baru (Opsional)" : "Password"} 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Nomor Telepon" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="0812xxxxxx" 
            />
            <FormInput 
              label="Alamat" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Alamat pengguna" 
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
              {error}
            </p>
          )}

          <div className="pt-4 flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button className="flex-1" onClick={handleSubmit}>Simpan Data</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
