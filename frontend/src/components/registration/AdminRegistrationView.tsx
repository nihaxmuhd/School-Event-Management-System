import React, { useState } from 'react';
import { Layers, ArrowLeft, Search, Download, FileText, UserCheck, Users, CheckCircle2, Plus, X } from 'lucide-react';
import { Student, FestEvent, House, CategoryType, StudentRegistration } from '../../types/festival';
import { downloadExcel, downloadPDF, getCategoryColor } from '../../utils/festivalUtils';

interface AdminRegistrationViewProps {
  students: Student[];
  events: FestEvent[];
  houses: House[];
  registrations: StudentRegistration[];
  onAddRegistration: (studentId: string, eventId: string, category: CategoryType) => void;
  onRemoveRegistration: (regId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: CategoryType[] = ['Junior Boys', 'Junior Girls', 'Senior Boys', 'Senior Girls', 'HSS Boys', 'HSS Girls'];

export const AdminRegistrationView: React.FC<AdminRegistrationViewProps> = ({
  students,
  events,
  houses,
  registrations,
  onAddRegistration,
  onRemoveRegistration,
  onShowToast
}) => {
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick-assign modal
  const [assignStudent, setAssignStudent] = useState<Student | null>(null);
  const [assignCategory, setAssignCategory] = useState<CategoryType>('Junior Boys');
  const [assignEventId, setAssignEventId] = useState('');

  const selectedHouse = houses.find(h => h.id === selectedHouseId);

  const houseRegCount = (houseId: string) =>
    registrations.filter(r => {
      const st = students.find(s => s.id === r.studentId);
      return st?.houseId === houseId;
    }).length;

  const houseStudentCount = (houseId: string) => students.filter(s => s.houseId === houseId).length;

  const availableEvents = events.filter(e =>
    e.category === assignCategory ||
    (assignCategory.startsWith('Junior') && e.level === 'Junior') ||
    (assignCategory.startsWith('Senior') && e.level === 'Senior') ||
    (assignCategory.startsWith('HSS') && e.level === 'Senior')
  );

  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStudent || !assignEventId) { onShowToast('Select Event', 'Choose an event to assign', 'error'); return; }
    const dup = registrations.some(r => r.studentId === assignStudent.id && r.eventId === assignEventId);
    if (dup) { onShowToast('Already Registered', `${assignStudent.name} is already in this event.`, 'error'); return; }
    const ev = events.find(x => x.id === assignEventId);
    onAddRegistration(assignStudent.id, assignEventId, assignCategory);
    onShowToast('Registered', `${assignStudent.name} registered for ${ev?.name}`);
    setAssignStudent(null);
    setAssignEventId('');
  };

  // ============ HOUSE CARDS VIEW ============
  if (!selectedHouse) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" /> House-wise Registration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a House to view its students and manage their event registrations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map(h => {
            const total = houseStudentCount(h.id);
            const regs = houseRegCount(h.id);
            const pending = students.filter(s => s.houseId === h.id && s.registeredEventIds.length === 0).length;
            return (
              <button
                key={h.id}
                onClick={() => { setSelectedHouseId(h.id); setSearchQuery(''); }}
                className="text-left bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: h.color }} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: h.color }}>
                      {h.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                      <p className="text-[11px] text-slate-500">Captain: {h.captainName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                      <p className="text-base font-black text-slate-900">{total}</p>
                      <p className="text-[9px] font-bold uppercase text-slate-400">Students</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                      <p className="text-base font-black text-emerald-600">{regs}</p>
                      <p className="text-[9px] font-bold uppercase text-slate-400">Regs</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                      <p className="text-base font-black text-amber-600">{pending}</p>
                      <p className="text-[9px] font-bold uppercase text-slate-400">Pending</p>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Registrations
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ HOUSE DETAIL VIEW ============
  const houseStudents = students
    .filter(s => s.houseId === selectedHouse.id)
    .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()));

  const buildRows = () => {
    const rows: (string | number)[][] = [['Admission No', 'Student Name', 'Class', 'Category & Event']];
    students.filter(s => s.houseId === selectedHouse.id).forEach(s => {
      const regs = registrations.filter(r => r.studentId === s.id);
      const regText = regs.length === 0 ? 'Not Registered' : regs.map(r => {
        const ev = events.find(e => e.id === r.eventId);
        return `${ev?.name} (${r.category})`;
      }).join('; ');
      rows.push([s.admissionNo, s.name, `${s.className}-${s.division}`, regText]);
    });
    return rows;
  };

  return (
    <div className="space-y-6">
      {/* Header with back */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedHouseId(null)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: selectedHouse.color }}>{selectedHouse.name.charAt(0)}</span>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> {selectedHouse.name} — Registrations
            </h3>
            <p className="text-xs text-slate-500">{houseStudentCount(selectedHouse.id)} students • {houseRegCount(selectedHouse.id)} event registrations</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { downloadExcel(`${selectedHouse.id}_registrations`, `${selectedHouse.name} Registrations`, buildRows()); onShowToast('Excel Downloaded', `Exported ${selectedHouse.name} registrations`); }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /><span>Excel</span>
          </button>
          <button
            onClick={() => { downloadPDF(`${selectedHouse.name} Registration Report`, `Event registrations for ${selectedHouse.name}`, buildRows()); onShowToast('PDF Ready', 'Opening print dialog'); }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" /><span>PDF</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search this House's students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Students of this house with their registrations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Registered Events</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {houseStudents.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">No students found in this House.</td></tr>
              ) : (
                houseStudents.map(st => {
                  const regs = registrations.filter(r => r.studentId === st.id);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{st.admissionNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {st.name}
                        <span className="text-[10px] font-normal text-slate-400 block">{st.gender}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{st.className}-{st.division}</td>
                      <td className="py-3.5 px-4">
                        {regs.length === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">Not Registered</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {regs.map(r => {
                              const ev = events.find(e => e.id === r.eventId);
                              const catStyle = getCategoryColor(r.category);
                              return (
                                <span key={r.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                  {ev?.name}
                                  <button
                                    onClick={() => { onRemoveRegistration(r.id); onShowToast('Removed', `${st.name} removed from ${ev?.name}`); }}
                                    className="hover:text-red-600"
                                    title="Remove"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => { setAssignStudent(st); setAssignEventId(''); }}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Register
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Assign Modal */}
      {assignStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Register Student
                </h3>
                <p className="text-xs text-slate-500">{assignStudent.name} • {assignStudent.admissionNo}</p>
              </div>
              <button onClick={() => setAssignStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAssign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={assignCategory}
                  onChange={(e) => setAssignCategory(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event *</label>
                <select
                  value={assignEventId}
                  onChange={(e) => setAssignEventId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">-- Choose Event ({availableEvents.length}) --</option>
                  {availableEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.level})</option>)}
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setAssignStudent(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
