import { House, FestEvent, Student, EventResultRecord, SystemUser, SchoolFestConfig, StudentRegistration } from '../types/festival';

export const INITIAL_CONFIG: SchoolFestConfig = {
  schoolName: "Hidaya School",
  festName: "English Fest 2026",
  academicYear: "2025–2026",
  tagline: "Annual Internal School Literary & Elocution Championship",
  totalStudentsCount: 640,
  pointSettings: {
    first: 10,
    second: 7,
    third: 5,
    participation: 2,
    gradeA: 5,
    gradeB: 3,
    gradeC: 1
  }
};

export const INITIAL_HOUSES: House[] = [
  {
    id: 'blue',
    name: 'Blue House',
    color: '#3b82f6',
    bgLight: 'bg-blue-50',
    badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
    captainName: 'Amaan Ahmed (Cl. 12A)',
    points: 195,
    gold: 6,
    silver: 4,
    bronze: 3
  },
  {
    id: 'green',
    name: 'Green House',
    color: '#10b981',
    bgLight: 'bg-emerald-50',
    badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
    captainName: 'Fidha Mariyam (Cl. 12B)',
    points: 172,
    gold: 5,
    silver: 3,
    bronze: 4
  },
  {
    id: 'yellow',
    name: 'Yellow House',
    color: '#f59e0b',
    bgLight: 'bg-amber-50',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-500',
    captainName: 'Rayan Zaheer (Cl. 12C)',
    points: 148,
    gold: 4,
    silver: 4,
    bronze: 2
  },
  {
    id: 'red',
    name: 'Red House',
    color: '#ef4444',
    bgLight: 'bg-red-50',
    badgeBg: 'bg-red-100 text-red-700 border-red-200',
    textColor: 'text-red-600',
    borderColor: 'border-red-500',
    captainName: 'Nihan Rasheed (Cl. 11A)',
    points: 118,
    gold: 3,
    silver: 2,
    bronze: 3
  },
  {
    id: 'purple',
    name: 'Purple House',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50',
    badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-500',
    captainName: 'Haniya Zoya (Cl. 11B)',
    points: 87,
    gold: 2,
    silver: 1,
    bronze: 2
  }
];

