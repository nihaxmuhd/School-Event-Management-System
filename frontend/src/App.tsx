import { useEffect, useMemo, useState } from 'react';
import { Sidebar, NavTab, ROLE_PERMISSIONS } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentManagementView } from './components/students/StudentManagementView';
import { PendingStudentsView } from './components/students/PendingStudentsViews';
import { AdminRegistrationView } from './components/registration/AdminRegistrationView';
import { TeamAssignmentView } from './components/registration/TeamAssignmentView';
import { EventManagementView } from './components/events/EventManagementView';
import { ResultEntryView } from './components/results/ResultEntryView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { HouseManagementView } from './components/houses/HouseManagementView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { LoginPage } from './components/auth/LoginPage';
import { useAuth } from './auth/AuthContext';
import { apiClient } from './api/client';
import { resourceService } from './api/resources';
import { recalculateHousePoints } from './utils/festivalUtils';
import { House, FestEvent, Student, StudentRegistration, EventResultRecord, SystemUser, SchoolFestConfig, CategoryType } from './types/festival';

const DEFAULT_CONFIG: SchoolFestConfig = {
  schoolName: 'Hidaya School',
  festName: 'English Fest',
  academicYear: '2025-2026',
  tagline: '',
  totalStudentsCount: 0,
  pointSettings: { first: 10, second: 7, third: 5, participation: 2, gradeA: 5, gradeB: 3, gradeC: 1 },
};

const emptyHouse = (name: string, id: string): House => ({ id, name, color: '#64748b', bgLight: 'bg-slate-50', badgeBg: 'bg-slate-100 text-slate-700 border-slate-200', textColor: 'text-slate-600', borderColor: 'border-slate-400', captainName: '', points: 0, gold: 0, silver: 0, bronze: 0 });

