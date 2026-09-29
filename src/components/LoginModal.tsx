import React, { useState } from 'react';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { playClick, playSuccess } from '../utils/audio';
import { loginCloudUser, setInitialCloudPassword } from '../utils/cloudSync';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => Promise<void> | void;
  onOpenRegister: (rolePreset: 'teacher' | 'student') => void;
  existingUsers: User[];
  rolePreset?: 'teacher' | 'student';
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onOpenRegister, existingUsers, rolePreset = 'teacher' }) => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>(rolePreset);
  const [email, setEmail] = useState(() => localStorage.getItem('nongdoen_remember_email') || '');
  const [password, setPassword] = useState('');
  const [setupPasswordMode, setSetupPasswordMode] = useState(false);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);\n  const [rememberLogin, setRememberLogin] = useState(() => localStorage.getItem('nongdoen_remember_login') === '1');

  React.useEffect(() => {
    if (isOpen) setActiveTab(rolePreset);
  }, [isOpen, rolePreset]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    const result = await loginCloudUser(normalizedEmail, password);
    if (!result.success || !result.user) {
      if ((result.message || '').includes('ยังไม่ได้ตั้งรหัสผ่าน')) {
        setSetupPasswordMode(true);
        setSetupPassword('');
        setSetupPasswordConfirm('');
        return;
      }
      alert(result.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      return;
    }

    if (result.user.role !== activeTab) {
      alert(activeTab === 'teacher' ? 'บัญชีนี้เป็นบัญชีนักเรียน กรุณาเข้าสู่หน้าสำหรับนักเรียน' : 'บัญชีนี้เป็นบัญชีครู กรุณาเข้าสู่หน้าสำหรับคุณครู');
      return;
    }

    if (rememberLogin) {
      localStorage.setItem('nongdoen_remember_email', normalizedEmail);
      localStorage.setItem('nongdoen_remember_login', '1');
    } else {
      localStorage.removeItem('nongdoen_remember_email');
      localStorage.removeItem('nongdoen_remember_login');
    }

    playSuccess();
    await onLogin(result.user);
    onClose();
  } finally {
    setSubmitting(false);
  }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-800 text-base">เข้าสู่ระบบ NONGDOEN CARE</h3>
            <p className="text-[11px] text-slate-500">ใช้บัญชีที่ลงทะเบียนไว้เท่านั้น</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          {(['teacher','student'] as const).map(role => (
            <button key={role} type="button" onClick={() => { playClick(); setActiveTab(role); }} className={`py-2.5 rounded-xl text-xs font-black ${activeTab === role ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'}`}>
              {role === 'teacher' ? 'สำหรับคุณครู' : 'สำหรับนักเรียน'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">อีเมล: *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder={activeTab === 'teacher' ? 'teacher@nsw.ac.th' : 'student@nsw.ac.th'} className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-3 font-medium text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">รหัสผ่าน: *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="รหัสผ่าน" className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-3 font-medium text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-none" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={rememberLogin} onChange={e => setRememberLogin(e.target.checked)} className="accent-rose-600" />
            จำอีเมลสำหรับครั้งถัดไป
          </label>

          {!setupPasswordMode ? (
            <button type="submit" disabled={submitting} className={`w-full py-3 rounded-xl text-white font-black text-sm shadow-md flex items-center justify-center gap-2 ${activeTab === 'teacher' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-rose-600 hover:bg-rose-700'}`}>
              <LogIn className="w-4 h-4" /> {submitting ? 'กำลังเข้าสู่ระบบ…' : `เข้าสู่ระบบ${activeTab === 'teacher' ? 'คุณครู' : 'นักเรียน'}`}
            </button>
          ) : null}
        </form>

        {setupPasswordMode && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div>
              <p className="font-black text-amber-900 text-sm">ตั้งรหัสผ่านครั้งแรก</p>
              <p className="text-[11px] text-amber-800 mt-1">พบบัญชีนี้แล้ว แต่ยังไม่มีรหัสผ่าน สามารถตั้งรหัสผ่านสำหรับบัญชีเดิมได้เลย</p>
            </div>
            <input type="password" minLength={6} value={setupPassword} onChange={e => setSetupPassword(e.target.value)} placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)" className="w-full bg-white border border-amber-200 rounded-xl px-3 py-3 text-sm outline-none" />
            <input type="password" minLength={6} value={setupPasswordConfirm} onChange={e => setSetupPasswordConfirm(e.target.value)} placeholder="ยืนยันรหัสผ่านใหม่" className="w-full bg-white border border-amber-200 rounded-xl px-3 py-3 text-sm outline-none" />
            <div className="flex gap-2">
              <button type="button" onClick={async () => {
                if (setupPassword.length < 6) return alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
                if (setupPassword !== setupPasswordConfirm) return alert('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
                const saved = await setInitialCloudPassword(normalizedEmail, setupPassword);
                if (!saved.success) return alert(saved.message || 'ตั้งรหัสผ่านไม่สำเร็จ');
                alert('ตั้งรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
                setPassword('');
                setSetupPasswordMode(false);
              }} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-black text-xs">
                ตั้งรหัสผ่าน
              </button>
              <button type="button" onClick={() => setSetupPasswordMode(false)} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs">
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 text-center" data-login-footer="true">
          <p className="text-xs text-slate-500">ยังไม่มีบัญชี?{' '}
            <button onClick={() => { onClose(); onOpenRegister(activeTab); }} className="text-rose-600 font-bold hover:underline inline-flex items-center gap-1">
              ลงทะเบียนก่อนเข้าสู่ระบบ <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
