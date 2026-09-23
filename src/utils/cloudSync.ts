import { AppState, Assignment, AttendanceRecord, Student, Subject, Submission, User, GoogleSheetsConfig } from '../types';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyjRXtsUKZprrFkCM9Z9R0Iffw137qzKL8y10Pz19SaeoQ1dwKwVwtVW8dFNu5yhp3Y/exec';

export const APPS_SCRIPT_URL =
  (import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined)?.trim() ||
  DEFAULT_APPS_SCRIPT_URL;

export interface CloudState {
  rooms: string[];
  students: Student[];
  assignments: Assignment[];
  submissions: Submission[];
  attendance: AttendanceRecord[];
  subjects: Subject[];
  users: User[];
  sheetsConfig: GoogleSheetsConfig;
}

function getCloudState(state: AppState): CloudState {
  return { rooms: state.rooms, students: state.students, assignments: state.assignments, submissions: state.submissions, attendance: state.attendance, subjects: state.subjects, users: state.users, sheetsConfig: state.sheetsConfig };
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url, { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function jsonp<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = `__nswCareJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => { cleanup(); reject(new Error('JSONP timeout')); }, 15000);
    const cleanup = () => { window.clearTimeout(timer); script.remove(); try { delete (window as any)[callback]; } catch { (window as any)[callback] = undefined; } };
    (window as any)[callback] = (data: T) => { cleanup(); resolve(data); };
    script.onerror = () => { cleanup(); reject(new Error('JSONP request failed')); };
    script.src = `${url}?action=getState&callback=${encodeURIComponent(callback)}&_=${Date.now()}`;
    document.head.appendChild(script);
  });
}

export async function loadCloudState(): Promise<CloudState | null> {
  if (typeof window === 'undefined') return null;
  try {
    let result: any;
    try { result = await fetchJson(`${APPS_SCRIPT_URL}?action=getState&_=${Date.now()}`); }
    catch { result = await jsonp<any>(APPS_SCRIPT_URL); }
    if (!result?.success || !result.data) return null;
    return result.data as CloudState;
  } catch (error) {
    console.warn('NSW CARE cloud load failed; keeping local data.', error);
    return null;
  }
}

export async function saveCloudState(state: AppState): Promise<void> {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(getCloudState(state));
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ action: 'saveState', payload }).toString(),
      keepalive: true,
    });
  } catch (error) {
    console.warn('NSW CARE cloud save failed; localStorage remains available.', error);
  }
}

export async function logCloudEvent(action: string, user: User | null, details: Record<string, unknown> = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({
        action: 'logEvent',
        payload: JSON.stringify({ action, userId: user?.id || '', role: user?.role || '', name: user ? `${user.prefix || ''}${user.firstName} ${user.lastName || ''}`.trim() : '', details, timestamp: new Date().toISOString() }),
      }).toString(),
      keepalive: true,
    });
  } catch {}
}


export async function loadCloudUsers(): Promise<User[]> {
  if (typeof window === 'undefined') return [];
  try {
    const result = await fetchJson(`${APPS_SCRIPT_URL}?action=getUsers&_=${Date.now()}`);
    return Array.isArray(result?.data) ? result.data as User[] : [];
  } catch {
    return [];
  }
}

export async function registerCloudUser(user: User): Promise<void> {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(user);
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ action: 'registerUser', payload }).toString(),
      keepalive: true,
    });
  } catch (error) {
    console.warn('NSW CARE account save failed.', error);
  }
}
