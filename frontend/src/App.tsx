import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
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

import { recalculateHousePoints } from './utils/festivalUtils';
import { House, FestEvent, Student, StudentRegistration, EventResultRecord, SystemUser, SchoolFestConfig, CategoryType, UserRole } from './types/festival';

const ROLE_STORAGE_KEY = 'hidaya_sems_current_role';
const AUTH_STORAGE_KEY = 'hidaya_sems_auth';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

type AuthState = {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  username: string;
};

type DashboardApiHouse = {
  rank: number | null;
  house_id: string;
  house_name: string;
  house_code: string;
  house_color: string;
  total_house_points: number;
  gold_count: number;
  silver_count: number;
  bronze_count: number;
  participation_count?: number;
};

type DashboardApiResponse = {
  total_students: number;
  total_houses: number;
  total_events: number;
  total_registrations: number;
  pending_registrations: number;
  completed_events: number;
  active_events: number;
  total_house_points: number;
  house_rankings: DashboardApiHouse[];
  top_performing_houses: DashboardApiHouse[];
  recent_results: Array<Record<string, any>>;
  participation_statistics: Record<string, number>;
  house?: {
    id: string;
    name: string;
    code: string;
    color: string;
    is_active: boolean;
  };
};

type EventsMeta = {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
};

type DashboardStudent = Student;
type DashboardEvent = FestEvent;
type DashboardRegistration = StudentRegistration;
type DashboardResult = EventResultRecord;

type HouseLeaderboardRow = {
  house_id: string;
  house_name: string;
  house_code: string;
  house_color: string;
  total_house_points: number;
  gold_count: number;
  silver_count: number;
  bronze_count: number;
  participation_count: number;
};

type HouseSummary = {
  total_students: number;
  total_registrations: number;
  total_points: number;
  gold_count: number;
  silver_count: number;
  bronze_count: number;
  rank: number;
};

type LeaderboardRow = HouseLeaderboardRow;

const parseAuthState = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
};

