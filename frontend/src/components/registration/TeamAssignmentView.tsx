import React, { useState } from 'react';
import { ClipboardList, UserCheck, Trash2, Search, CheckCircle2, Users } from 'lucide-react';
import { Student, FestEvent, House, CategoryType, StudentRegistration } from '../../types/festival';
import { getCategoryColor } from '../../utils/festivalUtils';

interface TeamAssignmentViewProps {
  houseId?: HouseIdType;
  students: Student[];
  events: FestEvent[];
  houses: House[];
  registrations: StudentRegistration[];
  onAddRegistration: (studentId: string, eventId: string, category: CategoryType) => void;
  onRemoveRegistration: (regId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

type HouseIdType = string;

const CATEGORIES: CategoryType[] = ['Junior Boys', 'Junior Girls', 'Senior Boys', 'Senior Girls', 'HSS Boys', 'HSS Girls'];

export const TeamAssignmentView: React.FC<TeamAssignmentViewProps> = ({
  houseId,
  students,
  events,
  houses,
  registrations,
  onAddRegistration,
  onRemoveRegistration,
  onShowToast
}) => {
  const myHouse = houses.find(h => h.id === houseId) || houses[0];
  const activeHouseId = myHouse?.id;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Junior Boys');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');

  // Only students from this Team Leader's own House
  const houseStudents = students.filter(s => s.houseId === activeHouseId);
  const selectedStudent = houseStudents.find(s => s.id === selectedStudentId);

  const availableEvents = events.filter(e =>
    e.category === selectedCategory ||
    (selectedCategory.startsWith('Junior') && e.level === 'Junior') ||
    (selectedCategory.startsWith('Senior') && e.level === 'Senior') ||
    (selectedCategory.startsWith('HSS') && e.level === 'Senior')
  );

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) { onShowToast('Select Student', 'Choose a student from your House first', 'error'); return; }
    if (!selectedEventId) { onShowToast('Select Event', 'Choose an event to assign', 'error'); return; }

    const duplicate = registrations.some(r => r.studentId === selectedStudentId && r.eventId === selectedEventId);
    if (duplicate) {
      onShowToast('Already Assigned', `${selectedStudent?.name} is already assigned to this event.`, 'error');
      return;
    }

    const ev = events.find(x => x.id === selectedEventId);
    onAddRegistration(selectedStudentId, selectedEventId, selectedCategory);
    onShowToast('Student Assigned', `${selectedStudent?.name} assigned to ${ev?.name}`);
    setSelectedEventId('');
  };

  // Registrations belonging to this house
  const houseRegistrations = registrations.filter(r => {
    const st = students.find(s => s.id === r.studentId);
    return st?.houseId === activeHouseId;
  }).filter(r => {
    const st = students.find(s => s.id === r.studentId);
    const ev = events.find(e => e.id === r.eventId);
    const q = searchFilter.toLowerCase();
    return !q || st?.name.toLowerCase().includes(q) || st?.admissionNo.toLowerCase().includes(q) || ev?.name.toLowerCase().includes(q);
  });

  const assignedCount = new Set(registrations.filter(r => {
    const st = students.find(s => s.id === r.studentId);
    return st?.houseId === activeHouseId;
  }).map(r => r.studentId)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {myHouse && <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: myHouse.color }}>{myHouse.name.charAt(0)}</span>}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" /> Team Assignment — {myHouse?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Assign your existing House students to festival events. Student records are managed by the Admin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-3">
            <p className="text-lg font-black text-slate-900">{houseStudents.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Students</p>
          </div>
          <div className="text-center px-3 border-l border-slate-200">
            <p className="text-lg font-black text-emerald-600">{assignedCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Assign Student to Event
            </h4>
          </div>

          <form onSubmit={handleAssign} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">1. Select House Student *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">-- Choose from {myHouse?.name} --</option>
                {houseStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.admissionNo} — {st.name} (Class {st.className}-{st.division})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-slate-700">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{selectedStudent.name}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded ${myHouse?.badgeBg}`}>{myHouse?.name}</span>
                </div>
                <div className="grid grid-cols-2 text-[11px] text-slate-500">
                  <span>Adm: <strong className="text-slate-800 font-mono">{selectedStudent.admissionNo}</strong></span>
                  <span>Class: <strong className="text-slate-800">{selectedStudent.className}-{selectedStudent.division}</strong></span>
                  <span>Gender: <strong className="text-slate-800">{selectedStudent.gender}</strong></span>
                  <span>Events: <strong className="text-emerald-600">{selectedStudent.registeredEventIds.length}</strong></span>
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">2. Select Category *</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">3. Select Event *</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">-- Choose Event ({availableEvents.length} available) --</option>
                {availableEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} ({ev.level} • {ev.duration})</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Assign to Event</span>
            </button>
          </form>
        </div>

        {/* Assigned Students Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> {myHouse?.name} Assignments
              </h4>
              <p className="text-xs text-slate-500">{houseRegistrations.length} event assignments for your House</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter student or event..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Admission No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Event Name</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {houseRegistrations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">No assignments yet. Use the form to assign your House students.</td></tr>
                ) : (
                  houseRegistrations.map(reg => {
                    const st = students.find(s => s.id === reg.studentId);
                    const ev = events.find(e => e.id === reg.eventId);
                    const catStyle = getCategoryColor(reg.category);
                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{st?.admissionNo}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {st?.name}
                          <span className="text-[10px] font-normal text-slate-400 block">Class {st?.className}-{st?.division}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>{reg.category}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{ev?.name}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => { onRemoveRegistration(reg.id); onShowToast('Assignment Removed', `Removed ${st?.name} from ${ev?.name}`); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};
