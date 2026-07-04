import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Clock,
  Plus,
  X,
  Edit3,
  Trash2,
  Users,
  Award,
} from 'lucide-react';
import { FestEvent, CategoryType, StudentRegistration } from '../../types/festival';
import { getCategoryColor } from '../../utils/festivalUtils';

interface EventManagementViewProps {
  events: FestEvent[];
  registrations: StudentRegistration[];
  onAddEvent: (newEvent: Omit<FestEvent, 'id'>) => void;
  onUpdateEvent: (event: FestEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  showQuickAddModal: boolean;
  onCloseQuickAddModal: () => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onSelectEventForResults: (eventId: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  pagination: { count: number; page: number; page_size: number; next: string | null; previous: string | null } | null;
  onSearch: (search: string) => void;
  onFilterChange: (filters: { category?: string; status?: string; search?: string }) => void;
  onPageChange: (page: number) => void;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  readOnly: boolean;
}

const CATEGORIES: CategoryType[] = [
  'Junior Boys',
  'Junior Girls',
  'Senior Boys',
  'Senior Girls',
  'HSS Boys',
  'HSS Girls',
];

export const EventManagementView: React.FC<EventManagementViewProps> = ({
  events,
  registrations,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  showQuickAddModal,
  onCloseQuickAddModal,
  onShowToast,
  onSelectEventForResults,
  loading,
  error,
  onRetry,
  pagination,
  onSearch,
  onFilterChange,
  onPageChange,
  canEditEvents,
  canDeleteEvents,
  readOnly,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(showQuickAddModal);
  const [editingEvent, setEditingEvent] = useState<FestEvent | null>(null);

  const [name, setName] = useState('');
  const [level, setLevel] = useState<'Junior' | 'Senior'>('Junior');
  const [category, setCategory] = useState<CategoryType>('Junior Boys');
  const [duration, setDuration] = useState('15 mins');
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [status, setStatus] = useState<'Upcoming' | 'In Progress' | 'Completed'>('Upcoming');

  React.useEffect(() => {
    if (showQuickAddModal) setIsModalOpen(true);
  }, [showQuickAddModal]);

  const handleOpenNewModal = () => {
    setEditingEvent(null);
    setName('');
    setLevel('Junior');
    setCategory('Junior Boys');
    setDuration('15 mins');
    setMaxParticipants(16);
    setStatus('Upcoming');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ev: FestEvent) => {
    setEditingEvent(ev);
    setName(ev.name);
    setLevel(ev.level);
    setCategory(ev.category);
    setDuration(ev.duration);
    setMaxParticipants(ev.maxParticipants);
    setStatus(ev.status);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Name Required', 'Please enter event name', 'error');
      return;
    }

    if (editingEvent) {
      onUpdateEvent({
        ...editingEvent,
        name: name.trim(),
        level,
        category,
        duration,
        maxParticipants,
        status,
      });
      onShowToast('Event Updated', `${name.trim()} has been updated.`);
    } else {
      onAddEvent({
        name: name.trim(),
        level,
        category,
        duration,
        maxParticipants,
        status,
      });
      onShowToast('Event Added', `${name.trim()} (${category}) added to schedule.`);
    }

    setIsModalOpen(false);
    onCloseQuickAddModal();
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || ev.category === selectedCategory;
    const matchesLvl = selectedLevel === 'ALL' || ev.level === selectedLevel;
    const matchesStatus = selectedStatus === 'ALL' || ev.status === selectedStatus;
    return matchesSearch && matchesCat && matchesLvl && matchesStatus;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onFilterChange({ category: value, status: selectedStatus, search: searchQuery });
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    onFilterChange({ category: selectedCategory, status: selectedStatus, search: searchQuery });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onFilterChange({ category: selectedCategory, status: value, search: searchQuery });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> English Fest 2026 Event Timetable
          </h3>
          <p className="text-xs text-slate-500">
            {pagination?.count ?? events.length} Total events - Junior & Senior literary competitions
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Event</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search event name or category..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => handleCategoryChange('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={selectedLevel}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Levels</option>
          <option value="Junior">Junior Events</option>
          <option value="Senior">Senior Events</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={onRetry} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold">
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No scheduled events match your search query.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const catStyle = getCategoryColor(ev.category);
                  const participantCount = registrations.filter((r) => r.eventId === ev.id).length;

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{ev.name}</span>
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {ev.level}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                          {ev.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {ev.duration}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {participantCount} / {ev.maxParticipants} registered
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            ev.status === 'In Progress'
                              ? 'bg-red-100 text-red-700 border-red-300 animate-pulse'
                              : ev.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectEventForResults(ev.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Award className="w-3 h-3" /> Marks Entry
                          </button>

                          {canEditEvents && (
                            <button
                              onClick={() => handleOpenEditModal(ev)}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {canDeleteEvents && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete event "${ev.name}"?`)) {
                                  onDeleteEvent(ev.id);
                                  onShowToast('Event Removed', `${ev.name} deleted.`);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {pagination && pagination.count > pagination.page_size && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div>Page {pagination.page}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.previous}
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={!pagination.next}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && !readOnly && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingEvent ? 'Edit Fest Event' : 'Add English Fest Event'}
                </h3>
                <p className="text-xs text-slate-500">Hidaya School SEMS Event Parameters</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  onCloseQuickAddModal();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extempore, Elocution, Spelling Bee..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level *</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as 'Junior' | 'Senior')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 mins"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min={1}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Upcoming' | 'In Progress' | 'Completed')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    onCloseQuickAddModal();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Confirm Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
