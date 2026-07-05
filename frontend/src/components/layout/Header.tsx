import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  UserPlus, 
  CalendarPlus, 
  Award,
  X,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { NavTab, ROLE_PERMISSIONS } from './Sidebar';
import { Student, FestEvent, House, UserRole } from '../../types/festival';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  onResetData: () => void;
  onOpenQuickRegisterStudent: () => void;
  onOpenQuickAddEvent: () => void;
  onOpenQuickResultEntry: () => void;
  onOpenMobileSidebar: () => void;
  students: Student[];
  events: FestEvent[];
  houses: House[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onResetData,
  onOpenQuickRegisterStudent,
  onOpenQuickAddEvent,
  onOpenQuickResultEntry,
  onOpenMobileSidebar,
  students,
  events,
  houses
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Admin'];

  const getPageTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return { title: 'SEMS Overview Dashboard', subtitle: 'Hidaya School — English Fest 2026 Internal Portal' };
      case 'students': return { title: 'Student Management Directory', subtitle: 'Manage student records, classes, divisions, gender & house allocations' };
      case 'registration': return { title: 'Student Event Registration Desk', subtitle: 'Register students for Junior & Senior events with duplicate prevention' };
      case 'events': return { title: 'English Fest Event Schedule', subtitle: 'Manage Junior & Senior category events, durations and capacities' };
      case 'results': return { title: 'Result Marks Entry Desk', subtitle: 'Enter raw participant marks with automatic grade, rank and point computation' };
      case 'leaderboard': return { title: 'House Championship Leaderboard', subtitle: 'Real-time points, gold, silver and bronze medal tallies across 5 Houses' };
      case 'users': return { title: 'System Staff Users & Role Switcher', subtitle: 'Manage internal staff accounts for Admins, Managers and Team Leaders' };
      case 'settings': return { title: 'System & Festival Configuration', subtitle: 'Configure school details, academic year and database backups' };
      default: return { title: 'Hidaya SEMS Dashboard', subtitle: 'Internal Event Management System' };
    }
  };

  const { title, subtitle } = getPageTitle(currentTab);

  // Filtered search results
  const filteredStudents = searchQuery.trim() 
    ? students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredEvents = searchQuery.trim()
    ? events.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.category.toLowerCase().includes(searchQuery.toLowerCase()) || e.level.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger */}
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">{title}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Role Indicator / Switcher Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 font-medium hidden sm:inline">Role:</span>
            <span className="font-bold text-slate-900">{userRole}</span>
          </div>

          {/* Quick Search trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl text-xs text-slate-500 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white text-[10px] text-slate-400 rounded border border-slate-200 font-mono shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Role Permitted Quick Actions */}
          <div className="flex items-center gap-1.5">
            {permissions.includes('registration') && (
              <button
                onClick={onOpenQuickRegisterStudent}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register Student</span>
              </button>
            )}

            {permissions.includes('results') && (
              <button
                onClick={onOpenQuickResultEntry}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Enter Marks</span>
              </button>
            )}

            {permissions.includes('events') && (
              <button
                onClick={onOpenQuickAddEvent}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs rounded-xl transition-all cursor-pointer"
                title="Add Event"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Add Event</span>
              </button>
            )}

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, admission no, events..."
                className="w-full text-sm text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 py-1"
              />
              <button 
                onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-4">
              {!searchQuery.trim() ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Start typing to search across registered students and scheduled events.
                </div>
              ) : (
                <>
                  {/* Event Results */}
                  {filteredEvents.length > 0 && permissions.includes('events') && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Events ({filteredEvents.length})</h4>
                      <div className="space-y-1">
                        {filteredEvents.map(ev => (
                          <div
                            key={ev.id}
                            onClick={() => {
                              onSelectTab('events');
                              setShowSearchModal(false);
                            }}
                            className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200 transition-all"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-800">{ev.name} <span className="text-[10px] text-slate-400 font-mono">({ev.level})</span></p>
                              <p className="text-[11px] text-slate-500">Category: {ev.category} • Duration: {ev.duration}</p>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                              {ev.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Results */}
                  {filteredStudents.length > 0 && permissions.includes('students') && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Students ({filteredStudents.length})</h4>
                      <div className="space-y-1">
                        {filteredStudents.map(st => {
                          const house = houses.find(h => h.id === st.houseId);
                          return (
                            <div
                              key={st.id}
                              onClick={() => {
                                onSelectTab('students');
                                setShowSearchModal(false);
                              }}
                              className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{st.name}</p>
                                  <p className="text-[11px] text-slate-500">{st.admissionNo} • Class {st.className}-{st.division} ({st.gender})</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${house?.badgeBg}`}>
                                {house?.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredEvents.length === 0 && filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No matching events or students found for "{searchQuery}".
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-slate-50 p-2.5 text-center text-[11px] text-slate-400 border-t border-slate-100">
              Press <kbd className="px-1 py-0.5 bg-white rounded border text-slate-600 font-mono">ESC</kbd> to exit search
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
