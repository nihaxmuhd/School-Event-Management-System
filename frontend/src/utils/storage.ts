import { House, FestEvent, Student, StudentRegistration, EventResultRecord, SystemUser, SchoolFestConfig } from '../types/festival';
import { INITIAL_HOUSES, INITIAL_EVENTS, INITIAL_STUDENTS, INITIAL_REGISTRATIONS, INITIAL_RESULTS, INITIAL_USERS, INITIAL_CONFIG } from '../data/mockData';

const KEYS = {
  HOUSES: 'hidaya_sems_houses',
  EVENTS: 'hidaya_sems_events',
  STUDENTS: 'hidaya_sems_students',
  REGISTRATIONS: 'hidaya_sems_registrations',
  RESULTS: 'hidaya_sems_results',
  USERS: 'hidaya_sems_users',
  CONFIG: 'hidaya_sems_config',
};

export const loadStoredData = () => {
  try {
    const houses: House[] = JSON.parse(localStorage.getItem(KEYS.HOUSES) || JSON.stringify(INITIAL_HOUSES));
    const events: FestEvent[] = JSON.parse(localStorage.getItem(KEYS.EVENTS) || JSON.stringify(INITIAL_EVENTS));
    const students: Student[] = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || JSON.stringify(INITIAL_STUDENTS));
    const registrations: StudentRegistration[] = JSON.parse(localStorage.getItem(KEYS.REGISTRATIONS) || JSON.stringify(INITIAL_REGISTRATIONS));
    const results: EventResultRecord[] = JSON.parse(localStorage.getItem(KEYS.RESULTS) || JSON.stringify(INITIAL_RESULTS));
    const users: SystemUser[] = JSON.parse(localStorage.getItem(KEYS.USERS) || JSON.stringify(INITIAL_USERS));
    const config: SchoolFestConfig = JSON.parse(localStorage.getItem(KEYS.CONFIG) || JSON.stringify(INITIAL_CONFIG));

    return { houses, events, students, registrations, results, users, config };
  } catch (e) {
    console.error('Failed loading from localStorage', e);
    return {
      houses: INITIAL_HOUSES,
      events: INITIAL_EVENTS,
      students: INITIAL_STUDENTS,
      registrations: INITIAL_REGISTRATIONS,
      results: INITIAL_RESULTS,
      users: INITIAL_USERS,
      config: INITIAL_CONFIG
    };
  }
};

export const saveToStorage = (key: keyof typeof KEYS, data: any) => {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage`, e);
  }
};

export const resetAllData = () => {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
};
