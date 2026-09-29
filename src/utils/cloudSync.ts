import { AppState, Assignment, AttendanceRecord, Student, Subject, Submission, User, GoogleSheetsConfig } from '../types';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbx5d6t-CionNnr2d2K_wf5ImeuqpvZRVoZn8jcgloGVhQoyhzmKkOgtwjBSjWrnWIiT/exec';

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

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, { cache: 'no-store', ...options, headers: { Accept: 'application/json', ...(options.headers || {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }
  return data;
}

function sanitizeCloudState(data: CloudState): CloudState {
  const sampleAssignmentIds = new Set(['asg-01','asg-02','asg-03','asg-04','asg-05']);
  const sampleStudentIds = new Set(['std-p1-doen','std-p1-02','std-p1-03','std-p1-04','std-p1-05','std-p1-06','std-p1-07','std-p1-08','std-p1-09','std-p1-10','std-p2-01','std-p2-02','std-k1-01']);
  const sampleUserIds = new Set(['usr-teacher-care','std-p1-doen']);
  return {
    ...data,
    students: (data.students || []).filter((s:any) => !sampleStudentIds.has(String(s.id))),
    assignments: (data.assignments || []).filter((a:any) => !sampleAssignmentIds.has(String(a.id))),
    submissions: (data.submissions || []).filter((s:any) => !sampleAssignmentIds.has(String(s.assignmentId)) && !sampleStudentIds.has(String(s.studentId))),
    attendance: (data.attendance || []).filter((a:any) => !sampleStudentIds.has(String(a.studentId))),
    users: (data.users || []).filter((u:any) => !sampleUserIds.has(String(u.id))),
  };
}

export async function loadCloudState(): Promise<CloudState | null> {
  if (typeof window === 'undefined') return null;
  try {
    const result = await fetchJson('/api/cloud-state?action=getState');
    if (!result?.data) return null;
    return sanitizeCloudState(result.data as CloudState);
  } catch (error) {
    console.warn('NSW CARE cloud load failed; keeping local data.', error);
    return null;
  }
}

export async function saveCloudState(state: AppState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetchJson('/api/cloud-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveState', payload: getCloudState(state) }),
      keepalive: true,
    });
  } catch (error) {
    console.warn('NSW CARE cloud save failed; localStorage remains available.', error);
  }
}

export async function logCloudEvent(action: string, user: User | null, details: Record<string, unknown> = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/cloud-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'logEvent',
        payload: {
          action,
          userId: user?.id || '',
          role: user?.role || '',
          name: user ? `${user.prefix || ''}${user.firstName} ${user.lastName || ''}`.trim() : '',
          details,
          timestamp: new Date().toISOString(),
        },
      }),
      keepalive: true,
    });
  } catch {}
}

export async function loginCloudUser(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
  if (typeof window === 'undefined') return { success: false, message: 'ระบบล็อกอินใช้ได้บนหน้าเว็บเท่านั้น' };
  try {
    const result = await fetchJson('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email: email.trim().toLowerCase(), password }),
    });
    return {
      success: result?.success !== false && !!result?.user,
      message: result?.message,
      user: result?.user as User | undefined,
    };
  } catch (error: any) {
    return { success: false, message: error?.message || 'เข้าสู่ระบบไม่สำเร็จ' };
  }
}

export async function registerCloudAccount(
  user: User,
  password: string,
): Promise<{ success: boolean; message?: string; user?: User }> {
  if (typeof window === 'undefined') return { success: false, message: 'ระบบลงทะเบียนใช้ได้บนหน้าเว็บเท่านั้น' };
  try {
    const result = await fetchJson('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', user, password }),
    });
    return {
      success: result?.success !== false,
      message: result?.message,
      user: (result?.user || user) as User,
    };
  } catch (error: any) {
    return { success: false, message: error?.message || 'ลงทะเบียนไม่สำเร็จ' };
  }
}

export async function setInitialCloudPassword(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await fetchJson('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setInitialPassword', email: email.trim().toLowerCase(), password }),
    });
    return { success: result?.success === true, message: result?.message };
  } catch (error: any) {
    return { success: false, message: error?.message || 'ตั้งรหัสผ่านไม่สำเร็จ' };
  }
}

export async function loadCloudUsers(): Promise<User[]> {
  if (typeof window === 'undefined') return [];
  try {
    const result = await fetchJson('/api/cloud-state?action=getUsers');
    if (Array.isArray(result?.data)) return result.data as User[];
  } catch {}
  return [];
}

export async function registerCloudUser(user: User): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/cloud-state', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'registerUser',payload:user}),
      keepalive:true,
    });
  } catch {}
}

export async function loadLineChats(): Promise<import('../types').LineChat[]> {
  if (typeof window === 'undefined') return [];
  try {
    const response = await fetch('/api/line-chats', { cache: 'no-store' });
    const result = await response.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch {
    return [];
  }
}

export async function sendLineMessage(chatId: string, message: string): Promise<boolean> {
  if (typeof window === 'undefined' || !chatId || !message.trim()) return false;
  try {
    const response = await fetch('/api/line-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message: message.trim() }),
    });
    const result = await response.json();
    return result?.success === true;
  } catch {
    return false;
  }
}

export async function saveLineTemplate(templateType: string, message: string): Promise<void> {
  try {
    localStorage.setItem(`nongdoen_line_template_${templateType}`, message);
  } catch {}
}

export function loadLineTemplate(templateType: string): string | null {
  try {
    return localStorage.getItem(`nongdoen_line_template_${templateType}`);
  } catch {
    return null;
  }
}
