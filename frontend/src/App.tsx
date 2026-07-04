import { useState, useEffect } from 'react';
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
import { RoleSelectionLogin } from './components/auth/RoleSelectionLogin';
import { ToastContainer, ToastMessage } from './components/common/Toast';

import { loadStoredData, saveToStorage, resetAllData } from './utils/storage';
import { recalculateHousePoints } from './utils/festivalUtils';
import { House, FestEvent, Student, StudentRegistration, EventResultRecord, SystemUser, SchoolFestConfig, CategoryType, UserRole } from './types/festival';

const ROLE_STORAGE_KEY = 'hidaya_sems_current_role';

export function App() {
  const initialData = loadStoredData();

  // Active Role state (loads from localStorage or null if not logged in)
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    return (saved as UserRole) || null;
  });

  const [config, setConfig] = useState<SchoolFestConfig>(initialData.config);
  const [baseHouses, setBaseHouses] = useState<House[]>(initialData.houses);
  const [events, setEvents] = useState<FestEvent[]>(initialData.events);
  const [students, setStudents] = useState<Student[]>(initialData.students);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>(initialData.registrations);
  const [results, setResults] = useState<EventResultRecord[]>(initialData.results);
  const [users, setUsers] = useState<SystemUser[]>(initialData.users);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Selected event for direct navigation to result desk
  const [selectedResultEventId, setSelectedResultEventId] = useState<string | undefined>(undefined);

  // Quick Action Modal Triggers
  const [showQuickAddEventModal, setShowQuickAddEventModal] = useState(false);

  // Mobile Sidebar Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast Alerts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Re-calculate dynamic house standings whenever results change
  const computedHouses = recalculateHousePoints(baseHouses, results);

  // Handle Role Selection / Login
  const handleSelectRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    setCurrentTab('dashboard');
    addToast('Welcome Staff Member', `Logged in as ${role} for ${config.schoolName}`, 'info');
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    addToast('Logged Out', 'Returned to role selection screen.', 'info');
  };

  // Tab Access Guard: If current tab is not allowed for active role, redirect to dashboard
  useEffect(() => {
    if (userRole) {
      const allowed = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Admin'];
      if (!allowed.includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  }, [userRole, currentTab]);

  // Auto-save data states to localStorage
  useEffect(() => {
    saveToStorage('EVENTS', events);
  }, [events]);

  useEffect(() => {
    saveToStorage('STUDENTS', students);
  }, [students]);

  useEffect(() => {
    saveToStorage('REGISTRATIONS', registrations);
  }, [registrations]);

  useEffect(() => {
    saveToStorage('RESULTS', results);
  }, [results]);

  useEffect(() => {
    saveToStorage('USERS', users);
  }, [users]);

  useEffect(() => {
    saveToStorage('CONFIG', config);
  }, [config]);

  useEffect(() => {
    saveToStorage('HOUSES', baseHouses);
  }, [baseHouses]);

  // Handlers
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all SEMS data back to initial Hidaya School sample values?')) {
      resetAllData();
      const fresh = loadStoredData();
      setConfig(fresh.config);
      setBaseHouses(fresh.houses);
      setEvents(fresh.events);
      setStudents(fresh.students);
      setRegistrations(fresh.registrations);
      setResults(fresh.results);
      setUsers(fresh.users);
      addToast('Data Reset', 'Restored Hidaya School English Fest 2026 dataset.', 'info');
    }
  };

  const handleAddStudent = (newSt: Omit<Student, 'id' | 'registeredEventIds'>) => {
    const id = `st-${Date.now()}`;
    const fullSt: Student = {
      ...newSt,
      id,
      registeredEventIds: []
    };
    setStudents((prev) => [fullSt, ...prev]);
  };

  const handleBulkImportStudents = (newStudents: Omit<Student, 'id' | 'registeredEventIds'>[]) => {
    const fullList: Student[] = newStudents.map((s, i) => ({
      ...s,
      id: `st-${Date.now()}-${i}`,
      registeredEventIds: []
    }));
    setStudents((prev) => [...fullList, ...prev]);
  };

  const handleAddHouse = (house: Omit<House, 'points' | 'gold' | 'silver' | 'bronze'>) => {
    const fullHouse: House = { ...house, points: 0, gold: 0, silver: 0, bronze: 0 };
    setBaseHouses((prev) => [...prev, fullHouse]);
  };

  const handleUpdateHouse = (updated: House) => {
    setBaseHouses((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleDeleteHouse = (houseId: string) => {
    setBaseHouses((prev) => prev.filter((h) => h.id !== houseId));
  };

  const handleUpdateStudent = (updatedSt: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedSt.id ? updatedSt : s)));
  };

  const handleDeleteStudent = (stId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== stId));
    setRegistrations((prev) => prev.filter((r) => r.studentId !== stId));
  };

  const handleAddRegistration = (studentId: string, eventId: string, category: CategoryType) => {
    const id = `reg-${Date.now()}`;
    const newReg: StudentRegistration = {
      id,
      studentId,
      eventId,
      category,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setRegistrations((prev) => [newReg, ...prev]);

    // Update student's registeredEventIds array
    setStudents((prev) => prev.map(st => {
      if (st.id === studentId && !st.registeredEventIds.includes(eventId)) {
        return {
          ...st,
          status: 'Registered',
          registeredEventIds: [...st.registeredEventIds, eventId]
        };
      }
      return st;
    }));
  };

  const handleRemoveRegistration = (regId: string) => {
    const targetReg = registrations.find(r => r.id === regId);
    setRegistrations((prev) => prev.filter((r) => r.id !== regId));

    if (targetReg) {
      setStudents((prev) => prev.map(st => {
        if (st.id === targetReg.studentId) {
          return {
            ...st,
            registeredEventIds: st.registeredEventIds.filter(id => id !== targetReg.eventId)
          };
        }
        return st;
      }));
    }
  };

  const handleAddEvent = (newEv: Omit<FestEvent, 'id'>) => {
    const id = `ev-${Date.now()}`;
    const fullEv: FestEvent = {
      ...newEv,
      id
    };
    setEvents((prev) => [fullEv, ...prev]);
  };

  const handleUpdateEvent = (updatedEv: FestEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEv.id ? updatedEv : e)));
  };

  const handleDeleteEvent = (evId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== evId));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== evId));
  };

  const handleSaveResult = (newResult: EventResultRecord) => {
    setResults((prev) => {
      const exists = prev.some((r) => r.eventId === newResult.eventId);
      if (exists) {
        return prev.map((r) => (r.eventId === newResult.eventId ? newResult : r));
      } else {
        return [...prev, newResult];
      }
    });

    if (newResult.isPublished) {
      setEvents((prev) =>
        prev.map((e) => (e.id === newResult.eventId ? { ...e, status: 'Completed' } : e))
      );
    }
  };

  const handleAddUser = (newUser: Omit<SystemUser, 'id'>) => {
    const id = `usr-${Date.now()}`;
    setUsers((prev) => [{ id, ...newUser }, ...prev]);
  };

  const handleUpdateUser = (updatedUser: SystemUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const registeredParticipantCount = registrations.length > 0 
    ? new Set(registrations.map(r => r.studentId)).size 
    : students.filter(s => s.status === 'Registered' || s.status === 'Checked-In' || s.registeredEventIds.length > 0).length;

  const pendingCount = students.filter(s => s.registeredEventIds.length === 0).length;

  // The House this Team Leader manages (first team-leader user with a house, fallback to first house)
  const teamLeaderHouseId = users.find(u => u.role === 'Team Leader' && u.houseId)?.houseId || baseHouses[0]?.id;

  // If no role selected, render the Role Selection Login Screen
  if (!userRole) {
    return (
      <>
        <RoleSelectionLogin
          onSelectRole={handleSelectRole}
          schoolName={config.schoolName}
          festName={config.festName}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  const allowedTabs = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Admin'];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onLogout={handleLogout}
        studentCount={students.length}
        registeredParticipantCount={registeredParticipantCount}
        pendingCount={pendingCount}
        eventCount={events.length}
        schoolName={config.schoolName}
        festName={config.festName}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={userRole}
          onChangeRole={(newRole) => {
            setUserRole(newRole);
            localStorage.setItem(ROLE_STORAGE_KEY, newRole);
            addToast('Switched Access Role', `You are now operating as ${newRole}`, 'info');
          }}
          onResetData={handleResetData}
          onOpenQuickRegisterStudent={() => setCurrentTab('registration')}
          onOpenQuickAddEvent={() => {
            setCurrentTab('events');
            setShowQuickAddEventModal(true);
          }}
          onOpenQuickResultEntry={() => setCurrentTab('results')}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          students={students}
          events={events}
          houses={computedHouses}
        />

        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              houses={computedHouses}
              events={events}
              students={students}
              registrations={registrations}
              results={results}
              onSelectTab={setCurrentTab}
              onSelectEventForResults={(evId) => {
                setSelectedResultEventId(evId);
                setCurrentTab('results');
              }}
              totalSchoolStudentsCount={config.totalStudentsCount}
            />
          )}

          {currentTab === 'students' && allowedTabs.includes('students') && (
            <StudentManagementView
              students={students}
              houses={computedHouses}
              onAddStudent={handleAddStudent}
              onBulkImportStudents={handleBulkImportStudents}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'pending' && allowedTabs.includes('pending') && (
            <PendingStudentsView
              students={students}
              houses={computedHouses}
              onGoToRegistration={() => setCurrentTab('registration')}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'registration' && allowedTabs.includes('registration') && (
            <AdminRegistrationView
              students={students}
              events={events}
              houses={computedHouses}
              registrations={registrations}
              onAddRegistration={handleAddRegistration}
              onRemoveRegistration={handleRemoveRegistration}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'assignment' && allowedTabs.includes('assignment') && (
            <TeamAssignmentView
              houseId={teamLeaderHouseId}
              students={students}
              events={events}
              houses={computedHouses}
              registrations={registrations}
              onAddRegistration={handleAddRegistration}
              onRemoveRegistration={handleRemoveRegistration}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'houses' && allowedTabs.includes('houses') && (
            <HouseManagementView
              houses={computedHouses}
              students={students}
              onAddHouse={handleAddHouse}
              onUpdateHouse={handleUpdateHouse}
              onDeleteHouse={handleDeleteHouse}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'events' && allowedTabs.includes('events') && (
            <EventManagementView
              events={events}
              registrations={registrations}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              showQuickAddModal={showQuickAddEventModal}
              onCloseQuickAddModal={() => setShowQuickAddEventModal(false)}
              onShowToast={addToast}
              onSelectEventForResults={(evId) => {
                setSelectedResultEventId(evId);
                setCurrentTab('results');
              }}
            />
          )}

          {currentTab === 'results' && allowedTabs.includes('results') && (
            <ResultEntryView
              events={events}
              students={students}
              houses={computedHouses}
              registrations={registrations}
              results={results}
              selectedEventId={selectedResultEventId}
              onSaveResult={handleSaveResult}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'leaderboard' && allowedTabs.includes('leaderboard') && (
            <LeaderboardView
              houses={computedHouses}
            />
          )}

          {currentTab === 'users' && allowedTabs.includes('users') && (
            <UsersView
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'settings' && allowedTabs.includes('settings') && (
            <SettingsView
              config={config}
              onUpdateConfig={setConfig}
              onResetData={handleResetData}
              onShowToast={addToast}
              allDataJson={{ config, events, students, registrations, results, users, houses: baseHouses }}
            />
          )}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
