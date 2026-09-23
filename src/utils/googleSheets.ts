import { Assignment, EvalType, AssignmentStatus } from '../types';

// Convert user-provided Google Sheets URL into a direct CSV export link
export function normalizeGoogleSheetCsvUrl(rawUrl: string, sheetName?: string): string {
  const url = rawUrl.trim();
  if (!url) return '';

  // Already a direct CSV or published output link
  if (url.includes('output=csv') || url.includes('format=csv') || url.includes('tqx=out:csv')) {
    return url;
  }

  // Google Apps Script endpoint
  if (url.includes('script.google.com')) {
    return url;
  }

  // Published to web format: .../spreadsheets/d/e/2PACX-.../pubhtml -> .../pub?output=csv
  const pubMatch = url.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch) {
    const pubId = pubMatch[1];
    let target = `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv`;
    if (sheetName) {
      target += `&sheet=${encodeURIComponent(sheetName)}`;
    }
    return target;
  }

  // Standard spreadsheet link: .../spreadsheets/d/{ID}/edit...
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const spreadsheetId = match[1];
    let csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
    if (sheetName) {
      csvUrl += `&sheet=${encodeURIComponent(sheetName)}`;
    }
    return csvUrl;
  }

  return url;
}

// Robust CSV parser handling quotes and escaped quotes
export function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

// Maps CSV matrix to Assignment[] matching:
// AssignmentId,Room,Title,Subject,Description,DueDate,EvalType,MaxScore,ImageUrl,TeacherId,CreatedAt,Status
export function mapCsvToAssignments(csvRows: string[][]): Assignment[] {
  if (csvRows.length < 2) return [];

  const headers = csvRows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Find column indices
  const getIdx = (keys: string[]): number => {
    return headers.findIndex((h) => keys.some((k) => h === k.toLowerCase().replace(/[^a-z0-9]/g, '')));
  };

  const idIdx = getIdx(['assignmentid', 'id', 'assignment_id']);
  const roomIdx = getIdx(['room', 'classroom', 'class']);
  const titleIdx = getIdx(['title', 'name', 'assignmenttitle']);
  const subjectIdx = getIdx(['subject', 'subjectname']);
  const descIdx = getIdx(['description', 'desc', 'detail']);
  const dueDateIdx = getIdx(['duedate', 'due', 'deadline']);
  const evalTypeIdx = getIdx(['evaltype', 'eval_type', 'type']);
  const maxScoreIdx = getIdx(['maxscore', 'score', 'max_score']);
  const imageIdx = getIdx(['imageurl', 'image', 'picture', 'url']);
  const teacherIdx = getIdx(['teacherid', 'teacher', 'teacher_id']);
  const createdAtIdx = getIdx(['createdat', 'created_at', 'date']);
  const statusIdx = getIdx(['status', 'state']);

  const assignments: Assignment[] = [];

  for (let i = 1; i < csvRows.length; i++) {
    const row = csvRows[i];
    if (!row || row.length === 0) continue;

    const title = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : '';
    if (!title) continue;

    const id = (idIdx !== -1 && row[idIdx]) ? row[idIdx] : `asg-${Date.now()}-${i}`;
    const room = (roomIdx !== -1 && row[roomIdx]) ? row[roomIdx] : 'ป.1';
    const subject = (subjectIdx !== -1 && row[subjectIdx]) ? row[subjectIdx] : 'ทั่วไป';
    const description = (descIdx !== -1 && row[descIdx]) ? row[descIdx] : '';
    
    // Due date
    let dueDate = (dueDateIdx !== -1 && row[dueDateIdx]) ? row[dueDateIdx] : '';
    if (!dueDate || !dueDate.includes('-')) {
      const d = new Date(Date.now() + 3 * 86400000);
      dueDate = d.toISOString().slice(0, 10);
    }

    // Eval type
    const rawEval = (evalTypeIdx !== -1 && row[evalTypeIdx]) ? row[evalTypeIdx].toLowerCase() : 'score';
    const evalType: EvalType = rawEval.includes('pass') ? 'pass_fail' : rawEval.includes('check') ? 'check' : 'score';

    // Max score
    const rawMax = maxScoreIdx !== -1 && row[maxScoreIdx] ? Number(row[maxScoreIdx]) : 10;
    const maxScore = isNaN(rawMax) || rawMax <= 0 ? 10 : rawMax;

    // Image URL
    const imageUrl = (imageIdx !== -1 && row[imageIdx]) ? row[imageIdx] : undefined;

    // Teacher ID
    const teacherId = (teacherIdx !== -1 && row[teacherIdx]) ? row[teacherIdx] : 'usr-teacher-care';

    // Created At
    const rawCreated = (createdAtIdx !== -1 && row[createdAtIdx]) ? row[createdAtIdx] : '';
    const createdAt = rawCreated && !isNaN(Date.parse(rawCreated)) ? new Date(rawCreated).toISOString() : new Date().toISOString();

    // Status
    const rawStatus = (statusIdx !== -1 && row[statusIdx]) ? row[statusIdx].toLowerCase() : 'open';
    const status: AssignmentStatus = rawStatus.includes('close') || rawStatus.includes('ปิด') ? 'closed' : 'open';

    assignments.push({
      id,
      room,
      title,
      subject,
      description,
      dueDate,
      evalType,
      maxScore,
      imageUrl,
      teacherId,
      createdAt,
      status,
    });
  }

  return assignments;
}

