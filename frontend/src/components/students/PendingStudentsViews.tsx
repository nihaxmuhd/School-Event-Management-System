import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserX, Search, Download, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Student, House } from '../../types/festival';
import { downloadExcel, downloadPDF } from '../../utils/festivalUtils';

interface PendingStudentsViewProps {
  students: Student[];
  houses: House[];
  onGoToRegistration: () => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const PendingStudentsView: React.FC<PendingStudentsViewProps> = ({
  houses,
  onGoToRegistration,
  onShowToast,
  loading = false,
  error = null,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState('ALL');
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get('/api/v1/students/pending/');
        const rows = response.data?.data ?? response.data ?? [];
        setPendingStudents(rows.map((st: any) => ({
          id: st.id,
          admissionNo: st.admission_no,
          name: st.student_name,
          className: st.student_class,
          division: st.division,
          gender: st.gender,
          houseId: st.house,
          status: st.status,
          registeredEventIds: [],
        })));
      } catch {
        setPendingStudents([]);
      }
    };
    void load();
  }, []);

  const filtered = pendingStudents.filter(st => {
    const matchesQuery = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || st.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHouse = selectedHouseFilter === 'ALL' || st.houseId === selectedHouseFilter;
    return matchesQuery && matchesHouse;
  });

  const buildRows = () => [
    ['Admission No', 'Student Name', 'Class', 'Division', 'Gender', 'House'],
    ...filtered.map(s => {
      const h = houses.find(house => house.id === s.houseId);
      return [s.admissionNo, s.name, s.className, s.division, s.gender, h?.name || s.houseId];
    })
  ];

  const pendingByHouse = houses.map(h => ({ house: h, count: pendingStudents.filter(s => s.houseId === h.id).length }));

  const assignedPct = pendingStudents.length > 0 ? 0 : 100;

  return (
    <div className="space-y-6">
      {loading && <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-sm text-slate-600">Loading pending students...</div>}
      {error && (
        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">{error}</p>
          {onRetry && <button onClick={onRetry} className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold">Retry</button>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><UserX className="w-5 h-5 text-amber-500" /> Pending Students</h3>
          <p className="text-xs text-slate-500">{pendingStudents.length} students not yet assigned to any event • {assignedPct}% of school assigned</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { downloadExcel('pending_students', 'Pending Students', buildRows()); onShowToast('Excel Downloaded', 'Exported pending students to Excel'); }} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"><Download className="w-4 h-4" /><span>Excel</span></button>
          <button onClick={() => { downloadPDF('Pending Students Report', 'Students not yet registered for any event', buildRows()); onShowToast('PDF Ready', 'Opening print dialog for PDF export'); }} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"><FileText className="w-4 h-4" /><span>PDF</span></button>
          <button onClick={onGoToRegistration} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"><span>Go to Registration</span><ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pending</p><p className="text-2xl font-black text-amber-600 mt-1">{pendingStudents.length}</p></div>
        {pendingByHouse.map(({ house, count }) => <div key={house.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: house.color }} /><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{house.name.replace(' House', '')}</p></div><p className="text-2xl font-black text-slate-900 mt-1">{count}</p></div>)}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" placeholder="Search name or admission number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button onClick={() => setSelectedHouseFilter('ALL')} className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${selectedHouseFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All Houses</button>
          {houses.map(h => <button key={h.id} onClick={() => setSelectedHouseFilter(h.id)} className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${selectedHouseFilter === h.id ? `${h.badgeBg} ring-2 ring-emerald-500/20` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{h.name}</button>)}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Admission Number</th><th className="py-3 px-4">Student Name</th><th className="py-3 px-4">Class</th><th className="py-3 px-4">Division</th><th className="py-3 px-4">Gender</th><th className="py-3 px-4">House</th><th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" /> All students in this view have been assigned to events. 🎉</td></tr>
              ) : filtered.map(st => {
                const house = houses.find(h => h.id === st.houseId);
                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{st.admissionNo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{st.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">Class {st.className}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{st.division}</td>
                    <td className="py-3.5 px-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>{st.gender}</span></td>
                    <td className="py-3.5 px-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block border ${house?.badgeBg}`}>{house?.name}</span></td>
                    <td className="py-3.5 px-4 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">Pending</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