export function App() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [config, setConfig] = useState<SchoolFestConfig>(DEFAULT_CONFIG);
  const [baseHouses, setBaseHouses] = useState<House[]>([]);
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [results, setResults] = useState<EventResultRecord[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedResultEventId, setSelectedResultEventId] = useState<string | undefined>();
  const [showQuickAddEventModal, setShowQuickAddEventModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const loadData = async () => {
    const [houses, evs, sts, regs, res, me] = await Promise.all([
      resourceService.getHouses(),
      resourceService.getEvents(),
      resourceService.getStudents(),
      resourceService.getRegistrations(),
      resourceService.getResults(),
      resourceService.getUsers().catch(() => []),
    ]);
    setBaseHouses(houses.length ? houses : [emptyHouse('Blue House', 'blue')]);
    setEvents(evs);
    setStudents(sts);
    setRegistrations(regs);
    setResults(res);
    setUsers(me);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData().catch(() => addToast('Load Failed', 'Could not load backend data', 'error'));
    }
  }, [isAuthenticated]);

  const computedHouses = useMemo(() => recalculateHousePoints(baseHouses, results), [baseHouses, results]);
  const teamLeaderHouseId = users.find((u) => u.role === 'Team Leader' && u.houseId)?.houseId || baseHouses[0]?.id;
  const allowedTabs = user ? ROLE_PERMISSIONS[user.role] : [];

  useEffect(() => {
    if (user && !allowedTabs.includes(currentTab)) setCurrentTab('dashboard');
  }, [user?.role, currentTab]);

  const refreshAll = async () => { await loadData(); };

  const apiMutate = async (fn: () => Promise<any>) => {
    await fn();
    await refreshAll();
  };

  const handleLogout = async () => { await logout(); };

  const handleResetData = () => addToast('Unavailable', 'Backend reset endpoint is not implemented yet.', 'info');
  const handleAddStudent = (newSt: Omit<Student, 'id' | 'registeredEventIds'>) => apiMutate(async () => apiClient.post('/students/', { ...newSt, house: newSt.houseId })).then(() => addToast('Student Added'));
  const handleBulkImportStudents = (_: Omit<Student, 'id' | 'registeredEventIds'>[]) => addToast('Import', 'Excel import should use backend import endpoint.', 'info');
  const handleUpdateStudent = (updatedSt: Student) => apiMutate(async () => apiClient.patch(`/students/${updatedSt.id}/`, { ...updatedSt, house: updatedSt.houseId }));
  const handleDeleteStudent = (stId: string) => apiMutate(async () => apiClient.delete(`/students/${stId}/`));
  const handleAddHouse = (house: Omit<House, 'points' | 'gold' | 'silver' | 'bronze'>) => apiMutate(async () => apiClient.post('/houses/', house));
  const handleUpdateHouse = (updated: House) => apiMutate(async () => apiClient.patch(`/houses/${updated.id}/`, updated));
  const handleDeleteHouse = (houseId: string) => apiMutate(async () => apiClient.delete(`/houses/${houseId}/`));
  const handleAddEvent = (newEv: Omit<FestEvent, 'id'>) => apiMutate(async () => apiClient.post('/events/', { ...newEv, maximum_participants: newEv.maxParticipants, event_type: newEv.level === 'Senior' ? 'Group' : 'Individual', maximum_marks: 100, number_of_judges: 1, display_order: 0, is_active: true }));
  const handleUpdateEvent = (updatedEv: FestEvent) => apiMutate(async () => apiClient.patch(`/events/${updatedEv.id}/`, { ...updatedEv, maximum_participants: updatedEv.maxParticipants, event_type: updatedEv.level === 'Senior' ? 'Group' : 'Individual', maximum_marks: 100, number_of_judges: 1, display_order: 0, is_active: true }));
  const handleDeleteEvent = (evId: string) => apiMutate(async () => apiClient.delete(`/events/${evId}/`));
  const handleAddRegistration = (studentId: string, eventId: string, category: CategoryType) => apiMutate(async () => apiClient.post('/registrations/', { student: studentId, event: eventId, category }));
  const handleRemoveRegistration = (regId: string) => apiMutate(async () => apiClient.delete(`/registrations/${regId}/`));
  const handleSaveResult = (newResult: EventResultRecord) => setResults((prev) => prev.some((r) => r.eventId === newResult.eventId) ? prev.map((r) => r.eventId === newResult.eventId ? newResult : r) : [...prev, newResult]);
  const handleAddUser = (newUser: Omit<SystemUser, 'id'>) => setUsers((prev) => [{ id: `usr-${Date.now()}`, ...newUser }, ...prev]);
  const handleUpdateUser = (updatedUser: SystemUser) => setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  const handleDeleteUser = (userId: string) => setUsers((prev) => prev.filter((u) => u.id !== userId));

  const registeredParticipantCount = registrations.length > 0 ? new Set(registrations.map((r) => r.studentId)).size : students.filter((s) => s.status !== 'Active').length;
  const pendingCount = students.filter((s) => s.registeredEventIds.length === 0).length;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <LoginPage onLogin={login} schoolName={config.schoolName} festName={config.festName} />;

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} userRole={user!.role} onLogout={handleLogout} studentCount={students.length} registeredParticipantCount={registeredParticipantCount} pendingCount={pendingCount} eventCount={events.length} schoolName={config.schoolName} festName={config.festName} isMobileOpen={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header currentTab={currentTab} onSelectTab={setCurrentTab} userRole={user!.role} onResetData={handleResetData} onOpenQuickRegisterStudent={() => setCurrentTab('registration')} onOpenQuickAddEvent={() => { setCurrentTab('events'); setShowQuickAddEventModal(true); }} onOpenQuickResultEntry={() => setCurrentTab('results')} onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} students={students} events={events} houses={computedHouses} />
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1">
          {currentTab === 'dashboard' && <DashboardView houses={computedHouses} events={events} students={students} registrations={registrations} results={results} onSelectTab={setCurrentTab} onSelectEventForResults={(evId) => { setSelectedResultEventId(evId); setCurrentTab('results'); }} totalSchoolStudentsCount={config.totalStudentsCount} />}
          {currentTab === 'students' && allowedTabs.includes('students') && <StudentManagementView students={students} houses={computedHouses} onAddStudent={handleAddStudent} onBulkImportStudents={handleBulkImportStudents} onUpdateStudent={handleUpdateStudent} onDeleteStudent={handleDeleteStudent} onShowToast={addToast} />}
          {currentTab === 'pending' && allowedTabs.includes('pending') && <PendingStudentsView students={students} houses={computedHouses} onGoToRegistration={() => setCurrentTab('registration')} onShowToast={addToast} />}
          {currentTab === 'registration' && allowedTabs.includes('registration') && <AdminRegistrationView students={students} events={events} houses={computedHouses} registrations={registrations} onAddRegistration={handleAddRegistration} onRemoveRegistration={handleRemoveRegistration} onShowToast={addToast} />}
          {currentTab === 'assignment' && allowedTabs.includes('assignment') && <TeamAssignmentView houseId={teamLeaderHouseId} students={students} events={events} houses={computedHouses} registrations={registrations} onAddRegistration={handleAddRegistration} onRemoveRegistration={handleRemoveRegistration} onShowToast={addToast} />}
          {currentTab === 'houses' && allowedTabs.includes('houses') && <HouseManagementView houses={computedHouses} students={students} onAddHouse={handleAddHouse} onUpdateHouse={handleUpdateHouse} onDeleteHouse={handleDeleteHouse} onShowToast={addToast} />}
          {currentTab === 'events' && allowedTabs.includes('events') && <EventManagementView events={events} registrations={registrations} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} showQuickAddModal={showQuickAddEventModal} onCloseQuickAddModal={() => setShowQuickAddEventModal(false)} onShowToast={addToast} onSelectEventForResults={(evId) => { setSelectedResultEventId(evId); setCurrentTab('results'); }} />}
          {currentTab === 'results' && allowedTabs.includes('results') && <ResultEntryView events={events} students={students} houses={computedHouses} registrations={registrations} results={results} selectedEventId={selectedResultEventId} onSaveResult={handleSaveResult} onShowToast={addToast} />}
          {currentTab === 'leaderboard' && allowedTabs.includes('leaderboard') && <LeaderboardView houses={computedHouses} />}
          {currentTab === 'users' && allowedTabs.includes('users') && <UsersView users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onShowToast={addToast} />}
          {currentTab === 'settings' && allowedTabs.includes('settings') && <SettingsView config={config} onUpdateConfig={setConfig} onResetData={handleResetData} onShowToast={addToast} allDataJson={{ config, events, students, registrations, results, users, houses: baseHouses }} />}
        </main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

export default App;
