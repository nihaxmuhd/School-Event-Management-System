import { apiClient } from './client';
import type { EventResultRecord, FestEvent, House, SchoolFestConfig, Student, StudentRegistration, SystemUser } from '../types/festival';

type ApiResponse<T> = { success?: boolean; message?: string; data?: T; errors?: unknown; meta?: unknown };

const unwrap = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
};

const fetchList = async <T>(url: string): Promise<T[]> => {
  const response = await apiClient.get(url);
  const payload = response.data;
  const items = Array.isArray(payload) ? payload : unwrap<any[]>(payload);
  return (items || []) as T[];
};

const toHouse = (item: any): House => ({
  id: item.id,
  name: item.name,
  color: item.color,
  bgLight: 'bg-slate-50',
  badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
  textColor: 'text-slate-600',
  borderColor: 'border-slate-400',
  captainName: item.captainName || '',
  points: item.total_house_points ?? 0,
  gold: item.gold_count ?? 0,
  silver: item.silver_count ?? 0,
  bronze: item.bronze_count ?? 0,
});

const toEvent = (item: any): FestEvent => ({
  id: item.id,
  name: item.name,
  level: item.event_type === 'Group' ? 'Senior' : 'Junior',
  category: item.category,
  duration: `${item.maximum_marks || 0} marks`,
  maxParticipants: item.maximum_participants ?? 0,
  status: item.status === 'Completed' || item.status === 'Published' ? 'Completed' : item.status === 'Judging' ? 'In Progress' : 'Upcoming',
});

const toStudent = (item: any): Student => ({
  id: item.id,
  admissionNo: item.admission_no,
  name: item.student_name,
  className: item.student_class,
  division: item.division,
  gender: item.gender,
  houseId: item.house,
  status: item.status,
  registeredEventIds: [],
});

const toRegistration = (item: any): StudentRegistration => ({
  id: item.id,
  studentId: item.student,
  eventId: item.event,
  category: item.category_snapshot,
  registeredAt: item.registered_at,
});

const toResult = (item: any): EventResultRecord => ({
  eventId: item.registration?.event || item.event_id,
  isPublished: item.published_status ?? false,
  publishedAt: item.published_at || undefined,
  scores: [],
});

const toUser = (item: any): SystemUser => ({
  id: String(item.id),
  name: [item.first_name, item.last_name].filter(Boolean).join(' ') || item.username,
  email: item.email,
  role: item.role,
  department: '',
  status: 'Active',
});

export const resourceService = {
  getConfig: async (): Promise<SchoolFestConfig> => ({
    schoolName: 'Hidaya School',
    festName: 'English Fest',
    academicYear: '2025-2026',
    tagline: '',
    totalStudentsCount: 0,
    pointSettings: { first: 10, second: 7, third: 5, participation: 2, gradeA: 5, gradeB: 3, gradeC: 1 },
  }),
  getHouses: async (): Promise<House[]> => (await fetchList<any>('/houses/')).map(toHouse),
  getEvents: async (): Promise<FestEvent[]> => (await fetchList<any>('/events/')).map(toEvent),
  getStudents: async (): Promise<Student[]> => {
    return (await fetchList<any>('/students/')).map(toStudent);
  },
  getRegistrations: async (): Promise<StudentRegistration[]> => {
    return (await fetchList<any>('/registrations/')).map(toRegistration);
  },
  getResults: async (): Promise<EventResultRecord[]> => {
    return (await fetchList<any>('/results/')).map(toResult);
  },
  getUsers: async (): Promise<SystemUser[]> => {
    const response = await apiClient.get('/auth/me/');
    return [toUser(response.data)];
  },
  getLeaderboard: async (): Promise<House[]> => {
    return (await fetchList<any>('/leaderboard/')).map(toHouse);
  },
};
