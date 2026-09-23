import React from 'react';
import {
  Student,
  AttendanceRecord,
  Submission,
  Assignment,
} from '../types';
import {
  Sparkles,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react';
import { playSuccess, triggerConfetti } from '../utils/audio';

interface StudentDetailModalProps {
  student: Student | null;
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: Submission[];
  onClose: () => void;
  onRewardExp: (studentId: string, points: number) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  attendance,
  assignments,
  submissions,
  onClose,
  onRewardExp,
}) => {
  if (!student) return null;

  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const presentCount = studentAttendance.filter((a) => a.status === 'มา').length;
  const lateCount = studentAttendance.filter((a) => a.status === 'สาย').length;
  const leaveCount = studentAttendance.filter((a) => a.status === 'ลา').length;
  const absentCount = studentAttendance.filter((a) => a.status === 'ขาด').length;

  const mySubmissions = submissions.filter((s) => s.studentId === student.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border-2 border-rose-400 overflow-hidden flex items-center justify-center font-black text-rose-700 text-lg shrink-0 shadow-xs">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                student.firstName.slice(0, 1)
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  เลขที่ {student.number}
                </span>
                <span className="text-xs font-bold text-slate-500">ชั้น {student.room}</span>
              </div>
              <h3 className="font-black text-slate-800 text-base leading-tight mt-0.5">
                {student.prefix} {student.firstName} {student.lastName}
                {student.nickname && <span className="text-rose-600 font-bold ml-1.5">(น้อง{student.nickname})</span>}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* EXP and Care Status Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-[11px] text-pink-200 font-bold block">แต้มความดีสะสม</span>
            <div className="text-2xl font-black flex items-center gap-1">
              <Sparkles className="w-5 h-5 fill-amber-300 text-amber-300" />
              <span>{student.exp || 100} EXP</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSuccess();
                triggerConfetti();
                onRewardExp(student.id, 10);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-black text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>+10 EXP</span>
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">เบอร์โทรติดต่อ:</span>
            {student.phone ? (
              <a href={`tel:${student.phone}`} className="font-bold text-rose-600 hover:underline flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{student.phone}</span>
              </a>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">อีเมล:</span>
            {student.email ? (
              <a href={`mailto:${student.email}`} className="font-bold text-rose-600 hover:underline flex items-center gap-1 mt-0.5 truncate">
                <Mail className="w-3 h-3" />
                <span className="truncate">{student.email}</span>
              </a>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            <span>สถิติการมาเรียน</span>
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block font-bold">มา</span>
              <span className="text-base font-black text-emerald-800">{presentCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] text-amber-700 block font-bold">สาย</span>
              <span className="text-base font-black text-amber-800">{lateCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-[10px] text-purple-700 block font-bold">ลา</span>
              <span className="text-base font-black text-purple-800">{leaveCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] text-rose-700 block font-bold">ขาด</span>
              <span className="text-base font-black text-rose-800">{absentCount}</span>
            </div>
          </div>
        </div>

        {/* Submissions Stats */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-rose-600" />
            <span>ประวัติการส่งการบ้าน ({mySubmissions.length} รายการ)</span>
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
            {mySubmissions.length === 0 ? (
              <p className="text-slate-400 text-center py-2">ยังไม่มีประวัติการส่งการบ้าน</p>
            ) : (
              mySubmissions.map((sub) => {
                const asg = assignments.find((a) => a.id === sub.assignmentId);
                return (
                  <div
                    key={sub.assignmentId}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block text-xs truncate max-w-[200px]">
                        {asg?.title || sub.assignmentId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    <div>
                      {sub.score !== undefined ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px]">
                          {sub.score}/{asg?.maxScore || 10} คะแนน
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 font-bold text-[10px]">
                          ส่งแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