export const INITIAL_EVENTS: FestEvent[] = [
  // Junior Events
  { id: 'ev-j1', name: 'Extempore', level: 'Junior', category: 'Junior Boys', duration: '10 mins', maxParticipants: 16, status: 'Completed' },
  { id: 'ev-j2', name: 'Elocution', level: 'Junior', category: 'Junior Girls', duration: '12 mins', maxParticipants: 16, status: 'Completed' },
  { id: 'ev-j3', name: 'Spelling Bee', level: 'Junior', category: 'Junior Boys', duration: '20 mins', maxParticipants: 20, status: 'In Progress' },
  { id: 'ev-j4', name: 'Debate', level: 'Junior', category: 'Junior Girls', duration: '30 mins', maxParticipants: 12, status: 'In Progress' },
  { id: 'ev-j5', name: 'Sales Pitch', level: 'Junior', category: 'Junior Boys', duration: '15 mins', maxParticipants: 12, status: 'Upcoming' },
  { id: 'ev-j6', name: 'Live Reporting', level: 'Junior', category: 'Junior Girls', duration: '15 mins', maxParticipants: 14, status: 'Upcoming' },
  { id: 'ev-j7', name: 'Recitation', level: 'Junior', category: 'Junior Boys', duration: '10 mins', maxParticipants: 16, status: 'Upcoming' },

  // Senior Events
  { id: 'ev-s1', name: 'Extempore', level: 'Senior', category: 'Senior Boys', duration: '12 mins', maxParticipants: 16, status: 'Completed' },
  { id: 'ev-s2', name: 'Debate', level: 'Senior', category: 'Senior Girls', duration: '35 mins', maxParticipants: 12, status: 'In Progress' },
  { id: 'ev-s3', name: 'Speech Translation', level: 'Senior', category: 'Senior Boys', duration: '15 mins', maxParticipants: 12, status: 'Upcoming' },
  { id: 'ev-s4', name: 'Lit Talk', level: 'Senior', category: 'Senior Girls', duration: '20 mins', maxParticipants: 10, status: 'Upcoming' },
  { id: 'ev-s5', name: 'Sales Pitch', level: 'Senior', category: 'Senior Boys', duration: '15 mins', maxParticipants: 12, status: 'Upcoming' },
  { id: 'ev-s6', name: 'Spot Dubbing', level: 'Senior', category: 'Senior Girls', duration: '20 mins', maxParticipants: 10, status: 'Upcoming' },
  { id: 'ev-s7', name: 'Inspire Talk', level: 'Senior', category: 'HSS Boys', duration: '15 mins', maxParticipants: 10, status: 'Upcoming' }
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'st-101', admissionNo: 'HS-2024-101', name: 'Muhammed Zayan', className: '8', division: 'A', gender: 'Male', houseId: 'blue', status: 'Checked-In', registeredEventIds: ['ev-j1', 'ev-j3'] },
  { id: 'st-102', admissionNo: 'HS-2024-102', name: 'Ayisha Rifa', className: '8', division: 'B', gender: 'Female', houseId: 'green', status: 'Checked-In', registeredEventIds: ['ev-j2', 'ev-j4'] },
  { id: 'st-103', admissionNo: 'HS-2024-103', name: 'Fadil Ahammed', className: '9', division: 'A', gender: 'Male', houseId: 'yellow', status: 'Checked-In', registeredEventIds: ['ev-j1', 'ev-j5'] },
  { id: 'st-104', admissionNo: 'HS-2024-104', name: 'Hadiya Shireen', className: '9', division: 'C', gender: 'Female', houseId: 'red', status: 'Checked-In', registeredEventIds: ['ev-j2', 'ev-j6'] },
  { id: 'st-105', admissionNo: 'HS-2024-105', name: 'Omar Mukhtar', className: '8', division: 'C', gender: 'Male', houseId: 'purple', status: 'Registered', registeredEventIds: ['ev-j3', 'ev-j7'] },
  
  { id: 'st-106', admissionNo: 'HS-2024-106', name: 'Nihan Bilal', className: '10', division: 'A', gender: 'Male', houseId: 'blue', status: 'Checked-In', registeredEventIds: ['ev-s1', 'ev-s3'] },
  { id: 'st-107', admissionNo: 'HS-2024-107', name: 'Sana Fathima', className: '10', division: 'B', gender: 'Female', houseId: 'green', status: 'Checked-In', registeredEventIds: ['ev-s2', 'ev-s4'] },
  { id: 'st-108', admissionNo: 'HS-2024-108', name: 'Hamdan Ibrahim', className: '11', division: 'A', gender: 'Male', houseId: 'yellow', status: 'Checked-In', registeredEventIds: ['ev-s1', 'ev-s5'] },
  { id: 'st-109', admissionNo: 'HS-2024-109', name: 'Rasha Mehreen', className: '11', division: 'B', gender: 'Female', houseId: 'red', status: 'Registered', registeredEventIds: ['ev-s2', 'ev-s6'] },
  { id: 'st-110', admissionNo: 'HS-2024-110', name: 'Zian Farhan', className: '12', division: 'A', gender: 'Male', houseId: 'purple', status: 'Checked-In', registeredEventIds: ['ev-s7'] },

  { id: 'st-111', admissionNo: 'HS-2024-111', name: 'Ameen Kazi', className: '8', division: 'B', gender: 'Male', houseId: 'blue', status: 'Checked-In', registeredEventIds: ['ev-j1', 'ev-j7'] },
  { id: 'st-112', admissionNo: 'HS-2024-112', name: 'Mariyam Lubna', className: '9', division: 'B', gender: 'Female', houseId: 'green', status: 'Checked-In', registeredEventIds: ['ev-j2', 'ev-j4'] },
  { id: 'st-113', admissionNo: 'HS-2024-113', name: 'Rayyan Saheed', className: '10', division: 'C', gender: 'Male', houseId: 'yellow', status: 'Checked-In', registeredEventIds: ['ev-s1', 'ev-s3'] },
  { id: 'st-114', admissionNo: 'HS-2024-114', name: 'Fathima Naifa', className: '11', division: 'C', gender: 'Female', houseId: 'purple', status: 'Active', registeredEventIds: ['ev-s2', 'ev-s6'] },
  { id: 'st-115', admissionNo: 'HS-2024-115', name: 'Bilal Hassan', className: '12', division: 'B', gender: 'Male', houseId: 'red', status: 'Checked-In', registeredEventIds: ['ev-s7'] }
];

