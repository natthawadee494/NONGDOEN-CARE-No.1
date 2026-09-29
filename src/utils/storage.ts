import { AppState, Assignment, AttendanceRecord, Student, Subject, Submission, User, GoogleSheetsConfig } from '../types';

export const STORAGE_KEY_STATE = 'nongdoen_care_app_state_v2';
export const STORAGE_KEY_USER = 'nongdoen_care_current_user_v2';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'ภาษาไทย', groupName: 'ภาษาไทย' },
  { id: 'sub-2', name: 'คณิตศาสตร์', groupName: 'คณิตศาสตร์' },
  { id: 'sub-3', name: 'วิทยาศาสตร์และเทคโนโลยี', groupName: 'วิทยาศาสตร์' },
  { id: 'sub-4', name: 'สังคมศึกษา ศาสนา และวัฒนธรรม', groupName: 'สังคมศึกษา' },
  { id: 'sub-5', name: 'ภาษาต่างประเทศ (ภาษาอังกฤษ)', groupName: 'ภาษาต่างประเทศ' },
  { id: 'sub-6', name: 'สุขศึกษาและพลศึกษา', groupName: 'สุขศึกษาและพลศึกษา' },
  { id: 'sub-7', name: 'ศิลปะ', groupName: 'ศิลปะ' },
  { id: 'sub-8', name: 'การงานอาชีพ', groupName: 'การงานอาชีพ' },
];

export const DEMO_TEACHER: User = {} as User;
export const DEMO_STUDENT: User = {} as User;

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const INITIAL_SUBMISSIONS: Submission[] = [];

export function createInitialAttendance(): AttendanceRecord[] { return []; }

export const INITIAL_SHEETS_CONFIG: GoogleSheetsConfig = {
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
  sheetName: 'Assignments',
  autoSync: false,
  isConnected: true,
  statusMsg: 'เชื่อมต่อและซิงค์ข้อมูลกับ Google Sheets สำเร็จ',
  lastSyncedAt: new Date().toISOString(),
};

export const DEFAULT_ROOMS = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

export function getDefaultInitialState(): AppState {
  return {
    currentUser: null,
    currentRoom: 'ป.1',
    activeTab: 'home',
    soundEnabled: true,
    rooms: DEFAULT_ROOMS,
    students: INITIAL_STUDENTS,
    assignments: INITIAL_ASSIGNMENTS,
    submissions: INITIAL_SUBMISSIONS,
    attendance: createInitialAttendance(),
    subjects: DEFAULT_SUBJECTS,
    users: [],
    sheetsConfig: INITIAL_SHEETS_CONFIG,
  };
}

export function loadAppState(): AppState {
  const defaultState = getDefaultInitialState();
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students)) {
        if (parsed.students.length === 0) {
          parsed.students = INITIAL_STUDENTS;
        }
        if (!parsed.sheetsConfig) {
          parsed.sheetsConfig = INITIAL_SHEETS_CONFIG;
        }
        if (!parsed.rooms) {
          parsed.rooms = DEFAULT_ROOMS;
        }
        if (!parsed.currentRoom) {
          parsed.currentRoom = 'ป.1';
        }
        if (!parsed.activeTab) {
          parsed.activeTab = 'home';
        }
        if (parsed.soundEnabled === undefined) {
          parsed.soundEnabled = true;
        }
        // Never persist an authenticated session locally.
        parsed.currentUser = null;
        return parsed as AppState;
      }
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }

  saveAppState(defaultState);
  return defaultState;
}

export const getInitialAppState = loadAppState;

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep application data locally, but never persist the authenticated user.
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify({ ...state, currentUser: null }));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function loadCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role) return parsed;
    }
  } catch (err) {
    console.error('Failed to load user from localStorage:', err);
  }
  return null;
}

export function saveCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch (err) {
    console.error('Failed to save user to localStorage:', err);
  }
}

export function exportBackupJson(state: AppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nongdoen-care-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
