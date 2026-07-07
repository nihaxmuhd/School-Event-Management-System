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
const toBackendUserRole = (role: SystemUser['role']) => {
  if (role === 'Admin') return 'ADMIN';
  if (role === 'Manager') return 'MANAGER';
  return 'TEAM_LEADER';
};
const getApiErrorMessage = (error: any) => {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Request failed';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  if (data.errors) {
    if (typeof data.errors === 'string') return data.errors;
    if (Array.isArray(data.errors)) return data.errors.join(', ');
    return Object.entries(data.errors)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
      .join(' | ');
  }
  return Object.entries(data)
    .filter(([k]) => k !== 'success' && k !== 'meta')
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
    .join(' | ') || 'Request failed';
};

export function App() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [config, setConfig] = useState<SchoolFestConfig>(DEFAULT_CONFIG);
  const [baseHouses, setBaseHouses] = useState<House[]>([]);
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [results, setResults] = useState<EventResultRecord[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
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
    setDataLoading(true);
    setDataError(null);
    try {
      const [houses, evs, sts, regs, res, me, leaderboard] = await Promise.all([
        resourceService.getHouses(),
        resourceService.getEvents(),
        resourceService.getStudents(),
        resourceService.getRegistrations(),
        resourceService.getResults(),
        resourceService.getUsers().catch(() => []),
        resourceService.getLeaderboard().catch(() => []),
      ]);
      console.log('[App] Houses fetched from backend:', houses);
      setBaseHouses((leaderboard.length ? leaderboard : houses).length ? (leaderboard.length ? leaderboard : houses) : [emptyHouse('Blue House', 'blue')]);
      setEvents(evs);
      setStudents(sts);
      setRegistrations(regs);
      setResults(res);
      setUsers(me);
    } catch (error: any) {
      setDataError(error?.response?.data?.message || error?.message || 'Failed to load data');
    } finally {
      setDataLoading(false);
    }
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

  const apiMutate = async (fn: () => Promise<any>, successMessage?: string) => {
    try {
      await fn();
      await refreshAll();
      if (successMessage) addToast('Success', successMessage, 'success');
      return true;
    } catch (error: any) {
      addToast('Request Failed', getApiErrorMessage(error), 'error');
      return false;
    }
  };

  const handleLogout = async () => { await logout(); };

  const handleResetData = () => addToast('Unavailable', 'Backend reset endpoint is not implemented yet.', 'info');
  const handleAddStudent = (newSt: Omit<Student, 'id' | 'registeredEventIds'>) => apiMutate(async () => {
    const payload = {
      admission_no: newSt.admissionNo,
      student_name: newSt.name,
      gender: newSt.gender,
      student_class: newSt.className,
      division: newSt.division,
      house: newSt.houseId,
      status: newSt.status,
    };
    console.log('[App] Final student payload sent to API:', payload);
    return apiClient.post('/students/', payload);
  });
  const handleBulkImportStudents = (_: Omit<Student, 'id' | 'registeredEventIds'>[]) => addToast('Import', 'Excel import should use backend import endpoint.', 'info');
  const handleUpdateStudent = (updatedSt: Student) => apiMutate(async () => apiClient.patch(`/students/${updatedSt.id}/`, {
    admission_no: updatedSt.admissionNo,
    student_name: updatedSt.name,
    gender: updatedSt.gender,
    student_class: updatedSt.className,
    division: updatedSt.division,
    house: updatedSt.houseId,
    status: updatedSt.status,
  }));
  const handleDeleteStudent = (stId: string) => apiMutate(async () => apiClient.delete(`/students/${stId}/`));
  const handleAddHouse = (house: Omit<House, 'points' | 'gold' | 'silver' | 'bronze'>) => apiMutate(async () => apiClient.post('/houses/', {
    name: house.name,
    code: house.id.toUpperCase(),
    color: house.color,
    is_active: true,
  }));
  const handleUpdateHouse = (updated: House) => apiMutate(async () => apiClient.patch(`/houses/${updated.id}/`, {
    name: updated.name,
    code: updated.id.toUpperCase(),
    color: updated.color,
    is_active: true,
  }));
  const handleDeleteHouse = (houseId: string) => apiMutate(async () => apiClient.delete(`/houses/${houseId}/`));
  const handleAddEvent = (newEv: Omit<FestEvent, 'id'>) => apiMutate(async () => apiClient.post('/events/', {
    name: newEv.name,
    code: newEv.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category: newEv.category,
    event_type: newEv.level === 'Senior' ? 'Group' : 'Individual',
    maximum_participants: newEv.maxParticipants,
    maximum_team_size: newEv.level === 'Senior' ? 4 : null,
    maximum_marks: 100,
    number_of_judges: 1,
    status: newEv.status === 'Completed' ? 'Completed' : newEv.status === 'In Progress' ? 'Judging' : 'Registration Open',
    display_order: 0,
    is_active: true,
  }));
  const handleUpdateEvent = (updatedEv: FestEvent) => apiMutate(async () => apiClient.patch(`/events/${updatedEv.id}/`, {
    name: updatedEv.name,
    code: updatedEv.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category: updatedEv.category,
    event_type: updatedEv.level === 'Senior' ? 'Group' : 'Individual',
    maximum_participants: updatedEv.maxParticipants,
    maximum_team_size: updatedEv.level === 'Senior' ? 4 : null,
    maximum_marks: 100,
    number_of_judges: 1,
    status: updatedEv.status === 'Completed' ? 'Completed' : updatedEv.status === 'In Progress' ? 'Judging' : 'Registration Open',
    display_order: 0,
    is_active: true,
  }));
  const handleDeleteEvent = (evId: string) => apiMutate(async () => apiClient.delete(`/events/${evId}/`));
  const handleAddRegistration = (studentId: string, eventId: string, category: CategoryType) => apiMutate(async () => apiClient.post('/registrations/', { student: studentId, event: eventId }));
  const handleRemoveRegistration = (regId: string) => apiMutate(async () => apiClient.delete(`/registrations/${regId}/`));
  const handleSaveResult = (newResult: EventResultRecord) => setResults((prev) => prev.some((r) => r.eventId === newResult.eventId) ? prev.map((r) => r.eventId === newResult.eventId ? newResult : r) : [...prev, newResult]);
  const handleAddUser = async (newUser: Omit<SystemUser, 'id'> & { password?: string; username?: string }) => {
    return apiMutate(async () => resourceService.createUser({
      full_name: newUser.name,
      username: newUser.username || '',
      email: newUser.email,
      role: toBackendUserRole(newUser.role),
      password: newUser.password,
      is_active: newUser.status === 'Active',
    }));
  };
  const handleUpdateUser = async (updatedUser: SystemUser & { password?: string; username?: string }) => {
    const payload: any = {
      full_name: updatedUser.name,
      username: updatedUser.username || '',
      email: updatedUser.email,
      role: toBackendUserRole(updatedUser.role),
      is_active: updatedUser.status === 'Active',
    };
    if (updatedUser.password) payload.password = updatedUser.password;
    return apiMutate(async () => resourceService.updateUser(updatedUser.id, {
      ...payload,
    }));
  };
  const handleDeleteUser = async (userId: string) => apiMutate(async () => resourceService.deleteUser(userId));
  const handleResetUserPassword = async (userId: string, password: string) => apiMutate(async () => resourceService.resetUserPassword(userId, password));

  const registeredParticipantCount = registrations.length > 0 ? new Set(registrations.map((r) => r.studentId)).size : students.filter((s) => s.status !== 'Active').length;
  const pendingCount = students.filter((s) => s.registeredEventIds.length === 0).length;

  if (isLoading || dataLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <LoginPage onLogin={login} schoolName={config.schoolName} festName={config.festName} />;
  if (dataError) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-center">
        <h1 className="text-xl font-bold text-slate-900">Unable to load dashboard data</h1>
        <p className="text-sm text-slate-600">{dataError}</p>
        <button onClick={refreshAll} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">Retry</button>
      </div>
    </div>
  );

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
          {currentTab === 'users' && allowedTabs.includes('users') && (
            <UsersView
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onActivateUser={async (userId) => apiMutate(async () => resourceService.activateUser(userId))}
              onDeactivateUser={async (userId) => apiMutate(async () => resourceService.deactivateUser(userId))}
              onResetPassword={handleResetUserPassword}
              onShowToast={addToast}
            />
          )}
          {currentTab === 'settings' && allowedTabs.includes('settings') && <SettingsView config={config} onUpdateConfig={setConfig} onResetData={handleResetData} onShowToast={addToast} allDataJson={{ config, events, students, registrations, results, users, houses: baseHouses }} />}
        </main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

export default App;