export const INITIAL_REGISTRATIONS: StudentRegistration[] = [
  { id: 'reg-1', studentId: 'st-101', eventId: 'ev-j1', category: 'Junior Boys', registeredAt: '2026-02-10 09:30' },
  { id: 'reg-2', studentId: 'st-102', eventId: 'ev-j2', category: 'Junior Girls', registeredAt: '2026-02-10 09:45' },
  { id: 'reg-3', studentId: 'st-103', eventId: 'ev-j1', category: 'Junior Boys', registeredAt: '2026-02-10 10:00' },
  { id: 'reg-4', studentId: 'st-104', eventId: 'ev-j2', category: 'Junior Girls', registeredAt: '2026-02-10 10:15' },
  { id: 'reg-5', studentId: 'st-106', eventId: 'ev-s1', category: 'Senior Boys', registeredAt: '2026-02-10 11:00' },
  { id: 'reg-6', studentId: 'st-107', eventId: 'ev-s2', category: 'Senior Girls', registeredAt: '2026-02-10 11:30' },
  { id: 'reg-7', studentId: 'st-108', eventId: 'ev-s1', category: 'Senior Boys', registeredAt: '2026-02-10 11:45' },
  { id: 'reg-8', studentId: 'st-111', eventId: 'ev-j1', category: 'Junior Boys', registeredAt: '2026-02-10 12:00' }
];

export const INITIAL_RESULTS: EventResultRecord[] = [
  {
    eventId: 'ev-j1',
    isPublished: true,
    publishedAt: '2026-02-12 11:30',
    scores: [
      { studentId: 'st-101', studentName: 'Muhammed Zayan', admissionNo: 'HS-2024-101', houseId: 'blue', marks: 92, grade: 'A', position: 1, housePoints: 10 },
      { studentId: 'st-103', studentName: 'Fadil Ahammed', admissionNo: 'HS-2024-103', houseId: 'yellow', marks: 85, grade: 'A', position: 2, housePoints: 7 },
      { studentId: 'st-111', studentName: 'Ameen Kazi', admissionNo: 'HS-2024-111', houseId: 'blue', marks: 78, grade: 'B', position: 3, housePoints: 5 }
    ]
  },
  {
    eventId: 'ev-j2',
    isPublished: true,
    publishedAt: '2026-02-12 12:45',
    scores: [
      { studentId: 'st-102', studentName: 'Ayisha Rifa', admissionNo: 'HS-2024-102', houseId: 'green', marks: 95, grade: 'A', position: 1, housePoints: 10 },
      { studentId: 'st-104', studentName: 'Hadiya Shireen', admissionNo: 'HS-2024-104', houseId: 'red', marks: 88, grade: 'A', position: 2, housePoints: 7 },
      { studentId: 'st-112', studentName: 'Mariyam Lubna', admissionNo: 'HS-2024-112', houseId: 'green', marks: 81, grade: 'A', position: 3, housePoints: 5 }
    ]
  },
  {
    eventId: 'ev-s1',
    isPublished: true,
    publishedAt: '2026-02-12 14:15',
    scores: [
      { studentId: 'st-106', studentName: 'Nihan Bilal', admissionNo: 'HS-2024-106', houseId: 'blue', marks: 94, grade: 'A', position: 1, housePoints: 10 },
      { studentId: 'st-108', studentName: 'Hamdan Ibrahim', admissionNo: 'HS-2024-108', houseId: 'yellow', marks: 89, grade: 'A', position: 2, housePoints: 7 },
      { studentId: 'st-113', studentName: 'Rayyan Saheed', admissionNo: 'HS-2024-113', houseId: 'yellow', marks: 82, grade: 'A', position: 3, housePoints: 5 }
    ]
  }
];

export const INITIAL_USERS: SystemUser[] = [
  { id: 'usr-0', name: 'System Super Admin', email: 'superadmin@hidayaschool.edu', role: 'Super Admin', department: 'System Root', status: 'Active' },
  { id: 'usr-1', name: 'Prof. Abdurahman', email: 'principal@hidayaschool.edu', role: 'Admin', department: 'Executive Board', status: 'Active' },
  { id: 'usr-2', name: 'English HOD Sumayya', email: 'english.hod@hidayaschool.edu', role: 'Manager', department: 'English Department', status: 'Active' },
  { id: 'usr-3', name: 'Staff Convenor Shafeer', email: 'shafeer.c@hidayaschool.edu', role: 'Manager', department: 'Arts Committee', status: 'Active' },
  { id: 'usr-4', name: 'Blue House Master Anwer', email: 'blue.house@hidayaschool.edu', role: 'Team Leader', department: 'Blue House', status: 'Active', houseId: 'blue' },
  { id: 'usr-5', name: 'Green House Mistress Safiya', email: 'green.house@hidayaschool.edu', role: 'Team Leader', department: 'Green House', status: 'Active', houseId: 'green' }
];
