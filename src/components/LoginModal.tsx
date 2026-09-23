import React, { useState } from 'react';
import {
  LogIn,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { User } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';
import { DEMO_TEACHER, DEMO_STUDENT } from '../utils/storage';
import { loadCloudUsers } from '../utils/cloudSync';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onOpenRegister: (rolePreset: 'teacher' | 'student') => void;
  existingUsers: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onOpenRegister,
  existingUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

  // Teacher inputs
  const [teacherEmailOrPhone, setTeacherEmailOrPhone] = useState('');

  // Student inputs
  const [studentRoom, setStudentRoom] = useState('ป.1');
  const [studentNumber, setStudentNumber] = useState('1');
  const [studentEmail, setStudentEmail] = useState('');

  if (!isOpen) return null;

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = teacherEmailOrPhone.trim().toLowerCase();
    const cloudUsers = await loadCloudUsers();
    const users = cloudUsers.length ? cloudUsers : existingUsers;
    const user = users.find((u) =>
      u.role === 'teacher' &&
      (u.email || '').trim().toLowerCase() === email
    );
    if (!user) {
      alert('ไม่พบอีเมลครูในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง');
      return;
    }
    playSuccess();
    triggerConfetti();
    onLogin(user);
    onClose();
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = studentRoom.trim();
    const number = Number(studentNumber) || 1;
    const key = studentEmail.trim().toLowerCase();
    const cloudUsers = await loadCloudUsers();
    const users = cloudUsers.length ? cloudUsers : existingUsers;
    const user = users.find((u) =>
      u.role === 'student' &&
      u.room === room &&
      Number(u.number) === number &&
      (!key || (u.email || '').trim().toLowerCase() === key || (u.nickname || '').trim().toLowerCase() === key)
    );
    if (!user) {
      alert('ไม่พบบัญชีนักเรียนนี้ กรุณาตรวจสอบชั้น/เลขที่/อีเมลหรือชื่อเล่น');
      return;
    }
    playSuccess(); triggerConfetti(); onLogin(user); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with School Crest */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-rose-300 p-0.5 flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="โลโก้โรงเรียน" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base leading-tight">เข้าสู่ระบบ NONGDOEN CARE</h3>
              <p className="text-[11px] text-slate-500">โรงเรียนหนองเดิ่นศรีเจริญวิทยา</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab switch between Teacher & Student */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('teacher');
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            สำหรับคุณครู
          </button>
          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('student');
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            สำหรับนักเรียน
          </button>
        </div>

        {/* Teacher Form */}
        {activeTab === 'teacher' ? (
          <form onSubmit={handleTeacherSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                อีเมลครู: *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={teacherEmailOrPhone}
                  onChange={(e) => setTeacherEmailOrPhone(e.target.value)}
                  placeholder="เช่น teacher.care@nsw.ac.th"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="hidden">
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบคุณครู</span>
              </button>

              {/* Quick Demo Button */}
              <button
                type="button"
                onClick={() => {
                  playSuccess();
                  triggerConfetti();
                  onLogin(DEMO_TEACHER);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>เข้าใช้งานทันทีด้วยบัญชีทดลอง: ครูแคร์</span>
              </button>
            </div>
          </form>
        ) : (
          /* Student Form */
          <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">ระดับชั้นเรียน: *</label>
                <select
                  value={studentRoom}
                  onChange={(e) => setStudentRoom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                >
                  {['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'].map((r) => (
                    <option key={r} value={r}>
                      ชั้น {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">เลขที่: *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                อีเมลนักเรียน (หรือชื่อเล่น):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="เช่น nongdoen@nsw.ac.th หรือ น้องเดิ่น"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบนักเรียน</span>
              </button>

              {/* Quick Demo Button */}
              <button
                type="button"
                onClick={() => {
                  playSuccess();
                  triggerConfetti();
                  onLogin(DEMO_STUDENT);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>เข้าใช้งานทันทีด้วยบัญชีทดลอง: น้องเดิ่น</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer: Register link */}
        <div className="border-t border-slate-100 pt-3 text-center">
          <p className="text-xs text-slate-500">
            ยังไม่มีบัญชีผู้ใช้งาน?{' '}
            <button
              onClick={() => {
                onClose();
                onOpenRegister(activeTab);
              }}
              className="text-rose-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5"
            >
              <span>ลงทะเบียนใช้งานใหม่</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
