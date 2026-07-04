import React, { useState } from 'react';
import { Home, Plus, X, Edit3, Trash2, Users, Trophy } from 'lucide-react';
import { House, Student } from '../../types/festival';

interface HouseManagementViewProps {
  houses: House[];
  students: Student[];
  onAddHouse: (house: Omit<House, 'points' | 'gold' | 'silver' | 'bronze'>) => void;
  onUpdateHouse: (house: House) => void;
  onDeleteHouse: (houseId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

// Preset color palettes so new houses stay on-brand with Tailwind utility classes
const COLOR_PRESETS: { label: string; color: string; bgLight: string; badgeBg: string; textColor: string; borderColor: string }[] = [
  { label: 'Blue', color: '#3b82f6', bgLight: 'bg-blue-50', badgeBg: 'bg-blue-100 text-blue-700 border-blue-200', textColor: 'text-blue-600', borderColor: 'border-blue-500' },
  { label: 'Green', color: '#10b981', bgLight: 'bg-emerald-50', badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200', textColor: 'text-emerald-600', borderColor: 'border-emerald-500' },
  { label: 'Yellow', color: '#f59e0b', bgLight: 'bg-amber-50', badgeBg: 'bg-amber-100 text-amber-800 border-amber-200', textColor: 'text-amber-600', borderColor: 'border-amber-500' },
  { label: 'Red', color: '#ef4444', bgLight: 'bg-red-50', badgeBg: 'bg-red-100 text-red-700 border-red-200', textColor: 'text-red-600', borderColor: 'border-red-500' },
  { label: 'Purple', color: '#8b5cf6', bgLight: 'bg-purple-50', badgeBg: 'bg-purple-100 text-purple-700 border-purple-200', textColor: 'text-purple-600', borderColor: 'border-purple-500' },
  { label: 'Cyan', color: '#06b6d4', bgLight: 'bg-cyan-50', badgeBg: 'bg-cyan-100 text-cyan-700 border-cyan-200', textColor: 'text-cyan-600', borderColor: 'border-cyan-500' },
  { label: 'Pink', color: '#ec4899', bgLight: 'bg-pink-50', badgeBg: 'bg-pink-100 text-pink-700 border-pink-200', textColor: 'text-pink-600', borderColor: 'border-pink-500' },
  { label: 'Slate', color: '#64748b', bgLight: 'bg-slate-50', badgeBg: 'bg-slate-100 text-slate-700 border-slate-200', textColor: 'text-slate-600', borderColor: 'border-slate-500' }
];

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const HouseManagementView: React.FC<HouseManagementViewProps> = ({
  houses,
  students,
  onAddHouse,
  onUpdateHouse,
  onDeleteHouse,
  onShowToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);

  const [name, setName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [presetIdx, setPresetIdx] = useState(0);

  const handleOpenNew = () => {
    setEditingHouse(null);
    setName('');
    setCaptainName('');
    setPresetIdx(houses.length % COLOR_PRESETS.length);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: House) => {
    setEditingHouse(h);
    setName(h.name);
    setCaptainName(h.captainName);
    const idx = COLOR_PRESETS.findIndex(p => p.color === h.color);
    setPresetIdx(idx >= 0 ? idx : 0);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Name Required', 'Please enter the house name', 'error');
      return;
    }
    const preset = COLOR_PRESETS[presetIdx];

    if (editingHouse) {
      onUpdateHouse({
        ...editingHouse,
        name: name.trim(),
        captainName: captainName.trim() || '—',
        color: preset.color,
        bgLight: preset.bgLight,
        badgeBg: preset.badgeBg,
        textColor: preset.textColor,
        borderColor: preset.borderColor
      });
      onShowToast('House Updated', `${name} has been updated.`);
    } else {
      const id = slugify(name) || `house-${Date.now()}`;
      if (houses.some(h => h.id === id)) {
        onShowToast('Duplicate House', 'A house with a similar name already exists.', 'error');
        return;
      }
      onAddHouse({
        id,
        name: name.trim(),
        captainName: captainName.trim() || '—',
        color: preset.color,
        bgLight: preset.bgLight,
        badgeBg: preset.badgeBg,
        textColor: preset.textColor,
        borderColor: preset.borderColor
      });
      onShowToast('House Created', `${name} added to the championship.`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" /> House Management
          </h3>
          <p className="text-xs text-slate-500">
            {houses.length} Houses configured — houses are fully manageable, never hardcoded.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add House</span>
        </button>
      </div>

      {/* House Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {houses.map(h => {
          const memberCount = students.filter(s => s.houseId === h.id).length;
          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: h.color }} />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: h.color }}>
                      {h.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                      <p className="text-[11px] text-slate-500">Captain: {h.captainName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(h)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit House"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (memberCount > 0) {
                          onShowToast('Cannot Delete', `${h.name} still has ${memberCount} students assigned.`, 'error');
                          return;
                        }
                        if (confirm(`Delete ${h.name}?`)) {
                          onDeleteHouse(h.id);
                          onShowToast('House Deleted', `${h.name} was removed.`);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete House"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500"><Users className="w-3.5 h-3.5" /> Students</div>
                    <p className="text-lg font-black text-slate-900 mt-0.5">{memberCount}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500"><Trophy className="w-3.5 h-3.5" /> Points</div>
                    <p className="text-lg font-black text-slate-900 mt-0.5">{h.points}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">🥇 {h.gold}</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">🥈 {h.silver}</span>
                  <span className="px-2 py-1 bg-orange-50 text-orange-800 rounded-lg border border-orange-100">🥉 {h.bronze}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingHouse ? 'Edit House' : 'Add New House'}
                </h3>
                <p className="text-xs text-slate-500">Configure house identity & color theme</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">House Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue House"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">House Captain</label>
                <input
                  type="text"
                  placeholder="e.g. Amaan Ahmed (Cl. 12A)"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">House Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((p, idx) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPresetIdx(idx)}
                      title={p.label}
                      className={`w-8 h-8 rounded-full transition-transform ${presetIdx === idx ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: p.color }}
                    />
                  ))}
                </div>
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
                  {editingHouse ? 'Save Changes' : 'Create House'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
