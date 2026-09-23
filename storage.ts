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

export const DEMO_TEACHER: User = {
  id: 'usr-teacher-care',
  role: 'teacher',
  login: '0910610997',
  email: 'teacher.care@nsw.ac.th',
  prefix: 'คุณครู',
  firstName: 'ครูแคร์',
  lastName: 'ศรีเจริญ',
  nickname: 'ครูแคร์',
  room: 'ป.1',
  phone: '0910610997',
  bio: 'ครูประจำชั้นประถมศึกษาปีที่ 1 โรงเรียนหนองเดิ่นศรีเจริญวิทยา สพป.หนองคาย เขต 1 (บัญชีทดลองใช้: ครูแคร์)',
  exp: 999,
  avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
  avatarSize: 96,
  themeColor: 'rose',
};

export const DEMO_STUDENT: User = {
  id: 'std-p1-doen',
  role: 'student',
  login: '0881234567',
  email: 'nongdoen@nsw.ac.th',
  prefix: 'เด็กชาย',
  firstName: 'น้องเดิ่น',
  lastName: 'ศรีเจริญ',
  nickname: 'น้องเดิ่น',
  room: 'ป.1',
  number: 1,
  phone: '0910610997',
  bio: 'นักเรียนชั้น ป.1 เลขที่ 1 โรงเรียนหนองเดิ่นศรีเจริญวิทยา (บัญชีทดลองใช้: น้องเดิ่น)',
  exp: 150,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  avatarSize: 96,
  themeColor: 'sakura',
};

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const INITIAL_STUDENTS: Student[] = [
  // Class ป.1
  {
    id: 'std-p1-doen',
    prefix: 'เด็กชาย',
    firstName: 'น้องเดิ่น',
    lastName: 'ศรีเจริญ',
    nickname: 'น้องเดิ่น',
    room: 'ป.1',
    number: 1,
    phone: '0910610997',
    email: 'nongdoen@nsw.ac.th',
    status: 'normal',
    exp: 150,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'std-p1-02',
    prefix: 'เด็กชาย',
    firstName: 'ธนภัทร',
    lastName: 'บัวระพา',
    nickname: 'โฟกัส',
    room: 'ป.1',
    number: 2,
    phone: '0812345678',
    email: 'thanapat@nsw.ac.th',
    status: 'normal',
    exp: 125,
  },
  {
    id: 'std-p1-03',
    prefix: 'เด็กหญิง',
    firstName: 'กัญญาณัฐ',
    lastName: 'สุขเกษม',
    nickname: 'มินนี่',
    room: 'ป.1',
    number: 3,
    phone: '0823456789',
    email: 'kanyanat@nsw.ac.th',
    status: 'normal',
    exp: 140,
  },
  {
    id: 'std-p1-04',
    prefix: 'เด็กชาย',
    firstName: 'กิตติศักดิ์',
    lastName: 'แก้วมณี',
    nickname: 'บอส',
    room: 'ป.1',
    number: 4,
    phone: '0834567890',
    email: 'kittisak@nsw.ac.th',
    status: 'risk',
    exp: 90,
  },
  {
    id: 'std-p1-05',
    prefix: 'เด็กหญิง',
    firstName: 'ณัชชา',
    lastName: 'วรรณกิจ',
    nickname: 'ข้าวหอม',
    room: 'ป.1',
    number: 5,
    phone: '0845678901',
    email: 'natcha@nsw.ac.th',
    status: 'normal',
    exp: 160,
  },
  {
    id: 'std-p1-06',
    prefix: 'เด็กชาย',
    firstName: 'ภานุพงศ์',
    lastName: 'คำสิงห์',
    nickname: 'ออโต้',
    room: 'ป.1',
    number: 6,
    phone: '0856789012',
    email: 'panupong@nsw.ac.th',
    status: 'normal',
    exp: 110,
  },
  {
    id: 'std-p1-07',
    prefix: 'เด็กหญิง',
    firstName: 'ชญาดา',
    lastName: 'มีชัย',
    nickname: 'น้ำอิง',
    room: 'ป.1',
    number: 7,
    phone: '0867890123',
    email: 'chayada@nsw.ac.th',
    status: 'special_care',
    exp: 85,
  },
  {
    id: 'std-p1-08',
    prefix: 'เด็กชาย',
    firstName: 'วรเมธ',
    lastName: 'จิตมั่นคง',
    nickname: 'วินเนอร์',
    room: 'ป.1',
    number: 8,
    phone: '0878901234',
    email: 'worameth@nsw.ac.th',
    status: 'normal',
    exp: 130,
  },
  {
    id: 'std-p1-09',
    prefix: 'เด็กหญิง',
    firstName: 'พิชญาภา',
    lastName: 'ทองคำ',
    nickname: 'แพรวา',
    room: 'ป.1',
    number: 9,
    phone: '0889012345',
    email: 'pitchayapa@nsw.ac.th',
    status: 'normal',
    exp: 145,
  },
  {
    id: 'std-p1-10',
    prefix: 'เด็กชาย',
    firstName: 'ธีรเดช',
    lastName: 'สุริยวงศ์',
    nickname: 'เตโช',
    room: 'ป.1',
    number: 10,
    phone: '0890123456',
    email: 'teeradech@nsw.ac.th',
    status: 'normal',
    exp: 115,
  },
  // Class ป.2 sample students
  {
    id: 'std-p2-01',
    prefix: 'เด็กชาย',
    firstName: 'ธนากร',
    lastName: 'ศรีบุญเรือง',
    nickname: 'ไทเกอร์',
    room: 'ป.2',
    number: 1,
    phone: '0811122233',
    email: 'tiger@nsw.ac.th',
    status: 'normal',
    exp: 120,
  },
  {
    id: 'std-p2-02',
    prefix: 'เด็กหญิง',
    firstName: 'พิมพ์ลภัส',
    lastName: 'ใจสว่าง',
    nickname: 'พิมพ์',
    room: 'ป.2',
    number: 2,
    phone: '0822233344',
    email: 'pim@nsw.ac.th',
    status: 'normal',
    exp: 135,
  },
  // Kindergarten samples
  {
    id: 'std-k1-01',
    prefix: 'เด็กชาย',
    firstName: 'ปัณณวิชญ์',
    lastName: 'ศรีทอง',
    nickname: 'ปันปัน',
    room: 'อ.1',
    number: 1,
    phone: '0833344455',
    email: 'panpan@nsw.ac.th',
    status: 'normal',
    exp: 100,
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-01',
    room: 'ป.1',
    title: 'แบบฝึกหัดคณิตศาสตร์: การบวกเลขไม่เกิน 20',
    subject: 'คณิตศาสตร์',
    description: 'ให้นักเรียนทำแบบฝึกหัดในสมุดหน้า 12 ข้อ 1-10 พร้อมแสดงวิธีคิดและระบายสีให้สวยงาม',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    evalType: 'score',
    maxScore: 10,
    imageUrl: '',
    teacherId: 'usr-teacher-care',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'open',
  },
  {
    id: 'asg-02',
    room: 'ป.1',
    title: 'คัดลายมือภาษาไทย: บทอาขยาน มานี มานะ',
    subject: 'ภาษาไทย',
    description: 'คัดลายมือตัวบรรจงเต็มบรรทัด 5 บรรทัด และฝึกอ่านออกเสียงกับผู้ปกครอง',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    evalType: 'score',
    maxScore: 10,
    imageUrl: '',
    teacherId: 'usr-teacher-care',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'open',
  },
  {
    id: 'asg-03',
    room: 'ป.1',
    title: 'สำรวจพืชและสัตว์รอบบริเวณโรงเรียนหนองเดิ่นศรีเจริญวิทยา',
    subject: 'วิทยาศาสตร์และเทคโนโลยี',
    description: 'วาดภาพพืชหรือสัตว์ที่พบรอบโรงเรียน 1 ชนิด พร้อมบอกชื่อและลักษณะสำคัญ',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    evalType: 'score',
    maxScore: 10,
    imageUrl: '',
    teacherId: 'usr-teacher-care',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'open',
  },
  {
    id: 'asg-04',
    room: 'ป.2',
    title: 'การคูณเบื้องต้น สรุปสูตรคูณแม่ 2-5',
    subject: 'คณิตศาสตร์',
    description: 'ท่องสูตรคูณและเขียนแผนผังความคิดแสดงความสัมพันธ์ของการคูณ',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    evalType: 'score',
    maxScore: 10,
    imageUrl: '',
    teacherId: 'usr-teacher-care',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'open',
  },
  {
    id: 'asg-05',
    room: 'ทุกห้อง',
    title: 'กิจกรรมคุณธรรมและความดีประจำสัปดาห์',
    subject: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    description: 'บันทึกความดีที่ทำร่วมกับครอบครัวในวันหยุด 1 เรื่องพร้อมถ่ายรูปหรือวาดภาพ',
    dueDate: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
    evalType: 'pass_fail',
    maxScore: 10,
    imageUrl: '',
    teacherId: 'usr-teacher-care',
    createdAt: new Date().toISOString(),
    status: 'open',
  },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-01',
    assignmentId: 'asg-01',
    studentId: 'std-p1-doen',
    studentName: 'เด็กชาย น้องเดิ่น ศรีเจริญ',
    room: 'ป.1',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'graded',
    score: 10,
    note: 'ทำเสร็จเรียบร้อยแล้วครับคุณครูแคร์',
    feedback: 'ลายมือสวยงามมาก แสดงวิธีคิดได้ถูกต้อง ครบถ้วน ยอดเยี่ยมมากครับ ⭐',
  },
  {
    id: 'sub-02',
    assignmentId: 'asg-01',
    studentId: 'std-p1-02',
    studentName: 'เด็กชาย ธนภัทร บัวระพา',
    room: 'ป.1',
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'submitted',
    score: undefined,
    note: 'ส่งการบ้านข้อ 1-10 ครับ',
  },
];

export function createInitialAttendance(): AttendanceRecord[] {
  const today = getTodayDateString();
  return INITIAL_STUDENTS.map((std, idx) => {
    let status: AttendanceRecord['status'] = 'มา';
    if (idx === 3) status = 'สาย';
    if (idx === 6) status = 'ลา';
    return {
      id: `att-${std.id}-${today}`,
      date: today,
      studentId: std.id,
      room: std.room,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: 'ครูประจำชั้น',
    };
  });
}

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
    users: [DEMO_TEACHER, DEMO_STUDENT],
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
        if (parsed.currentUser === undefined) {
          parsed.currentUser = DEMO_TEACHER;
        }
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
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
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
  // Default to Demo Teacher
  return DEMO_TEACHER;
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
