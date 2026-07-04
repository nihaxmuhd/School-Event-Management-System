import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  X, 
  Trash2, 
  Edit3, 
  Download, 
  Users,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Student, House, HouseId, GenderType } from '../../types/festival';
import { downloadExcel, downloadPDF } from '../../utils/festivalUtils';
import { ExcelImportModal } from './ExcelImportModal';

interface StudentManagementViewProps {
  students: Student[];
  houses: House[];
  onAddStudent: (newStudent: Omit<Student, 'id' | 'registeredEventIds'>) => void;
  onBulkImportStudents: (students: Omit<Student, 'id' | 'registeredEventIds'>[]) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  houses,
  onAddStudent,
  onBulkImportStudents,
  onUpdateStudent,
  onDeleteStudent,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [admissionNo, setAdmissionNo] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('8');
  const [division, setDivision] = useState('A');
  const [gender, setGender] = useState<GenderType>('Male');
  const [houseId, setHouseId] = useState<HouseId>('blue');

  const handleOpenNewModal = () => {
    setEditingStudent(null);
    setAdmissionNo(`HS-2024-${Math.floor(120 + Math.random() * 880)}`);
    setName('');
    setClassName('8');
    setDivision('A');
    setGender('Male');
    setHouseId('blue');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st: Student) => {
    setEditingStudent(st);
    setAdmissionNo(st.admissionNo);
    setName(st.name);
    setClassName(st.className);
    setDivision(st.division);
    setGender(st.gender);
    setHouseId(st.houseId);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !admissionNo.trim()) {
      onShowToast('Required Fields Missing', 'Please enter student name and admission number', 'error');
      return;
    }

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        admissionNo: admissionNo.trim(),
        name: name.trim(),
        className,
        division,
        gender,
        houseId
      };
      onUpdateStudent(updated);
      onShowToast('Student Updated', `${updated.name}'s record has been updated.`);
    } else {
      onAddStudent({
        admissionNo: admissionNo.trim(),
        name: name.trim(),
        className,
        division,
        gender,
        houseId,
        status: 'Active'
      });
      onShowToast('Student Added', `${name} (${admissionNo}) added to student directory.`);
    }

    setIsModalOpen(false);
  };

  const buildExportRows = () => [
    ['Admission No', 'Student Name', 'Class', 'Division', 'Gender', 'House', 'Status'],
    ...filteredStudents.map(s => {
      const h = houses.find(house => house.id === s.houseId);
      return [s.admissionNo, s.name, s.className, s.division, s.gender, h?.name || s.houseId, s.status];
    })
  ];

  const handleExportExcel = () => {
    downloadExcel('hidaya_school_students', 'Hidaya School — Student Directory', buildExportRows());
    onShowToast('Excel Downloaded', 'Exported student directory to Excel');
  };

  const handleExportPDF = () => {
    downloadPDF('Student Directory', `${filteredStudents.length} students • Hidaya School English Fest 2026`, buildExportRows());
    onShowToast('PDF Ready', 'Opening print dialog for PDF export');
  };

  const filteredStudents = students.filter(st => {
    const matchesQuery = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         st.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHouse = selectedHouseFilter === 'ALL' || st.houseId === selectedHouseFilter;
    return matchesQuery && matchesHouse;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" /> Student Directory
          </h3>
          <p className="text-xs text-slate-500">
            {students.length} Total students enrolled in Hidaya School Event System
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter Options Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name or admission number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* House Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedHouseFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedHouseFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Houses
          </button>
          {houses.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedHouseFilter(h.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedHouseFilter === h.id ? `${h.badgeBg} ring-2 ring-emerald-500/20` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Student Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Admission Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">House</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No students matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const house = houses.find(h => h.id === st.houseId);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {st.admissionNo}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {st.name}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        Class {st.className}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {st.division}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {st.gender}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block border ${house?.badgeBg}`}>
                          {house?.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          st.status === 'Checked-In' ? 'bg-emerald-100 text-emerald-800' :
                          st.status === 'Registered' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {st.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(st)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Student Info"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove student ${st.name}?`)) {
                                onDeleteStudent(st.id);
                                onShowToast('Student Removed', `${st.name} was deleted.`);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Student"
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

      {/* Excel Import Modal */}
      {isImportOpen && (
        <ExcelImportModal
          existingStudents={students}
          houses={houses}
          onClose={() => setIsImportOpen(false)}
          onImport={onBulkImportStudents}
          onShowToast={onShowToast}
        />
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingStudent ? 'Edit Student Record' : 'Add New Student'}
                </h3>
                <p className="text-xs text-slate-500">Hidaya School SEMS Student Registration</p>
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
                <label className="block font-bold text-slate-700 mb-1">Admission Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HS-2024-101"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name of the student"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class *</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Division *</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned House *</label>
                  <select
                    value={houseId}
                    onChange={(e) => setHouseId(e.target.value as HouseId)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  >
                    {houses.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
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
                  {editingStudent ? 'Save Changes' : 'Confirm Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
