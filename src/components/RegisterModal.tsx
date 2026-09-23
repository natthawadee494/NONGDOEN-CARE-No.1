import React, { useState } from 'react';
import { UserPlus, Mail, ArrowLeft } from 'lucide-react';
import { User, UserRole } from '../types';
import { playSuccess, triggerConfetti } from '../utils/audio';

interface RegisterModalProps {
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
  onRegister: (user: User) => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  role,
  onClose,
  onRegister,
  onOpenLogin,
}) => {
  const [prefix, setPrefix] = useState(role === 'teacher' ? 'คุณครู' : 'เด็กชาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('ป.1');
  const [number, setNumber] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'teacher') {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) return;

      try {
        const { loadCloudUsers } = await import('../utils/cloudSync');
        const cloudUsers = await loadCloudUsers();
        const teacher = cloudUsers.find(
          (u) =>
            u.role === 'teacher' &&
            (u.email || '').trim().toLowerCase() === normalizedEmail
        );

        if (!teacher) {
          alert('ไม่พบอีเมลครูในระบบ กรุณาแจ้งผู้ดูแลระบบเพิ่มอีเมลครูก่อน');
          return;
        }

        onRegister(teacher);
        playSuccess();
        triggerConfetti();
        onClose();
      } catch {
        alert('ไม่สามารถตรวจสอบอีเมลครูได้ กรุณาลองใหม่อีกครั้ง');
      }
      return;
    }

    if (!firstName.trim() || !lastName.trim()) return;

    const newUser: User = {
      id: `usr-student-${Date.now()}`,
      role: 'student',
      prefix,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || undefined,
      email: email.trim() || undefined,
      phone: undefined,
      room,
      number: Number(number) || 1,
      exp: 100,
      themeColor: 'rose',
      avatarSize: 96,
      passwordHash: undefined,
    };

    onRegister(newUser);
    playSuccess();
    triggerConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-rose-300 p-0.5 flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="โลโก้โรงเรียน" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base leading-tight">
                {role === 'teacher' ? 'ลงทะเบียนคุณครู' : 'ลงทะเบียนนักเรียนใหม่'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {role === 'teacher' ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">อีเมลครู: *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@nsw.ac.th"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-3 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วยอีเมล</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">คำนำหน้า: *</label>
                <select
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                >
                  <option value="เด็กชาย">เด็กชาย (ด.ช.)</option>
                  <option value="เด็กหญิง">เด็กหญิง (ด.ญ.)</option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">ชื่อจริง: *</label>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="ระบุชื่อจริง" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden" />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">นามสกุล: *</label>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="ระบุนามสกุล" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">ชื่อเล่น:</label>
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="เช่น แคร์ / น้องเดิ่น" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden" />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">ระดับชั้นเรียน: *</label>
                <select value={room} onChange={(e) => setRoom(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden">
                  {['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'].map((r) => <option key={r} value={r}>ชั้น {r}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">เลขที่ในห้องเรียน: *</label>
              <input type="number" required min={1} value={number} onChange={(e) => setNumber(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden" />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">อีเมลสำหรับเข้าสู่ระบบ: *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@nsw.ac.th" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden" />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              <UserPlus className="w-4 h-4" />
              <span>ยืนยันการลงทะเบียน</span>
            </button>
          </form>
        )}

        <div className="border-t border-slate-100 pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="text-rose-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
