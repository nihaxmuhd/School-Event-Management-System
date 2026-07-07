import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  X, 
  Trash2, 
  Edit3, 
  Shield
} from 'lucide-react';
import { SystemUser, UserRole } from '../../types/festival';

interface UsersViewProps {
  users: SystemUser[];
  onAddUser: (newUser: Omit<SystemUser, 'id'> & { password?: string; username?: string }) => Promise<boolean | void>;
  onUpdateUser: (user: SystemUser & { password?: string; username?: string }) => Promise<boolean | void>;
  onDeleteUser: (userId: string) => Promise<boolean | void>;
  onActivateUser: (userId: string) => Promise<boolean | void>;
  onDeactivateUser: (userId: string) => Promise<boolean | void>;
  onResetPassword: (userId: string, password: string) => Promise<boolean | void>;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

const ROLES: UserRole[] = ['Admin', 'Manager', 'Team Leader'];

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onActivateUser,
  onDeactivateUser,
  onResetPassword,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Manager');
  const [department, setDepartment] = useState('English Department');
  const [password, setPassword] = useState('');

  const handleOpenNewModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setRole('Manager');
    setDepartment('English Department');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: SystemUser) => {
    setEditingUser(u);
    setName(u.name);
    setUsername('');
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department);
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onShowToast('Required Fields Missing', 'Please enter staff name and email', 'error');
      return;
    }
    if (!editingUser && !password.trim()) {
      onShowToast('Required Fields Missing', 'Please enter a password for the new user', 'error');
      return;
    }

    if (editingUser) {
      const updated: SystemUser & { password?: string; username?: string } = {
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        password: password.trim() || undefined,
        username: username.trim() || undefined
      };
      const ok = await onUpdateUser(updated);
      if (ok !== false) onShowToast('User Updated', `${updated.name}'s account updated.`);
    } else {
      const ok = await onAddUser({
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        status: 'Active',
        password: password.trim(),
        username: username.trim() || undefined
      });
      if (ok !== false) onShowToast('Staff User Added', `${name} granted ${role} access.`);
    }

    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesQuery = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" /> Internal Staff User Access
          </h3>
          <p className="text-xs text-slate-500">
            {users.length} Staff accounts registered in Hidaya SEMS System
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Staff User</span>
        </button>
      </div>

      {/* Filter Options Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRoleFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Roles
          </button>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRoleFilter === r ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No staff users match your search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{u.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          u.role === 'Admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          u.role === 'Manager' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {u.department}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={async () => {
                              const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
                              const ok = nextStatus === 'Active'
                                ? await onActivateUser(u.id)
                                : await onDeactivateUser(u.id);
                              if (ok !== false) {
                                onShowToast(
                                  nextStatus === 'Active' ? 'Account Activated' : 'Account Deactivated',
                                  `${u.name}'s account was ${nextStatus.toLowerCase()}.`
                                );
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={async () => {
                              const newPassword = prompt(`Reset password for ${u.name}`);
                              if (!newPassword) return;
                              const ok = await onResetPassword(u.id, newPassword);
                              if (ok !== false) onShowToast('Password Reset', `Password reset for ${u.name}.`);
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            Reset Password
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Staff Account"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`Remove staff user account for ${u.name}?`)) {
                                const ok = await onDeleteUser(u.id);
                                if (ok !== false) onShowToast('Account Deleted', `${u.name}'s account was removed.`);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? 'Edit Staff User' : 'Add Staff User'}
                </h3>
                <p className="text-xs text-slate-500">Hidaya SEMS Access Control</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Abdurahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">School Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@hidayaschool.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Optional - auto-generated if blank"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{editingUser ? 'Reset Password' : 'Password *'}</label>
                <input
                  type="password"
                  placeholder={editingUser ? 'Leave blank to keep current password' : 'Set initial password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Role *</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager (Marks Entry & Events)</option>
                  <option value="Team Leader">Team Leader (House Oversight)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Assigned Committee</label>
                <input
                  type="text"
                  placeholder="e.g. English Department, Blue House..."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Confirm Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
