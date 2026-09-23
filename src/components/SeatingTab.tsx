import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  UserX,
  FileQuestion,
  Sparkles,
  Share2,
  Check,
  UserCheck,
  Award,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Student } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';

interface SeatingTabProps {
  currentRoom: string;
  students: Student[];
  attendance: AttendanceRecord[];
  todayDate: string;
  onUpdateAttendance: (studentId: string, room: string, status: AttendanceStatus, date: string) => void;
  onMarkAllPresent: (room: string, date: string) => void;
  onRewardExp: (studentId: string, points: number) => void;
  onOpenStudentDetail: (student: Student) => void;
  onOpenLineModal: () => void;
}

export const SeatingTab: React.FC<SeatingTabProps> = ({
  currentRoom,
  students,
  attendance,
  todayDate,
  onUpdateAttendance,
  onMarkAllPresent,
  onRewardExp,
  onOpenStudentDetail,
  onOpenLineModal,
}) => {
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [clickMode, setClickMode] = useState<'cycle' | 'มา' | 'สาย' | 'ลา' | 'ขาด'>('cycle');

  const roomStudents = students
    .filter((s) => s.room === currentRoom)
    .sort((a, b) => a.number - b.number);

  const getAttendanceStatus = (studentId: string): AttendanceStatus => {
    const record = attendance.find(
      (a) => a.studentId === studentId && a.room === currentRoom && a.date === selectedDate
    );
    return record ? record.status : 'มา';
  };

  const handleSeatClick = (student: Student) => {
    playClick();
    const currentStatus = getAttendanceStatus(student.id);
    let nextStatus: AttendanceStatus;

    if (clickMode === 'cycle') {
      const cycle: AttendanceStatus[] = ['มา', 'สาย', 'ลา', 'ขาด'];
      const curIdx = cycle.indexOf(currentStatus);
      nextStatus = cycle[(curIdx + 1) % cycle.length];
    } else {
      nextStatus = clickMode;
    }

    onUpdateAttendance(student.id, currentRoom, nextStatus, selectedDate);
  };

  const handleMarkAll = () => {
    playSuccess();
    triggerConfetti();
    onMarkAllPresent(currentRoom, selectedDate);
  };

  // Stats calculation
  const total = roomStudents.length;
  const presentCount = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'มา').length;
  const lateCount = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'สาย').length;
  const leaveCount = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'ลา').length;
  const absentCount = roomStudents.filter((s) => getAttendanceStatus(s.id) === 'ขาด').length;
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-pink-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                ผังที่นั่ง & เช็กชื่อ
              </span>
              <span className="text-xs font-bold text-slate-500">
                ชั้น {currentRoom} ({total} คน)
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mt-1">
              ผังที่นั่งห้องเรียนประจำวัน ชั้น {currentRoom}
            </h2>
            <p className="text-xs text-slate-500">
              คลิกที่โต๊ะเพื่อเปลี่ยนสถานะการมาเรียน หรือกดให้แต้มความดี EXP นักเรียน
            </p>
          </div>

          {/* Date Picker & Fast Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-pink-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              onClick={handleMarkAll}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="เช็กชื่อนักเรียนทุกคนเป็น มาเรียน"
            >
              <UserCheck className="w-4 h-4" />
              <span>มาทุกคน</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onOpenLineModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="แชร์สรุปเช็กชื่อเข้า LINE กลุ่มผู้ปกครอง"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>แชร์สรุป LINE</span>
            </button>
          </div>
        </div>

        {/* Attendance Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-700 block">มาเรียน</span>
            <span className="text-xl font-black text-emerald-800">{presentCount}</span>
            <span className="text-[10px] text-emerald-600 block">({attendanceRate}%)</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-amber-700 block">มาสาย</span>
            <span className="text-xl font-black text-amber-800">{lateCount}</span>
            <span className="text-[10px] text-amber-600 block">คน</span>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-purple-700 block">ลา (ป่วย/กิจ)</span>
            <span className="text-xl font-black text-purple-800">{leaveCount}</span>
            <span className="text-[10px] text-purple-600 block">คน</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-rose-700 block">ขาดเรียน</span>
            <span className="text-xl font-black text-rose-800">{absentCount}</span>
            <span className="text-[10px] text-rose-600 block">คน</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-slate-700 block">นักเรียนทั้งหมด</span>
            <span className="text-xl font-black text-slate-800">{total}</span>
            <span className="text-[10px] text-slate-500 block">ชั้น {currentRoom}</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="font-bold text-slate-600">โหมดคลิก:</span>
          <button
            onClick={() => setClickMode('cycle')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              clickMode === 'cycle'
                ? 'bg-pink-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            วนสถานะไปเรื่อยๆ (Cycle)
          </button>
          <button
            onClick={() => setClickMode('มา')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              clickMode === 'มา'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            เลือก: มา
          </button>
          <button
            onClick={() => setClickMode('สาย')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              clickMode === 'สาย'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            เลือก: สาย
          </button>
          <button
            onClick={() => setClickMode('ลา')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              clickMode === 'ลา'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            เลือก: ลา
          </button>
          <button
            onClick={() => setClickMode('ขาด')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              clickMode === 'ขาด'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            เลือก: ขาด
          </button>
        </div>
      </div>

      {/* Classroom Seating Grid (Teacher front whiteboard at top) */}
      <div className="space-y-4">
        {/* Front of classroom whiteboard indicator */}
        <div className="w-full max-w-xl mx-auto py-2 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-xl text-center text-xs font-black text-slate-600 shadow-inner border border-slate-300 tracking-wider uppercase">
          หน้ากระดานดำ • โต๊ะคุณครูประจำชั้น
        </div>

        {/* Desks Grid */}
        {roomStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-pink-200 space-y-3">
            <UserX className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">ยังไม่มีรายชื่อนักเรียนในห้อง {currentRoom}</h3>
            <p className="text-xs text-slate-400">
              สามารถเพิ่มรายชื่อนักเรียนได้ที่แท็บ "ทะเบียนนักเรียน (เพิ่ม/ลบ)"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {roomStudents.map((std, idx) => {
              const status = getAttendanceStatus(std.id);

              const statusColor =
                status === 'มา'
                  ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800'
                  : status === 'สาย'
                  ? 'border-amber-300 bg-amber-50/50 text-amber-800'
                  : status === 'ลา'
                  ? 'border-purple-300 bg-purple-50/50 text-purple-800'
                  : 'border-rose-300 bg-rose-50/60 text-rose-800';

              const badgeColor =
                status === 'มา'
                  ? 'bg-emerald-500 text-white'
                  : status === 'สาย'
                  ? 'bg-amber-500 text-white'
                  : status === 'ลา'
                  ? 'bg-purple-500 text-white'
                  : 'bg-rose-500 text-white';

              return (
                <div
                  key={std.id}
                  className={`bg-white rounded-2xl border-2 transition-all p-4 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3 ${statusColor}`}
                >
                  {/* Top: Desk Number & Status Button */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      โต๊ะที่ {idx + 1}
                    </span>

                    <button
                      onClick={() => handleSeatClick(std)}
                      className={`px-3 py-1 rounded-full text-xs font-black transition-transform active:scale-95 cursor-pointer shadow-xs ${badgeColor}`}
                      title="คลิกเพื่อเปลี่ยนสถานะเช็กชื่อ"
                    >
                      {status}
                    </button>
                  </div>

                  {/* Student Info: Avatar + Names */}
                  <div
                    onClick={() => onOpenStudentDetail(std)}
                    className="flex items-center gap-3 cursor-pointer group"
                    title="คลิกเพื่อดูประวัตินักเรียนและสถิติ"
                  >
                    <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center font-black text-pink-700 text-base shrink-0 overflow-hidden border border-pink-200 group-hover:scale-105 transition-transform shadow-2xs">
                      {std.avatarUrl ? (
                        <img src={std.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        std.firstName.slice(0, 1)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-black text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded border border-pink-200">
                          #{std.number}
                        </span>
                        {std.nickname && (
                          <span className="text-xs font-black text-slate-800 truncate">
                            น้อง{std.nickname}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-pink-600 transition-colors">
                        {std.prefix} {std.firstName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{std.lastName}</p>
                    </div>
                  </div>

                  {/* Bottom: EXP & Reward button */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-[11px]">
                      <Sparkles className="w-3 h-3" />
                      <span>{std.exp || 100} EXP</span>
                    </span>

                    <button
                      onClick={() => {
                        playSuccess();
                        triggerConfetti();
                        onRewardExp(std.id, 5);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-50 hover:bg-pink-600 hover:text-white text-pink-700 font-bold text-[10px] border border-pink-200 transition-all cursor-pointer"
                      title="ให้รางวัลความดี +5 EXP"
                    >
                      <Award className="w-3 h-3" />
                      <span>+5 EXP</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
