import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  UserCheck, 
  BookOpen, 
  Trash2, 
  Download
} from 'lucide-react';
import { Student, FestEvent, House, CategoryType, StudentRegistration } from '../../types/festival';
import { downloadCSV, getCategoryColor } from '../../utils/festivalUtils';

interface EventRegistrationViewProps {
  students: Student[];
  events: FestEvent[];
  houses: House[];
  registrations: StudentRegistration[];
  onAddRegistration: (studentId: string, eventId: string, category: CategoryType) => void;
  onRemoveRegistration: (regId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: CategoryType[] = [
  'Junior Boys',
  'Junior Girls',
  'Senior Boys',
  'Senior Girls',
  'HSS Boys',
  'HSS Girls'
];

export const EventRegistrationView: React.FC<EventRegistrationViewProps> = ({
  students,
  events,
  houses,
  registrations,
  onAddRegistration,
  onRemoveRegistration,
  onShowToast
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Junior Boys');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedStudentHouse = selectedStudent ? houses.find(h => h.id === selectedStudent.houseId) : null;

  // Filter events matching the selected category or level
  const availableEvents = events.filter(e => {
    if (!selectedCategory) return true;
    return e.category === selectedCategory || 
           (selectedCategory.startsWith('Junior') && e.level === 'Junior') ||
           (selectedCategory.startsWith('Senior') && e.level === 'Senior') ||
           (selectedCategory.startsWith('HSS') && e.level === 'Senior');
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      onShowToast('Select Student', 'Please select a student from the list first', 'error');
      return;
    }

    if (!selectedEventId) {
      onShowToast('Select Event', 'Please choose an event for registration', 'error');
      return;
    }

    // Rule: Prevent duplicate registration
    const isAlreadyRegistered = registrations.some(
      r => r.studentId === selectedStudentId && r.eventId === selectedEventId
    );

    if (isAlreadyRegistered) {
      onShowToast(
        'Duplicate Registration Prevented', 
        `${selectedStudent?.name} is already registered for this event!`, 
        'error'
      );
      return;
    }

    const targetEv = events.find(ev => ev.id === selectedEventId);

    onAddRegistration(selectedStudentId, selectedEventId, selectedCategory);
    onShowToast(
      'Registration Confirmed', 
      `${selectedStudent?.name} registered for ${targetEv?.name} (${selectedCategory})`
    );

    // Reset event selection
    setSelectedEventId('');
  };

  const handleExportCSV = () => {
    const rows = [
      ['Admission No', 'Student Name', 'Class', 'House', 'Category', 'Event Name'],
      ...registrations.map(r => {
        const st = students.find(s => s.id === r.studentId);
        const ev = events.find(e => e.id === r.eventId);
        const house = houses.find(h => h.id === st?.houseId);

        return [
          st?.admissionNo || '',
          st?.name || '',
          `Class ${st?.className}-${st?.division}` || '',
          house?.name || '',
          r.category,
          ev?.name || ''
        ];
      })
    ];
    downloadCSV('hidaya_event_registrations.csv', rows);
    onShowToast('CSV Downloaded', 'Exported registered participants list');
  };

  const filteredRegistrations = registrations.filter(r => {
    const st = students.find(s => s.id === r.studentId);
    const ev = events.find(e => e.id === r.eventId);
    const q = searchFilter.toLowerCase();

    return !q || 
      st?.name.toLowerCase().includes(q) || 
      st?.admissionNo.toLowerCase().includes(q) || 
      ev?.name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" /> Student Event Registration
          </h3>
          <p className="text-xs text-slate-500">
            Internal registration desk for Hidaya School English Fest 2026
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Registrations</span>
        </button>
      </div>

      {/* Main Grid: Registration Form (1 Col) + Registered List (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Workflow Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Register Student for Event
            </h4>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Step 1: Select Student */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">1. Select Student *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">-- Choose Student from Directory --</option>
                {students.map(st => {
                  const h = houses.find(house => house.id === st.houseId);
                  return (
                    <option key={st.id} value={st.id}>
                      {st.admissionNo} — {st.name} (Class {st.className}-{st.division}, {h?.name})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Auto-filled Student Summary Box */}
            {selectedStudent && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-slate-700">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{selectedStudent.name}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded ${selectedStudentHouse?.badgeBg}`}>
                    {selectedStudentHouse?.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-[11px] text-slate-500">
                  <span>Admission No: <strong className="text-slate-800 font-mono">{selectedStudent.admissionNo}</strong></span>
                  <span>Class: <strong className="text-slate-800">{selectedStudent.className}-{selectedStudent.division}</strong></span>
                  <span>Gender: <strong className="text-slate-800">{selectedStudent.gender}</strong></span>
                  <span>Status: <strong className="text-emerald-600">{selectedStudent.status}</strong></span>
                </div>
              </div>
            )}

            {/* Step 2: Select Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">2. Select Category *</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Step 3: Select Event */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">3. Select Event *</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">-- Choose Event ({availableEvents.length} available) --</option>
                {availableEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.level} • {ev.category} • {ev.duration})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirm Event Registration</span>
            </button>
          </form>
        </div>

        {/* Registered Participants Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Registered Participants List</h4>
              <p className="text-xs text-slate-500">{registrations.length} Total active registrations</p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter participant or event..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Admission No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">House</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Event Name</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No registrations recorded. Register a student using the form.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => {
                    const st = students.find(s => s.id === reg.studentId);
                    const ev = events.find(e => e.id === reg.eventId);
                    const house = houses.find(h => h.id === st?.houseId);
                    const catStyle = getCategoryColor(reg.category);

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {st?.admissionNo || 'HS-REG'}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {st?.name || 'Student'}
                          <span className="text-[10px] font-normal text-slate-400 block">Class {st?.className}-{st?.division}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${house?.badgeBg}`}>
                            {house?.name}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                            {reg.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {ev?.name || 'Event'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              onRemoveRegistration(reg.id);
                              onShowToast('Registration Cancelled', `Removed ${st?.name} from ${ev?.name}`);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Registration"
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