const saveAuthState = (auth: AuthState | null) => {
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    localStorage.setItem(ROLE_STORAGE_KEY, auth.role);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  }
};

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => parseAuthState());
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);

  const [config, setConfig] = useState<SchoolFestConfig>({ schoolName: '', festName: '', academicYear: '', tagline: '', totalStudentsCount: 0, pointSettings: { first: 0, second: 0, third: 0, participation: 0, gradeA: 0, gradeB: 0, gradeC: 0 } });
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [baseHouses, setBaseHouses] = useState<House[]>([]);
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsMeta, setEventsMeta] = useState<EventsMeta | null>(null);
  const [eventsQuery, setEventsQuery] = useState({ search: '', category: 'ALL', status: 'ALL' });
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [results, setResults] = useState<EventResultRecord[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>([]);
  const [judgingScores, setJudgingScores] = useState<Array<{ id: string; registration: string; marks: number; remarks: string }>>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardApiResponse | null>(null);
  const [dashboardEvents, setDashboardEvents] = useState<DashboardEvent[]>([]);
  const [dashboardStudents, setDashboardStudents] = useState<DashboardStudent[]>([]);
  const [dashboardRegistrations, setDashboardRegistrations] = useState<DashboardRegistration[]>([]);
  const [dashboardResults, setDashboardResults] = useState<DashboardResult[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsMeta, setStudentsMeta] = useState<{ count: number; page: number; page_size: number; next: string | null; previous: string | null } | null>(null);
  const [studentsQuery, setStudentsQuery] = useState({ search: '', house: '', student_class: '', division: '', gender: '', status: '' });
  const [housesLoading, setHousesLoading] = useState(false);
  const [housesError, setHousesError] = useState<string | null>(null);
  const [housesData, setHousesData] = useState<House[]>([]);
  const [houseLeaderboard, setHouseLeaderboard] = useState<HouseLeaderboardRow[]>([]);
  const [houseSummaryById, setHouseSummaryById] = useState<Record<string, HouseSummary>>({});
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);

  const userRole = auth?.role ?? null;
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
  const isDashboardRoute = currentTab === 'dashboard';
  const isStudentsRoute = currentTab === 'students' || currentTab === 'pending';

  const mapStudent = (student: any): Student => ({
    id: student.id,
    admissionNo: student.admission_no,
    name: student.student_name,
    className: student.student_class,
    division: student.division,
    gender: student.gender,
    houseId: student.house,
    status: student.status,
    registeredEventIds: [],
  });

  const mapEvent = (event: any): FestEvent => ({
    id: String(event.id),
    name: event.name,
    level: String(event.category || '').toLowerCase().includes('senior') ? 'Senior' : 'Junior',
    category: (event.category || 'Junior Boys') as CategoryType,
    duration: `${Number(event.maximum_marks || 0) || Number(event.maximum_participants || 0)} marks`,
    maxParticipants: Number(event.maximum_participants || 0),
    status:
      event.status === 'Completed'
        ? 'Completed'
        : event.status === 'Judging'
          ? 'In Progress'
          : 'Upcoming',
  });

  const fetchStudents = async (options?: { page?: number; query?: Partial<typeof studentsQuery> }) => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const params = new URLSearchParams();
      params.set('page_size', '20');
      params.set('page', String(options?.page ?? studentsPage));
      const merged = { ...studentsQuery, ...(options?.query || {}) };
      Object.entries(merged).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await axios.get(`/api/v1/students/?${params.toString()}`);
      const payload = response.data?.data ?? response.data;
      const data = Array.isArray(payload) ? payload : payload?.results || [];
      setStudents(Array.isArray(data) ? data.map(mapStudent) : []);
      setStudentsMeta(response.data?.meta || payload?.meta || null);
      if (options?.page) setStudentsPage(options.page);
      if (options?.query) setStudentsQuery(merged);
    } catch (error: any) {
      setStudentsError(error?.response?.data?.message || 'Unable to load students.');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchEvents = async (options?: { page?: number; query?: Partial<typeof eventsQuery> }) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const merged = { ...eventsQuery, ...(options?.query || {}) };
      const params = new URLSearchParams();
      params.set('page_size', '20');
      params.set('page', String(options?.page ?? eventsPage));
      if (merged.search) params.set('search', merged.search);
      if (merged.category && merged.category !== 'ALL') params.set('category', merged.category);
      if (merged.status && merged.status !== 'ALL') params.set('status', merged.status);
      const endpoint = userRole === 'Team Leader' ? '/api/v1/events/active/' : '/api/v1/events/';
      const response = await axios.get(`${endpoint}?${params.toString()}`);
      const payload = response.data?.data ?? response.data;
      const data = Array.isArray(payload) ? payload : payload?.results || [];
      setEvents(Array.isArray(data) ? data.map(mapEvent) : []);
      setEventsMeta(response.data?.meta || payload?.meta || null);
      if (options?.page) setEventsPage(options.page);
      if (options?.query) setEventsQuery(merged);
    } catch (error: any) {
      setEventsError(error?.response?.data?.message || 'Unable to load events.');
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true);
    setRegistrationsError(null);
    try {
      const response = await axios.get('/api/v1/registrations/?page_size=50');
      const payload = response.data?.data ?? response.data;
      const data = Array.isArray(payload) ? payload : payload?.results || [];
      setRegistrations(
        Array.isArray(data)
          ? data.map((registration: any) => ({
              id: String(registration.id),
              studentId: String(registration.student),
              eventId: String(registration.event),
              category: (registration.category_snapshot || 'Junior Boys') as CategoryType,
              registeredAt: registration.registered_at,
            }))
          : []
      );
    } catch (error: any) {
      setRegistrationsError(error?.response?.data?.message || 'Unable to load registrations.');
      setRegistrations([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setConfigLoading(true);
    setConfigError(null);
    try {
      const response = await axios.get('/api/v1/settings/');
      const payload = response.data?.data ?? response.data ?? {};
      setConfig({
        schoolName: payload.school_name ?? config.schoolName,
        festName: payload.festival_name ?? config.festName,
        academicYear: payload.academic_year ?? config.academicYear,
        tagline: config.tagline,
        totalStudentsCount: Number(config.totalStudentsCount),
        pointSettings: {
          first: Number(payload.first_place_points ?? config.pointSettings.first),
          second: Number(payload.second_place_points ?? config.pointSettings.second),
          third: Number(payload.third_place_points ?? config.pointSettings.third),
          participation: Number(payload.participation_points ?? config.pointSettings.participation),
          gradeA: Number(config.pointSettings.gradeA),
          gradeB: Number(config.pointSettings.gradeB),
          gradeC: Number(config.pointSettings.gradeC),
        },
      });
    } catch (error: any) {
      setConfigError(error?.response?.data?.message || 'Unable to load settings.');
    } finally {
      setConfigLoading(false);
    }
  };

  const mapResultScore = (score: any) => ({
    studentId: String(score.student_id ?? score.studentId ?? ''),
    studentName: score.student_name ?? score.studentName ?? '',
    admissionNo: score.admission_no ?? score.admissionNo ?? '',
    houseId: String(score.house_id ?? score.houseId ?? ''),
    marks: Number(score.marks ?? 0),
    grade: (score.grade ?? 'A') as 'A' | 'B' | 'C' | 'D' | 'F',
    position: Number(score.position ?? 0) as 1 | 2 | 3 | 0,
    housePoints: Number(score.house_points ?? score.housePoints ?? 0),
  });

  const mapResultRecord = (record: any): EventResultRecord => ({
    eventId: String(record.event_id ?? record.eventId ?? record.event ?? ''),
    isPublished: Boolean(record.is_published ?? record.isPublished ?? record.published_status),
    publishedAt: record.published_at ?? record.publishedAt,
    scores: Array.isArray(record.scores) ? record.scores.map(mapResultScore) : [],
  });

  const fetchJudgingScores = async () => {
    const response = await axios.get('/api/v1/judging/');
    const payload = response.data?.data ?? response.data;
    const data = Array.isArray(payload) ? payload : payload?.results || [];
    setJudgingScores(
      Array.isArray(data)
        ? data.map((score: any) => ({
            id: String(score.id),
            registration: String(score.registration),
            marks: Number(score.marks ?? 0),
            remarks: score.remarks ?? '',
          }))
        : []
    );
  };

  const fetchResults = async () => {
    setResultsLoading(true);
    setResultsError(null);
    try {
      const [resultsResponse, leaderboardResponse] = await Promise.all([
        axios.get('/api/v1/results/'),
        axios.get('/api/v1/leaderboard/'),
      ]);
      await fetchJudgingScores();
      const unwrap = (payload: any) => payload?.data?.data ?? payload?.data ?? [];
      const resultsRaw = unwrap(resultsResponse);
      const leaderboardRaw = unwrap(leaderboardResponse);
      const mappedResults = Array.isArray(resultsRaw) ? resultsRaw.map(mapResultRecord) : [];
      setResults(mappedResults);
      await fetchJudgingScores();
      setLeaderboardRows(
        Array.isArray(leaderboardRaw)
          ? leaderboardRaw.map((row: any) => ({
              house_id: String(row.house_id ?? row.id ?? ''),
              house_name: row.house_name ?? row.name ?? '',
              house_code: row.house_code ?? row.code ?? '',
              house_color: row.house_color ?? row.color ?? '#94a3b8',
              total_house_points: Number(row.total_house_points ?? row.points ?? 0),
              gold_count: Number(row.gold_count ?? row.gold ?? 0),
              silver_count: Number(row.silver_count ?? row.silver ?? 0),
              bronze_count: Number(row.bronze_count ?? row.bronze ?? 0),
              participation_count: Number(row.participation_count ?? 0),
            }))
          : []
      );
    } catch (error: any) {
      setResultsError(error?.response?.data?.message || 'Unable to load results.');
      setResults([]);
      setLeaderboardRows([]);
    } finally {
      setResultsLoading(false);
    }
  };

  const fetchHouses = async () => {
    setHousesLoading(true);
    setHousesError(null);
    try {
      const [housesResponse, leaderboardResponse] = await Promise.all([
        axios.get('/api/v1/houses/'),
        axios.get('/api/v1/houses/leaderboard/'),
      ]);
      const unwrap = (payload: any) => payload?.data?.data ?? payload?.data ?? [];
      const housesRaw = unwrap(housesResponse);
      const leaderboardRaw = unwrap(leaderboardResponse);
      const housesMapped = Array.isArray(housesRaw)
        ? housesRaw.map((house: any) => ({
            id: house.id,
            name: house.name,
            color: house.color,
            bgLight: 'bg-slate-50',
            badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
            textColor: 'text-slate-700',
            borderColor: 'border-slate-200',
            captainName: '',
            points: 0,
            gold: 0,
            silver: 0,
            bronze: 0,
          }))
        : [];
      const mappedLeaderboard = Array.isArray(leaderboardRaw)
        ? leaderboardRaw.map((row: any) => ({
            house_id: row.house_id,
            house_name: row.house_name,
            house_code: row.house_code,
            house_color: row.house_color,
            total_house_points: Number(row.total_house_points || 0),
            gold_count: Number(row.gold_count || 0),
            silver_count: Number(row.silver_count || 0),
            bronze_count: Number(row.bronze_count || 0),
            participation_count: Number(row.participation_count || 0),
          }))
        : [];

      const leaderboardMap = new Map(mappedLeaderboard.map((row) => [String(row.house_id), row]));
      const merged = housesMapped.map((house) => {
        const row = leaderboardMap.get(String(house.id));
        return {
          ...house,
          points: row?.total_house_points ?? 0,
          gold: row?.gold_count ?? 0,
          silver: row?.silver_count ?? 0,
          bronze: row?.bronze_count ?? 0,
        };
      });
      setHousesData(merged);
      setHouseLeaderboard(mappedLeaderboard);

      const summaries: Record<string, HouseSummary> = {};
      for (const house of merged) {
        try {
          const summaryResponse = await axios.get(`/api/v1/houses/${house.id}/summary/`);
          const summary = summaryResponse.data?.data ?? summaryResponse.data ?? {};
          summaries[String(house.id)] = {
            total_students: Number(summary.total_students || 0),
            total_registrations: Number(summary.total_registrations || 0),
            total_points: Number(summary.total_points || 0),
            gold_count: Number(summary.gold_count || 0),
            silver_count: Number(summary.silver_count || 0),
            bronze_count: Number(summary.bronze_count || 0),
            rank: Number(summary.rank || 0),
          };
        } catch {
          summaries[String(house.id)] = {
            total_students: 0,
            total_registrations: 0,
            total_points: 0,
            gold_count: 0,
            silver_count: 0,
            bronze_count: 0,
            rank: 0,
          };
        }
      }
      setHouseSummaryById(summaries);
    } catch (error: any) {
      setHousesError(error?.response?.data?.message || 'Unable to load houses.');
      setHousesData([]);
      setHouseLeaderboard([]);
      setHouseSummaryById({});
    } finally {
      setHousesLoading(false);
    }
  };

  useEffect(() => {
    const requestId = axios.interceptors.request.use((request) => {
      const latest = parseAuthState();
      if (latest?.accessToken) {
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${latest.accessToken}`;
      }
      return request;
    });

    const responseId = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const latest = parseAuthState();
        if (error.response?.status === 401 && latest?.refreshToken && !originalRequest?._retry) {
          originalRequest._retry = true;
          try {
            const refreshResponse = await axios.post('/api/v1/auth/token/refresh/', { refresh: latest.refreshToken });
            const nextAuth = { ...latest, accessToken: refreshResponse.data.access };
            saveAuthState(nextAuth);
            setAuth(nextAuth);
            originalRequest.headers.Authorization = `Bearer ${nextAuth.accessToken}`;
            return axios(originalRequest);
          } catch {
            saveAuthState(null);
            setAuth(null);
          }
        }
        return Promise.reject(error);
      }
    );

    setTokenReady(true);
    return () => {
      axios.interceptors.request.eject(requestId);
      axios.interceptors.response.eject(responseId);
    };
  }, []);

  const handleLogin = async ({ username, password, role }: { username: string; password: string; role: UserRole }) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await axios.post('/api/v1/auth/token/', { username, password });
      const nextAuth = {
        accessToken: response.data.access,
        refreshToken: response.data.refresh,
        role,
        username,
      };
      saveAuthState(nextAuth);
      setAuth(nextAuth);
      setCurrentTab('dashboard');
      addToast('Login Successful', `Signed in as ${role}`, 'success');
    } catch (error: any) {
      setLoginError(error?.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    saveAuthState(null);
    setAuth(null);
    addToast('Logged Out', 'Returned to role selection screen.', 'info');
  };

  const fetchDashboard = async () => {
    if (!userRole) return;
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const endpoint =
        userRole === 'Super Admin'
          ? '/api/v1/dashboard/admin/'
          : userRole === 'Admin'
            ? '/api/v1/dashboard/admin/'
            : userRole === 'Manager'
              ? '/api/v1/dashboard/manager/'
              : '/api/v1/dashboard/team-leader/';
      const response = await axios.get(endpoint);
      setDashboardData(response.data.data ?? response.data);

      const [studentsResponse, eventsResponse, registrationsResponse, resultsResponse] = await Promise.all([
        axios.get('/api/v1/students/?page_size=20'),
        axios.get('/api/v1/events/?page_size=20'),
        axios.get('/api/v1/registrations/?page_size=20'),
        axios.get('/api/v1/results/?page_size=20'),
      ]);

      const unwrap = (payload: any) => payload?.data?.data ?? payload?.data ?? [];

      setDashboardStudents(
        unwrap(studentsResponse).map((student: any) => ({
          id: student.id,
          admissionNo: student.admission_no,
          name: student.student_name,
          className: student.student_class,
          division: student.division,
          gender: student.gender,
          houseId: student.house,
          status: student.status,
          registeredEventIds: [],
        }))
      );
      setDashboardEvents(
        unwrap(eventsResponse).map((event: any) => ({
          id: event.id,
          name: event.name,
          level: event.category?.toLowerCase().includes('senior') ? 'Senior' : 'Junior',
          category: event.category,
          duration: `${event.maximum_participants} participants`,
          maxParticipants: event.maximum_participants,
          status: event.status === 'Completed' ? 'Completed' : event.status === 'Judging' ? 'In Progress' : 'Upcoming',
        }))
      );
      setDashboardRegistrations(
        unwrap(registrationsResponse).map((registration: any) => ({
          id: registration.id,
          studentId: registration.student,
          eventId: registration.event,
          category: registration.category_snapshot,
          registeredAt: registration.registered_at,
        }))
      );
      setDashboardResults(
        unwrap(resultsResponse).map((result: any) => ({
          eventId: result.registration?.event || result.eventId || result.registration,
          isPublished: Boolean(result.published_status),
          publishedAt: result.published_at,
          scores: [
            {
              studentId: result.registration?.student || result.studentId || '',
              studentName: result.student_name || '',
              admissionNo: result.admission_no || '',
              houseId: '',
              marks: Number(result.final_score || 0),
              grade: 'A',
              position: result.position || 0,
              housePoints: Number(result.house_points || 0),
            },
          ],
        }))
      );
    } catch (error: any) {
      setDashboardError(error?.response?.data?.message || 'Unable to load dashboard data.');
      setDashboardData(null);
      setDashboardEvents([]);
      setDashboardStudents([]);
      setDashboardRegistrations([]);
      setDashboardResults([]);
    } finally {
      setDashboardLoading(false);
    }
  };

  const allowedTabs = useMemo(() => {
    if (!userRole) return [];
    return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Admin'];
  }, [userRole]);

  useEffect(() => {
    if (userRole && !allowedTabs.includes(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [userRole, currentTab, allowedTabs]);

  useEffect(() => {
    if (userRole && isDashboardRoute) {
      void fetchDashboard();
    }
  }, [userRole, isDashboardRoute]);

  useEffect(() => {
    if (userRole && isStudentsRoute) {
      void fetchStudents({ page: 1 });
    }
  }, [userRole, isStudentsRoute]);

  useEffect(() => {
    if (userRole && allowedTabs.includes('events')) {
      void fetchEvents({ page: 1 });
    }
  }, [userRole, allowedTabs]);

  useEffect(() => {
    if (userRole) {
      void fetchRegistrations();
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole && allowedTabs.includes('houses')) {
      void fetchHouses();
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole && allowedTabs.includes('settings')) {
      void fetchSettings();
    }
  }, [userRole, allowedTabs]);

  useEffect(() => {
    if (userRole && allowedTabs.includes('results')) {
      void fetchResults();
    }
  }, [userRole, allowedTabs]);

  // Handlers
  const handleResetData = () => {
    addToast('Unavailable', 'Client-side reset has been removed in production mode.', 'info');
  };

  const handleAddStudent = (newSt: Omit<Student, 'id' | 'registeredEventIds'>) => {
    void (async () => {
      setStudentsLoading(true);
      setStudentsError(null);
      try {
        await axios.post('/api/v1/students/', {
          admission_no: newSt.admissionNo,
          student_name: newSt.name,
          student_class: newSt.className,
          division: newSt.division,
          gender: newSt.gender,
          house: newSt.houseId,
          status: newSt.status,
        });
        await fetchStudents({ page: studentsPage });
      } catch (error: any) {
        setStudentsError(error?.response?.data?.message || 'Unable to add student.');
        throw error;
      } finally {
        setStudentsLoading(false);
      }
    })();
  };

  const handleUpdateConfig = (nextConfig: SchoolFestConfig) => {
    void (async () => {
      setConfigLoading(true);
      setConfigError(null);
      try {
        await axios.patch('/api/v1/settings/', {
          school_name: nextConfig.schoolName,
          festival_name: nextConfig.festName,
          academic_year: nextConfig.academicYear,
          maximum_participation_limit: nextConfig.totalStudentsCount,
          maximum_group_size: 0,
          first_place_points: nextConfig.pointSettings.first,
          second_place_points: nextConfig.pointSettings.second,
          third_place_points: nextConfig.pointSettings.third,
          participation_points: nextConfig.pointSettings.participation,
          maximum_marks: 100,
          judging_method: 'Average',
        });
        setConfig(nextConfig);
        addToast('Settings Saved', 'System settings updated from backend.');
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.response?.data?.detail || 'Unable to save settings.';
        setConfigError(message);
        throw error;
      } finally {
        setConfigLoading(false);
      }
    })();
  };

  const handleBulkImportStudents = (newStudents: Omit<Student, 'id' | 'registeredEventIds'>[]) => {
    void (async () => {
      for (const student of newStudents) {
        await axios.post('/api/v1/students/', {
          admission_no: student.admissionNo,
          student_name: student.name,
          student_class: student.className,
          division: student.division,
          gender: student.gender,
          house: student.houseId,
          status: student.status,
        });
      }
      await fetchStudents({ page: studentsPage });
    })();
  };

  const handleAddHouse = (house: Omit<House, 'points' | 'gold' | 'silver' | 'bronze'>) => {
    void (async () => {
      await axios.post('/api/v1/houses/', {
        id: house.id,
        name: house.name,
        code: house.id.toUpperCase(),
        color: house.color,
        is_active: true,
      });
      await fetchHouses();
    })();
  };

  const handleUpdateHouse = (updated: House) => {
    void (async () => {
      await axios.patch(`/api/v1/houses/${updated.id}/`, {
        name: updated.name,
        code: updated.id.toUpperCase(),
        color: updated.color,
        is_active: true,
      });
      await fetchHouses();
    })();
  };

  const handleDeleteHouse = (houseId: string) => {
    void (async () => {
      await axios.delete(`/api/v1/houses/${houseId}/`);
      await fetchHouses();
    })();
  };

  const handleUpdateStudent = (updatedSt: Student) => {
    void (async () => {
      await axios.patch(`/api/v1/students/${updatedSt.id}/`, {
        admission_no: updatedSt.admissionNo,
        student_name: updatedSt.name,
        student_class: updatedSt.className,
        division: updatedSt.division,
        gender: updatedSt.gender,
        house: updatedSt.houseId,
        status: updatedSt.status,
      });
      await fetchStudents({ page: studentsPage });
    })();
  };

  const handleDeleteStudent = (stId: string) => {
    void (async () => {
      await axios.delete(`/api/v1/students/${stId}/`);
      await fetchStudents({ page: studentsPage });
    })();
  };

  const handleAddRegistration = (studentId: string, eventId: string, category: CategoryType) => {
    void (async () => {
      setRegistrationsLoading(true);
      setRegistrationsError(null);
      try {
        await axios.post('/api/v1/registrations/', {
          student: studentId,
          event: eventId,
          category_snapshot: category,
        });
        await fetchRegistrations();
      } catch (error: any) {
        setRegistrationsError(error?.response?.data?.message || error?.response?.data?.detail || 'Unable to add registration.');
        throw error;
      } finally {
        setRegistrationsLoading(false);
      }
    })();
  };

  const handleRemoveRegistration = (regId: string) => {
    void (async () => {
      setRegistrationsLoading(true);
      setRegistrationsError(null);
      try {
        await axios.delete(`/api/v1/registrations/${regId}/`);
        await fetchRegistrations();
      } catch (error: any) {
        setRegistrationsError(error?.response?.data?.message || error?.response?.data?.detail || 'Unable to remove registration.');
        throw error;
      } finally {
        setRegistrationsLoading(false);
      }
    })();
  };

  const handleAddEvent = (newEv: Omit<FestEvent, 'id'>) => {
    void (async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        await axios.post('/api/v1/events/', {
          name: newEv.name,
          category: newEv.category,
          event_type: newEv.level,
          maximum_participants: newEv.maxParticipants,
          maximum_team_size: newEv.maxParticipants,
          maximum_marks: Number.parseInt(newEv.duration, 10) || 0,
          number_of_judges: 0,
          status: newEv.status,
          display_order: 0,
          is_active: newEv.status !== 'Completed',
        });
        await fetchEvents({ page: eventsPage, query: eventsQuery });
      } catch (error: any) {
        setEventsError(
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          'Unable to add event.'
        );
        throw error;
      } finally {
        setEventsLoading(false);
      }
    })();
  };

  const handleUpdateEvent = (updatedEv: FestEvent) => {
    void (async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        await axios.patch(`/api/v1/events/${updatedEv.id}/`, {
          name: updatedEv.name,
          category: updatedEv.category,
          event_type: updatedEv.level,
          maximum_participants: updatedEv.maxParticipants,
          maximum_team_size: updatedEv.maxParticipants,
          maximum_marks: Number.parseInt(updatedEv.duration, 10) || 0,
          number_of_judges: 0,
          status: updatedEv.status,
          display_order: 0,
          is_active: updatedEv.status !== 'Completed',
        });
        await fetchEvents({ page: eventsPage, query: eventsQuery });
      } catch (error: any) {
        setEventsError(
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          'Unable to update event.'
        );
        throw error;
      } finally {
        setEventsLoading(false);
      }
    })();
  };

  const handleDeleteEvent = (evId: string) => {
    void (async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        await axios.delete(`/api/v1/events/${evId}/`);
        await fetchEvents({ page: eventsPage, query: eventsQuery });
      } catch (error: any) {
        setEventsError(
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          'Unable to delete event.'
        );
        throw error;
      } finally {
        setEventsLoading(false);
      }
    })();
  };

  const handleSaveResult = (newResult: EventResultRecord) => {
    void (async () => {
      setResultsLoading(true);
      setResultsError(null);
      try {
        const registrationsForEvent = registrations.filter((r) => r.eventId === newResult.eventId);
        for (const score of newResult.scores) {
          const registration = registrationsForEvent.find((r) => r.studentId === score.studentId);
          if (!registration) continue;
          const existingJudging = judgingScores.find((item) => item.registration === registration.id);
          const payload = {
            registration: registration.id,
            marks: score.marks,
            remarks: '',
          };
          if (existingJudging) {
            await axios.patch(`/api/v1/judging/${existingJudging.id}/`, payload);
          } else {
            await axios.post('/api/v1/judging/', payload);
          }
        }
        if (newResult.isPublished) {
          await axios.post(`/api/v1/results/${newResult.eventId}/publish/`);
        } else {
          await axios.post(`/api/v1/results/${newResult.eventId}/recalculate/`);
        }
        await fetchResults();
      } catch (error: any) {
        setResultsError(error?.response?.data?.message || error?.response?.data?.detail || 'Unable to save result.');
        throw error;
      } finally {
        setResultsLoading(false);
      }
    })();
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
  const teamLeaderHouseId = users.find(u => u.role === 'Team Leader' && u.houseId)?.houseId || housesData[0]?.id;
  const liveHouses = housesData.length > 0 ? housesData : baseHouses;
  const dashboardHouses = dashboardData?.house_rankings?.map((ranked, index) => ({
    id: ranked.house_id || `house-${index}`,
    name: ranked.house_name || 'House',
    color: ranked.house_color || '#94a3b8',
    bgLight: 'bg-slate-50',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    captainName: '',
    points: ranked.total_house_points || 0,
    gold: ranked.gold_count || 0,
    silver: ranked.silver_count || 0,
    bronze: ranked.bronze_count || 0,
  })) || [];

  const liveDashboardEvents = dashboardEvents.length > 0 ? dashboardEvents : events;
  const liveDashboardStudents = dashboardStudents.length > 0 ? dashboardStudents : students;
  const liveDashboardRegistrations = dashboardRegistrations.length > 0 ? dashboardRegistrations : registrations;
  const liveDashboardResults = dashboardResults.length > 0 ? dashboardResults : results;

  // If no role selected, render the Role Selection Login Screen
  if (!tokenReady) {
    return null;
  }

  if (!userRole) {
    return (
      <>
        <RoleSelectionLogin
          onLogin={handleLogin}
          schoolName={config.schoolName}
          festName={config.festName}
          loading={loginLoading}
          error={loginError}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

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
            if (!auth) return;
            const nextAuth = { ...auth, role: newRole };
            saveAuthState(nextAuth);
            setAuth(nextAuth);
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
              houses={dashboardHouses.length > 0 ? dashboardHouses : computedHouses}
              events={liveDashboardEvents}
              students={liveDashboardStudents}
              registrations={liveDashboardRegistrations}
              results={liveDashboardResults}
              onSelectTab={setCurrentTab}
              onSelectEventForResults={(evId) => {
                setSelectedResultEventId(evId);
                setCurrentTab('results');
              }}
              totalSchoolStudentsCount={config.totalStudentsCount}
              dashboardData={dashboardData}
              loading={dashboardLoading}
              error={dashboardError}
              onRetry={fetchDashboard}
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
              loading={studentsLoading}
              error={studentsError}
              onRetry={() => void fetchStudents({ page: studentsPage })}
              onSearch={(search) => void fetchStudents({ page: 1, query: { search } })}
              onFilterChange={(filters) => void fetchStudents({ page: 1, query: filters })}
              pagination={studentsMeta}
              onPageChange={(page) => void fetchStudents({ page })}
            />
          )}

          {currentTab === 'pending' && allowedTabs.includes('pending') && (
            <PendingStudentsView
              students={students}
              houses={computedHouses}
              onGoToRegistration={() => setCurrentTab('registration')}
              onShowToast={addToast}
              loading={studentsLoading}
              error={studentsError}
              onRetry={() => void fetchStudents({ page: 1, query: { status: 'Active' } })}
            />
          )}

          {currentTab === 'registration' && allowedTabs.includes('registration') && (
            <>
              {registrationsError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs flex items-center justify-between gap-3">
                  <span>{registrationsError}</span>
                  <button onClick={fetchRegistrations} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold">
                    Retry
                  </button>
                </div>
              )}
              {registrationsLoading && (
                <div className="mb-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-sm text-slate-600">
                  Loading registrations...
                </div>
              )}
              <AdminRegistrationView
                students={students}
                events={events}
                houses={computedHouses}
                registrations={registrations}
                onAddRegistration={handleAddRegistration}
                onRemoveRegistration={handleRemoveRegistration}
                onShowToast={addToast}
              />
            </>
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
              houses={liveHouses}
              students={students}
              onAddHouse={handleAddHouse}
              onUpdateHouse={handleUpdateHouse}
              onDeleteHouse={handleDeleteHouse}
              onShowToast={addToast}
              loading={housesLoading}
              error={housesError}
              onRetry={fetchHouses}
              leaderboard={houseLeaderboard}
              summaries={houseSummaryById}
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
              loading={eventsLoading}
              error={eventsError}
              onRetry={() => void fetchEvents({ page: eventsPage, query: eventsQuery })}
              pagination={eventsMeta}
              onSearch={(search) => void fetchEvents({ page: 1, query: { search } })}
              onFilterChange={(filters) => void fetchEvents({ page: 1, query: filters })}
              onPageChange={(page) => void fetchEvents({ page })}
              canEditEvents={userRole === 'Admin' || userRole === 'Super Admin'}
              canDeleteEvents={userRole === 'Admin' || userRole === 'Super Admin'}
              readOnly={userRole === 'Manager' || userRole === 'Team Leader'}
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
              loading={resultsLoading}
              error={resultsError}
              onRetry={fetchResults}
            />
          )}

          {currentTab === 'leaderboard' && allowedTabs.includes('leaderboard') && (
            <LeaderboardView
              houses={leaderboardRows.length > 0 ? leaderboardRows.map((row) => ({
                id: row.house_id,
                name: row.house_name,
                color: row.house_color,
                bgLight: 'bg-slate-50',
                badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
                textColor: 'text-slate-700',
                borderColor: 'border-slate-200',
                captainName: row.house_code,
                points: row.total_house_points,
                gold: row.gold_count,
                silver: row.silver_count,
                bronze: row.bronze_count,
              })) : computedHouses}
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
            <>
              {configError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs flex items-center justify-between gap-3">
                  <span>{configError}</span>
                  <button onClick={fetchSettings} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold">
                    Retry
                  </button>
                </div>
              )}
              {configLoading && (
                <div className="mb-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-sm text-slate-600">
                  Loading settings...
                </div>
              )}
              <SettingsView
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onResetData={handleResetData}
                onShowToast={addToast}
              />
            </>
          )}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