function fetchAppsScriptJsonp<T>(baseUrl: string, action: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = `__nswSheets_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Apps Script request timed out'));
    }, 15000);

    const cleanup = () => {
      window.clearTimeout(timer);
      script.remove();
      try {
        delete (window as any)[callback];
      } catch {
        (window as any)[callback] = undefined;
      }
    };

    (window as any)[callback] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('ไม่สามารถเชื่อมต่อ Google Apps Script ได้'));
    };

    const joiner = baseUrl.includes('?') ? '&' : '?';
    script.src =
      `${baseUrl}${joiner}action=${encodeURIComponent(action)}&callback=${encodeURIComponent(callback)}&_=${Date.now()}`;

    document.head.appendChild(script);
  });
}

// Fetch live assignments from Google Sheets URL
export async function fetchAssignmentsFromGoogleSheets(sheetUrl: string, sheetName?: string): Promise<{ success: boolean; data: Assignment[]; error?: string }> {
  try {
    const csvUrl = normalizeGoogleSheetCsvUrl(sheetUrl, sheetName);
    if (!csvUrl) {
      return { success: false, data: [], error: 'กรุณากรอกลิงก์ Google Sheets' };
    }

    // Our Apps Script Web App returns JSON rather than CSV.
    if (sheetUrl.includes('script.google.com')) {
      let result: any;

      try {
        const response = await fetch(
          `${csvUrl}${csvUrl.includes('?') ? '&' : '?'}action=assignments&_=${Date.now()}`,
          { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } }
        );
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        result = await response.json();
      } catch {
        result = await fetchAppsScriptJsonp<any>(csvUrl, 'assignments');
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Apps Script ไม่สามารถส่งข้อมูลการบ้านได้');
      }

      const assignments = Array.isArray(result.data) ? result.data.map((item: any) => ({
        id: item.AssignmentId || item.id || `asg-${Date.now()}`,
        room: item.Room || 'ป.1',
        title: item.Title || '',
        subject: item.Subject || 'ทั่วไป',
        description: item.Description || '',
        dueDate: item.DueDate || '',
        evalType: String(item.EvalType || 'score').toLowerCase().includes('pass')
          ? 'pass_fail'
          : String(item.EvalType || 'score').toLowerCase().includes('check')
            ? 'check'
            : 'score',
        maxScore: Number(item.MaxScore) || 10,
        imageUrl: item.ImageUrl || undefined,
        teacherId: item.TeacherId || undefined,
        createdAt: item.CreatedAt || new Date().toISOString(),
        status: String(item.Status || 'open').toLowerCase().includes('close')
          ? 'closed'
          : 'open',
      })) : [];

      if (assignments.length === 0) {
        throw new Error('ไม่พบข้อมูลการบ้านในชีต Assignments');
      }

      return { success: true, data: assignments };
    }

    const res = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/csv, text/plain, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบการแชร์ชีต`);
    }

    const text = await res.text();
    if (!text || text.includes('<!DOCTYPE html>')) {
      throw new Error('ลิงก์ Google Sheets ต้องตั้งค่าแชร์เป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู" หรือ Publish to web (CSV)');
    }

    const rows = parseCsv(text);
    const assignments = mapCsvToAssignments(rows);

    if (assignments.length === 0) {
      throw new Error('ไม่พบข้อมูลการบ้านตามหัวตาราง AssignmentId,Room,Title,Subject,...');
    }

    return { success: true, data: assignments };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets';
    return { success: false, data: [], error: message };
  }
}

