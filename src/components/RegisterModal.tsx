import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  Sparkles,
  Save,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';

interface RegisterModalProps {
  isOpen: boolean;
  role: UserRole; // Dedicated role: no dropdown/switch to select teacher or student!
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
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('ป.1');
  const [number, setNumber] = useState(1);
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const newUser: User = {
      id: `usr-${role}-${Date.now()}`,
      role: role, // Directly determined without prompt or picker
      prefix: prefix,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      room: room,
      number: role === 'student' ? Number(number) || 1 : undefined,
      exp: role === 'student' ? 100 : undefined,
      themeColor: 'rose',
      avatarSize: 96,
    };

    onRegister(newUser);
    playSuccess();
    triggerConfetti();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-rose-300 p-0.5 flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="โลโก้โรงเรียน" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base leading-tight">
                {role === 'teacher' ? 'ลงทะเบียนคุณครูใหม่' : 'ลงทะเบียนนักเรียนใหม่'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {role === 'teacher' ? 'ระบบบริหารจัดการชั้นเรียน NONGDOEN CARE' : 'พอร์ทัลส่งการบ้านนักเรียน รร.หนองเดิ่นศรีเจริญวิทยา'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Note indicating dedicated registration form */}
        <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            {role === 'teacher'
              ? 'แบบฟอร์มลงทะเบียนสำหรับคุณครูประจำชั้นและผู้ดูแลระบบ'
              : 'แบบฟอร์มลงทะเบียนสำหรับนักเรียนประจำห้องเรียน'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Prefix + First Name + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">คำนำหน้า: *</label>
              {role === 'teacher' ? (
                <select
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                >
                  <option value="คุณครู">คุณครู</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              ) : (
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
              )}
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">ชื่อจริง: *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ระบุชื่อจริง"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">นามสกุล: *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="ระบุนามสกุล"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Nickname + Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">ชื่อเล่น:</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="เช่น แคร์ / น้องเดิ่น"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                {role === 'teacher' ? 'ห้องเรียนประจำชั้นที่ดูแล: *' : 'ระดับชั้นเรียน: *'}
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
              >
                {['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'].map((r) => (
                  <option key={r} value={r}>
                    ชั้น {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Number (only for students) */}
          {role === 'student' && (
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">เลขที่ในห้องเรียน: *</label>
              <input
                type="number"
                required
                min={1}
                value={number}
                onChange={(e) => setNumber(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                {role === 'teacher' ? 'อีเมลสำหรับเข้าสู่ระบบ: *' : 'อีเมลนักเรียน / ผู้ปกครอง:'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required={role === 'teacher'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nsw.ac.th"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ:</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">รหัสผ่านสำหรับเข้าใช้งาน: *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>ยืนยันการลงทะเบียน</span>
            </button>
          </div>
        </form>

        {/* Back to login */}
        <div className="border-t border-slate-100 pt-3 text-center">
          <p className="text-xs text-slate-500">
            มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="text-rose-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>กลับไปหน้าเข้าสู่ระบบ</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
