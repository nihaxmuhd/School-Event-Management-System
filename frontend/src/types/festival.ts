export type HouseId = string;

export interface House {
  id: HouseId;
  name: string;
  color: string;
  bgLight: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  captainName: string;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
}

export type CategoryType = 
  | 'Junior Boys'
  | 'Junior Girls'
  | 'Senior Boys'
  | 'Senior Girls'
  | 'HSS Boys'
  | 'HSS Girls';

export type GenderType = 'Male' | 'Female';

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  className: string; // e.g. "8", "9", "10", "11", "12"
  division: string;  // e.g. "A", "B", "C"
  gender: GenderType;
  houseId: HouseId;
  status: 'Active' | 'Registered' | 'Checked-In';
  registeredEventIds: string[];
}

export interface FestEvent {
  id: string;
  name: string;
  level: 'Junior' | 'Senior';
  category: CategoryType;
  duration: string;
  maxParticipants: number;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

export interface StudentRegistration {
  id: string;
  studentId: string;
  eventId: string;
  category: CategoryType;
  registeredAt: string;
}

export interface ParticipantMarkScore {
  studentId: string;
  studentName: string;
  admissionNo: string;
  houseId: HouseId;
  marks: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  position: 1 | 2 | 3 | 0;
  housePoints: number;
}

export interface EventResultRecord {
  eventId: string;
  isPublished: boolean;
  publishedAt?: string;
  scores: ParticipantMarkScore[];
}

export type UserRole = 'Admin' | 'Manager' | 'Team Leader';

export interface PointSettings {
  first: number;
  second: number;
  third: number;
  participation: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Inactive';
  houseId?: HouseId; // For Team Leaders — the House they manage
}

export interface SchoolFestConfig {
  schoolName: string;
  festName: string;
  academicYear: string;
  tagline: string;
  totalStudentsCount: number;
  pointSettings: PointSettings;
}
