import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  Music,
  CheckSquare,
  ClipboardList,
  Wrench,
  Table,
  Heart,
  Shield,
  Layers,
  GraduationCap,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Send,
  Youtube,
  Globe,
} from 'lucide-react';
import { Assignment, AttendanceRecord, Student, Subject, Submission, User, GoogleSheetsConfig } from '../types';
import { playClick, playSuccess } from '../utils/audio';

interface HomeTabProps {
  students: Student[];
  assignments: Assignment[];
  submissions: Submission[];
  attendance: AttendanceRecord[];
  subjects: Subject[];
  currentRoom: string;
  currentUser: User | null;
  todayDate: string;
  sheetsConfig: GoogleSheetsConfig;
  onNavigateTab: (tab: string) => void;
  onOpenLineModal: () => void;
  onOpenMarchModal: () => void;
  onOpenSheetsModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  students,
  assignments,
  submissions = [],
  attendance,
  subjects,
  currentRoom,
  currentUser,
  todayDate,
  sheetsConfig,
  onNavigateTab,
  onOpenLineModal,
  onOpenMarchModal,
  onOpenSheetsModal,
}) => {
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  const totalStudents = students.length;
  const kindergartenCount = students.filter((s) => s.room.startsWith('อ.')).length;
  const primaryCount = students.filter((s) => s.room.startsWith('ป.')).length;

  const activeRoom = (isStudent && currentUser?.room) || currentRoom;
  const roomStudents = students.filter((s) => s.room === activeRoom);

  // Attendance stats for today
  const todayAttendance = attendance.filter((a) => a.room === activeRoom && a.date === todayDate);
  const presentCount = todayAttendance.filter((a) => a.status === 'มา').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'สาย').length;
  const leaveCount = todayAttendance.filter((a) => a.status === 'ลา').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'ขาด').length;
  const attendanceRate = roomStudents.length > 0 ? Math.round((presentCount / roomStudents.length) * 100) : 100;

  // Assignments for current room
  const roomAssignments = assignments.filter((a) => a.room === activeRoom || a.room === 'ทุกห้อง');
  const mySubmissions = isStudent && currentUser ? submissions.filter((s) => s.studentId === currentUser.id) : [];
  const submittedCount = mySubmissions.length;
  const pendingCount = Math.max(0, roomAssignments.length - submittedCount);

  const [copiedLine, setCopiedLine] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-pink-500 selection:text-white pb-6">
      {/* Hero Welcome Banner with School Emblem */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-pink-200 shadow-md p-6 sm:p-7">
        <div className="absolute right-0 top-0 w-80 h-80 bg-pink-100/60 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-rose-50/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center p-1.5 rounded-2xl bg-white border-2 border-pink-300 shadow-sm overflow-hidden">
              <img
                src="/assets/thai_boy_notie.jpg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
                alt="มาสคอตเด็กชายน้องเดิ่น ชุดนักเรียนไทย"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-xl bg-white border-2 border-pink-400 shadow-2xs">
                  <span className="font-black text-xs text-slate-700 tracking-tight">
                    NONGDOEN <span className="text-pink-600">CARE</span>
                  </span>
                </div>
                <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                  สพป.หนองคาย เขต 1
                </span>
                {sheetsConfig.isConnected && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Table className="w-2.5 h-2.5" />
                    <span>ชีตซิงค์แล้ว</span>
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                โรงเรียนหนองเดิ่นศรีเจริญวิทยา
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                สวัสดี {currentUser?.prefix} {currentUser?.firstName} {currentUser?.lastName}
                {currentUser?.nickname && (
                  <span className="text-pink-600 font-bold ml-1">({currentUser.nickname})</span>
                )}{' '}
                • ระบบดิจิทัลดูแลช่วยเหลือนักเรียน
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 bg-pink-50/80 px-2.5 py-1 rounded-xl text-slate-700 border border-pink-100 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-pink-600" />
                  <span>ชั้น อ.1-3 และ ป.1-6</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-pink-50/80 px-2.5 py-1 rounded-xl text-slate-700 border border-pink-100 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-pink-600" />
                  <span>ม.11 ต.หนองกอมเกาะ</span>
                </span>
                <a
                  href="tel:0910610997"
                  className="inline-flex items-center gap-1 bg-pink-50/80 px-2.5 py-1 rounded-xl text-pink-700 border border-pink-200 font-bold hover:bg-pink-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>0910610997</span>
                </a>
                <a
                  href="https://youtube.com/@nongdoen473?si=8eBwG6yslxnSZ2Mn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-xl text-red-600 border border-red-200 font-bold hover:bg-red-100 transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube รร.</span>
                </a>
              </div>
            </div>
          </div>

          {/* Current Classroom Card */}
          <div className="flex flex-col items-start md:items-end justify-center shrink-0 bg-gradient-to-br from-pink-50 via-white to-pink-50/40 border-2 border-pink-200 rounded-2xl p-4 min-w-[190px] shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">
              {isStudent ? 'ห้องเรียนของฉัน' : 'ห้องเรียนปัจจุบัน'}
            </span>
            <span className="text-2xl font-black text-pink-600">
              {activeRoom.startsWith('อ.') ? `ชั้นอนุบาล ${activeRoom.slice(2)}` : `ชั้นประถมศึกษาปีที่ ${activeRoom.slice(2)}`}
            </span>
            <span className="text-xs text-slate-600 mt-0.5 font-medium">
              {isStudent && currentUser?.number ? (
                <>เลขที่ {currentUser.number} • คะแนน {currentUser.exp || 100} EXP ⭐</>
              ) : (
                <>นักเรียนในห้อง {roomStudents.length} คน</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Google Sheets Sync Alert Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-2xl p-4 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-900">
                ระบบเชื่อมต่อข้อมูล Google Sheets
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {assignments.length} ภาระงานในระบบ
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              ดึงข้อมูลการบ้านตามหัวตาราง: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] font-mono text-emerald-800">AssignmentId,Room,Title,Subject,Description,DueDate...</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              onOpenSheetsModal();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Table className="w-3.5 h-3.5" />
            <span>จัดการชีต / ดึงข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <section className="bg-white rounded-3xl p-6 border-2 border-pink-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base sm:text-lg">สรุปภาพรวม</h2>
              <p className="text-xs text-slate-500">
                {isStudent ? 'สรุปข้อมูลการเรียน การบ้าน และคะแนนความดีส่วนบุคคล' : `สรุปสถิติประจำวัน ชั้น ${activeRoom}`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            วันที่ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Students */}
          <div className="bg-gradient-to-br from-white to-pink-50/50 rounded-2xl p-5 border-2 border-pink-100 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {isStudent ? 'เพื่อนร่วมห้อง' : 'นักเรียนทั้งหมด'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-800">
                {isStudent ? roomStudents.length : totalStudents}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                <span>ชั้น {activeRoom}</span>
                <span className="mx-1">•</span>
                <span>{isStudent ? 'พร้อมเรียนรู้' : `อนุบาล ${kindergartenCount} / ประถม ${primaryCount}`}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Attendance */}
          <div className="bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl p-5 border-2 border-emerald-100 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">การมาเรียนวันนี้</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-emerald-600">{attendanceRate}%</div>
              <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                <span className="text-emerald-700 font-bold">มา {presentCount}</span>
                <span>•</span>
                <span className="text-amber-600">สาย {lateCount}</span>
                <span>•</span>
                <span className="text-purple-600">ลา {leaveCount}</span>
                <span>•</span>
                <span className="text-rose-600">ขาด {absentCount}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Homework */}
          <div className="bg-gradient-to-br from-white to-sky-50/40 rounded-2xl p-5 border-2 border-sky-100 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {isStudent ? 'การบ้านของฉัน' : `การบ้านห้อง ${activeRoom}`}
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-2xs">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-sky-600">{roomAssignments.length} งาน</div>
              <div className="text-[11px] text-slate-600 mt-1 font-medium">
                {isStudent ? (
                  <span className="text-emerald-700 font-bold">
                    ส่งแล้ว {submittedCount} งาน • รอส่ง {pendingCount} งาน
                  </span>
                ) : (
                  <span>มอบหมายในระบบดิจิทัล</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: EXP / Subjects */}
          <div className="bg-gradient-to-br from-white to-purple-50/40 rounded-2xl p-5 border-2 border-purple-100 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {isStudent ? 'แต้มความดี EXP' : 'กลุ่มสาระการเรียนรู้'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                {isStudent ? (
                  <Sparkles className="w-4 h-4 text-purple-600" />
                ) : (
                  <Layers className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-purple-600">
                {isStudent ? currentUser?.exp || 100 : subjects.length}
              </div>
              <div className="text-[11px] text-purple-700 mt-1 font-medium">
                <span>{isStudent ? 'คะแนนความประพฤติและจิตสาธารณะ' : '8 กลุ่มสาระแกนกลาง'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="bg-white rounded-3xl p-6 border-2 border-pink-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base sm:text-lg">ฟังก์ชันลัด</h2>
              <p className="text-xs text-slate-500">คลิกเพื่อเข้าสู่หน้าการทำงานหลักได้รวดเร็ว</p>
            </div>
          </div>
          <span className="text-xs text-slate-500">
            {isStudent ? 'เมนูสำหรับนักเรียน' : 'เมนูสำหรับคุณครู'}
          </span>
        </div>

        {/* Student Quick Buttons */}
        {isStudent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                playClick();
                onNavigateTab('student-portal');
              }}
              className="p-5 rounded-2xl border-2 border-pink-200 hover:border-pink-400 bg-pink-50/40 hover:bg-pink-50 transition-all text-left group flex flex-col justify-between cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-pink-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-black shadow-2xs">
                  {roomAssignments.length} งาน
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-800 text-base group-hover:text-pink-600 transition-colors">
                  ไปที่หน้าการบ้าน & เลือกส่งงาน
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ดูรายละเอียดการบ้าน เลือกว่าส่งแล้ว (กรณีส่งแล้ว) หรือแนบภาพถ่ายใบงานส่งคุณครู
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-pink-200/60 flex items-center justify-between text-xs font-bold text-pink-600">
                <span>เปิดดูการบ้านทันที</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => {
                playClick();
                onNavigateTab('profile');
              }}
              className="p-5 rounded-2xl border-2 border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 transition-all text-left group flex flex-col justify-between cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                  ปรับแต่งน่ารัก ✨
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-800 text-base group-hover:text-rose-600 transition-colors">
                  ไปที่หน้าบัญชีส่วนตัว & แต่งธีม
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ปรับขนาดรูปภาพโปรไฟล์ แต่งธีมสีน่ารัก ใส่ชื่อเล่น และตรวจสอบคะแนน EXP
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between text-xs font-bold text-rose-600">
                <span>เปิดหน้าบัญชีส่วนตัว</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* Teacher Quick Buttons */}
        {isTeacher && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <button
              onClick={() => {
                playClick();
                onNavigateTab('seating');
              }}
              className="p-4 rounded-2xl border-2 border-pink-100 hover:border-pink-300 hover:bg-pink-50/50 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-pink-600">
                  ผังที่นั่ง & เช็กชื่อห้องเรียน
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เช็กชื่อประจำวัน มา/สาย/ลา/ขาด และมอบแต้ม EXP
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                playClick();
                onNavigateTab('grading');
              }}
              className="p-4 rounded-2xl border-2 border-pink-100 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600">
                  โต๊ะตรวจงาน & บันทึกคะแนน
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตรวจภาพถ่ายการบ้าน ให้คะแนน และพิมพ์คำแนะนำ
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                playClick();
                onNavigateTab('homework');
              }}
              className="p-4 rounded-2xl border-2 border-pink-100 hover:border-purple-300 hover:bg-purple-50/40 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-purple-600">
                  ระบบติดตามการบ้าน
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตรวจสอบสถานะส่งงาน ค้างส่ง และส่งแจ้งเตือน
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                playClick();
                onNavigateTab('students');
              }}
              className="p-4 rounded-2xl border-2 border-pink-100 hover:border-amber-300 hover:bg-amber-50/40 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-600">
                  ทะเบียนนักเรียน (เพิ่ม/ลบ)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  จัดการรายชื่อ นำเข้า CSV ปรับเพิ่ม ลบ ข้อมูล
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                playClick();
                onNavigateTab('tools');
              }}
              className="p-4 rounded-2xl border-2 border-pink-100 hover:border-teal-300 hover:bg-teal-50/40 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-600">
                  เครื่องมือครู & วงล้อสุ่ม
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  นาฬิกาจับเวลาในห้องเรียน และวงล้อสุ่มตอบคำถาม
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                playClick();
                onNavigateTab('sheets');
              }}
              className="p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50 transition-all text-left group flex items-start gap-3.5 cursor-pointer shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-sm group-hover:text-emerald-700">
                  เชื่อมต่อ Google Sheets 📊
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  ซิงค์ข้อมูลภาระงานสดจาก Google Sheets
                </p>
              </div>
            </button>
          </div>
        )}
      </section>

      {/* School Information Section */}
      <section className="bg-white rounded-3xl p-6 border-2 border-pink-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base sm:text-lg">ข้อมูลโรงเรียน</h2>
              <p className="text-xs text-slate-500">โรงเรียนหนองเดิ่นศรีเจริญวิทยา สพป.หนองคาย เขต 1</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-200">
            ข้อมูลพื้นฐาน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-200/80 space-y-1.5">
            <div className="font-bold text-sm flex items-center gap-1.5 text-pink-700">
              <MapPin className="w-4 h-4" />
              <span>ที่อยู่และการติดต่อ</span>
            </div>
            <p className="text-slate-600">
              <strong>โรงเรียนหนองเดิ่นศรีเจริญวิทยา</strong>
              <br />
              หมู่ 11 ตำบลหนองกอมเกาะ อำเภอเมืองหนองคาย จังหวัดหนองคาย 43000
              <br />
              โทรศัพท์: 0910610997
              <br />
              สังกัด สพป.หนองคาย เขต 1
            </p>
          </div>

          <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-200/80 space-y-1.5">
            <div className="font-bold text-sm flex items-center gap-1.5 text-pink-700">
              <Layers className="w-4 h-4" />
              <span>ระดับชั้นที่เปิดสอน</span>
            </div>
            <p className="text-slate-600">
              • <strong>ระดับปฐมวัย:</strong> อนุบาล 1 (อ.1) - อนุบาล 3 (อ.3)
              <br />
              • <strong>ระดับประถมศึกษา:</strong> ประถมศึกษาปีที่ 1 (ป.1) - ประถมศึกษาปีที่ 6 (ป.6)
              <br />
              ดูแลเอาใจใส่นักเรียนอย่างใกล้ชิดด้วยระบบ NONGDOEN CARE
            </p>
          </div>

          <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-200/80 space-y-1.5">
            <div className="font-bold text-sm flex items-center gap-1.5 text-pink-700">
              <Heart className="w-4 h-4" />
              <span>สีประจำโรงเรียน & ความหมาย</span>
            </div>
            <p className="text-slate-600">
              <strong>สีประจำโรงเรียน:</strong> <span className="text-pink-600 font-bold">ชมพู</span> -{' '}
              <span className="text-slate-900 font-bold">ดำ</span>
              <br />
              • <strong className="text-pink-600">ชมพู:</strong> ความรัก ความอบอุ่น ความเมตตา และการดูแลเอาใจใส่
              <br />
              • <strong className="text-slate-900">ดำ:</strong> ความหนักแน่น เข้มแข็ง ในระเบียบวินัยและคุณธรรม
            </p>
          </div>
        </div>
      </section>

      {/* School March Anthem Card */}
      <section className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-md border-2 border-pink-300 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
            <Music className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-100 uppercase tracking-wider">
              <span>🎵 บทเพลงประจำสถานศึกษา</span>
            </div>
            <h2 className="font-black text-base sm:text-lg text-white">เพลงมาร์ชโรงเรียน</h2>
            <p className="text-xs text-pink-100 leading-relaxed max-w-xl">
              เพลงมาร์ชโรงเรียนหนองเดิ่นศรีเจริญวิทยา สัญลักษณ์แห่งความสามัคคี ศักดิ์ศรี และคุณธรรม
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playClick();
            onOpenMarchModal();
          }}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-pink-50 text-pink-600 font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Music className="w-4 h-4 text-pink-600" />
          <span>เปิดฟังเพลงมาร์ช & เนื้อร้อง</span>
        </button>
      </section>

      {/* LINE Official Account (LINE OA) Section - เอาไว้ใต้สุด */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#06C755]/30 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-50/70 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#06C755] text-white flex items-center justify-center font-black shadow-md shrink-0">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    LINE Official Account (LINE OA)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#06C755] border border-emerald-200">
                    ช่องทางทางการ
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  โรงเรียนหนองเดิ่นศรีเจริญวิทยา • ช่องทางสื่อสารผู้ปกครองและนักเรียน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  onOpenLineModal();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>เปิดตัวสร้างรายงานส่งเข้า LINE</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left Info & Actions */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                  <span className="text-lg">🔔</span>
                  <div>
                    <h4 className="font-bold text-slate-800">แจ้งเตือนเช็กชื่อประจำวัน</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      ทราบผลการเข้าเรียน มา/สาย/ขาด/ลา ได้ทันท่วงทีทุกเช้า
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                  <span className="text-lg">📚</span>
                  <div>
                    <h4 className="font-bold text-slate-800">ติดตามภาระงาน & การบ้าน</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      สรุปรายชื่อนักเรียนที่ค้างส่งงาน และกำหนดส่งใบงานแต่ละวิชา
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                  <span className="text-lg">👨‍🏫</span>
                  <div>
                    <h4 className="font-bold text-slate-800">สื่อสารกับครูประจำชั้น</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      สอบถามพัฒนาการ ปรึกษาเรื่องการเรียนและสวัสดิการนักเรียน
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                  <span className="text-lg">📢</span>
                  <div>
                    <h4 className="font-bold text-slate-800">ข่าวสารและกิจกรรม รร.</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      รับหนังสือราชการ ตารางสอบ และภาพกิจกรรมโรงเรียน
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="https://line.me/R/ti/p/@nongdoen"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="px-5 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>เพิ่มเพื่อน LINE Official Account</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-500">LINE ID:</span>
                  <code className="font-mono font-bold text-slate-800 select-all">@nongdoen</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('@nongdoen');
                      setCopiedLine(true);
                      setTimeout(() => setCopiedLine(false), 2000);
                      playSuccess();
                    }}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
                    title="คัดลอก LINE ID"
                  >
                    {copiedLine ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right QR Box */}
            <div className="lg:col-span-4 bg-gradient-to-b from-emerald-50 to-white p-4 rounded-2xl border-2 border-emerald-200 text-center flex flex-col items-center justify-center space-y-2.5">
              <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-sm border-2 border-emerald-300 flex flex-col items-center justify-center relative group">
                <img
                  src="/line_oa_qr.png"
                  alt="QR Code LINE OA โรงเรียนหนองเดิ่นศรีเจริญวิทยา"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <p className="text-[11px] font-bold text-slate-700">
                สแกน QR Code เพื่อเชื่อมต่อ LINE OA
              </p>
              <p className="text-[10px] text-slate-500">
                หรือค้นหา LINE ID: <strong className="text-emerald-700">@nongdoen</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
