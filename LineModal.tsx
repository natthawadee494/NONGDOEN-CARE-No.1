import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
} from 'lucide-react';
import { Assignment, AttendanceRecord, Student, Submission } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';

interface LineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: string;
  todayDate: string;
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: Submission[];
}

export const LineModal: React.FC<LineModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  todayDate,
  students,
  attendance,
  assignments,
  submissions,
}) => {
  const [copied, setCopied] = useState(false);
  const [templateType, setTemplateType] = useState<'attendance' | 'homework'>('attendance');

  if (!isOpen) return null;

  const roomStudents = students
    .filter((s) => s.room === currentRoom)
    .sort((a, b) => a.number - b.number);

  const getAttendanceStatus = (stdId: string) => {
    const rec = attendance.find(
      (a) => a.studentId === stdId && a.room === currentRoom && a.date === todayDate
    );
    return rec ? rec.status : 'มา';
  };

  const presentList = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'มา');
  const lateList = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'สาย');
  const leaveList = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'ลา');
  const absentList = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'ขาด');

  const attendanceText = `📢 [รายงานผลการเช็กชื่อประจำวัน]
🏫 โรงเรียนหนองเดิ่นศรีเจริญวิทยา
📅 ประจำวันที่ ${new Date(todayDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}
ชั้น ${currentRoom} (รวม ${roomStudents.length} คน)
------------------------------
✅ มาเรียน: ${presentList.length} คน
⏰ มาสาย: ${lateList.length} คน ${lateList.length > 0 ? `(${lateList.map((s) => `${s.nickname || s.firstName}`).join(', ')})` : ''}
🏥 ลา: ${leaveList.length} คน ${leaveList.length > 0 ? `(${leaveList.map((s) => `${s.nickname || s.firstName}`).join(', ')})` : ''}
❌ ขาดเรียน: ${absentList.length} คน ${absentList.length > 0 ? `(${absentList.map((s) => `${s.nickname || s.firstName}`).join(', ')})` : ''}
------------------------------
ผู้ปกครองสามารถตรวจสอบรายละเอียดได้ที่ระบบ NONGDOEN CARE`;

  const activeAsg = assignments.filter((a) => a.room === currentRoom || a.room === 'ทุกห้อง')[0];
  const pendingStudents = activeAsg
    ? roomStudents.filter((s) => {
        const sub = submissions.find((subm) => subm.assignmentId === activeAsg.id && subm.studentId === s.id);
        return !sub || (sub.status !== 'submitted' && sub.status !== 'graded');
      })
    : [];

  const homeworkText = `📚 [แจ้งเตือนการบ้านและภาระงาน]
🏫 โรงเรียนหนองเดิ่นศรีเจริญวิทยา ชั้น ${currentRoom}
📝 วิชา: ${activeAsg?.subject || 'การบ้าน'}
หัวข้อ: ${activeAsg?.title || 'แบบฝึกหัด'}
⏰ กำหนดส่ง: ${activeAsg?.dueDate || todayDate}
------------------------------
⚠️ นักเรียนที่ยังค้างส่ง (${pendingStudents.length} คน):
${pendingStudents.length === 0 ? '✨ ยอดเยี่ยมมาก ส่งครบทุกคนแล้ว!' : pendingStudents.map((s) => `• เลขที่ ${s.number} ${s.prefix} ${s.firstName} (${s.nickname || ''})`).join('\n')}
------------------------------
กรุณาส่งงานหรืออัปโหลดรูปภาพผ่านระบบ NONGDOEN CARE ครับ`;

  const currentMessage = templateType === 'attendance' ? attendanceText : homeworkText;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    playSuccess();
    triggerConfetti();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLine = () => {
    playClick();
    const encoded = encodeURIComponent(currentMessage);
    window.open(`https://line.me/R/msg/text/?${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">แชร์ข้อความแจ้งเตือนเข้า LINE</h3>
              <p className="text-xs text-slate-500">สำหรับส่งเข้า LINE OpenChat หรือกลุ่มผู้ปกครอง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Template Switch */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => {
              playClick();
              setTemplateType('attendance');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              templateType === 'attendance'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สรุปเช็กชื่อประจำวัน
          </button>
          <button
            onClick={() => {
              playClick();
              setTemplateType('homework');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              templateType === 'homework'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แจ้งเตือนการบ้านค้างส่ง
          </button>
        </div>

        {/* Message Preview */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">ข้อความที่เตรียมส่ง:</label>
          <textarea
            readOnly
            rows={9}
            value={currentMessage}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-mono leading-relaxed focus:outline-hidden resize-none shadow-inner"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกข้อความ'}</span>
          </button>

          <button
            onClick={handleShareLine}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>เปิดแอป LINE เพื่อส่ง</span>
          </button>
        </div>
      </div>
    </div>
  );
};