// Generate CSV export content with exact specified header
export function exportAssignmentsToCsv(assignments: Assignment[]): string {
  const headers = [
    'AssignmentId',
    'Room',
    'Title',
    'Subject',
    'Description',
    'DueDate',
    'EvalType',
    'MaxScore',
    'ImageUrl',
    'TeacherId',
    'CreatedAt',
    'Status',
  ];

  const escapeCell = (val: unknown): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = assignments.map((a) => [
    escapeCell(a.id),
    escapeCell(a.room),
    escapeCell(a.title),
    escapeCell(a.subject),
    escapeCell(a.description),
    escapeCell(a.dueDate),
    escapeCell(a.evalType),
    escapeCell(a.maxScore),
    escapeCell(a.imageUrl || ''),
    escapeCell(a.teacherId || ''),
    escapeCell(a.createdAt),
    escapeCell(a.status),
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

// Download CSV file to user's device
export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Template CSV data matching the user's exact specification
export const SAMPLE_GOOGLE_SHEET_CSV = `AssignmentId,Room,Title,Subject,Description,DueDate,EvalType,MaxScore,ImageUrl,TeacherId,CreatedAt,Status
asg-01,ป.1,แบบฝึกหัดคณิตศาสตร์: การบวกเลขไม่เกิน 20,คณิตศาสตร์,ให้นักเรียนทำแบบฝึกหัดในสมุดหน้า 12 ข้อ 1-10 พร้อมแสดงวิธีคิดและระบายสีให้สวยงาม,2026-09-28,score,10,,usr-teacher-care,2026-09-21T08:00:00.000Z,open
asg-02,ป.1,คัดลายมือภาษาไทย: บทอาขยาน มานี มานะ,ภาษาไทย,คัดลายมือตัวบรรจงเต็มบรรทัด 5 บรรทัด และฝึกอ่านออกเสียงกับผู้ปกครอง,2026-09-29,score,10,,usr-teacher-care,2026-09-20T08:00:00.000Z,open
asg-03,ป.1,สำรวจพืชและสัตว์รอบบริเวณโรงเรียนหนองเดิ่นศรีเจริญวิทยา,วิทยาศาสตร์และเทคโนโลยี,วาดภาพพืชหรือสัตว์ที่พบรอบโรงเรียน 1 ชนิด พร้อมบอกชื่อและลักษณะสำคัญ,2026-09-30,score,10,,usr-teacher-care,2026-09-19T08:00:00.000Z,open
asg-04,ป.2,การคูณเบื้องต้น สรุปสูตรคูณแม่ 2-5,คณิตศาสตร์,ท่องสูตรคูณและเขียนแผนผังความคิดแสดงความสัมพันธ์ของการคูณ,2026-09-29,score,10,,usr-teacher-care,2026-09-21T08:00:00.000Z,open
asg-05,ทุกห้อง,กิจกรรมคุณธรรมและความดีประจำสัปดาห์,สังคมศึกษา ศาสนา และวัฒนธรรม,บันทึกความดีที่ทำร่วมกับครอบครัวในวันหยุด 1 เรื่อง,2026-10-02,pass_fail,10,,usr-teacher-care,2026-09-22T08:00:00.000Z,open`;
