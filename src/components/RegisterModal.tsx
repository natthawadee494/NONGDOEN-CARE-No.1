import React, { useState } from 'react';
import { UserPlus, Mail, Lock, ArrowLeft } from 'lucide-react';
import { User, UserRole } from '../types';
import { playSuccess } from '../utils/audio';
import { registerCloudAccount } from '../utils/cloudSync';

interface RegisterModalProps {
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
  onRegister: (user: User, password: string) => Promise<boolean> | boolean;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, role, onClose, onRegister, onOpenLogin }) => {
  const [prefix, setPrefix] = useState(role === 'teacher' ? 'คุณครู' : 'เด็กชาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('ป.1');
  const [number, setNumber] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setPrefix(role === 'teacher' ? 'คุณครู' : 'เด็กชาย');
      setFirstName(''); setLastName(''); setNickname(''); setEmail('');
      setRoom('ป.1'); setNumber(1); setPassword(''); setConfirmPassword('');
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!firstName.trim() || !lastName.trim() || !normalizedEmail || password.length < 4) {
      alert('กรุณากรอกข้อมูลให้ครบ และตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const user: User = {
      id: `usr-${role}-${Date.now()}`,
      role,
      login: normalizedEmail,
      prefix,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim() || firstName.trim(),
      email: normalizedEmail,
      room: role === 'student' ? room : undefined,
      number: role === 'student' ? Number(number) || 1 : undefined,
      exp: role === 'student' ? 50 : 0,
      bio: role === 'teacher' ? 'คุณครู โรงเรียนหนองเดิ่นศรีเจริญวิทยา' : 'นักเรียน โรงเรียนหนองเดิ่นศรีเจริญวิทยา',
      themeColor: role === 'teacher' ? 'rose' : 'sakura',
      avatarSize: 96,
    };

    const result = await registerCloudAccount(user, password);
    if (!result.success) {
      alert(result.message || 'ลงทะเบียนไม่สำเร็จ');
      return;
    }

    const accepted = await onRegister(user, password);
    if (accepted === false) return;

    playSuccess();
    alert('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ตั้งไว้');
    onClose();
    onOpenLogin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-slate-800 text-base">{role === 'teacher' ? 'ลงทะเบียนบัญชีคุณครู' : 'ลงทะเบียนบัญชีนักเรียน'}</h3>
            <p className="text-[11px] text-slate-500">ลงทะเบียนเสร็จแล้วต้องเข้าสู่ระบบอีกครั้ง</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">คำนำหน้า</label>
              <select value={prefix} onChange={e => setPrefix(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold">
                <option value="คุณครู">คุณครู</option><option value="เด็กชาย">เด็กชาย</option><option value="เด็กหญิง">เด็กหญิง</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div><label className="block font-bold text-slate-700 mb-1">ชื่อจริง *</label><input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" /></div>
            <div><label className="block font-bold text-slate-700 mb-1">นามสกุล *</label><input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block font-bold text-slate-700 mb-1">ชื่อเล่น</label><input value={nickname} onChange={e => setNickname(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" /></div>
            {role === 'student' && <div><label className="block font-bold text-slate-700 mb-1">ระดับชั้น *</label><select value={room} onChange={e => setRoom(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5">{['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'].map(r => <option key={r} value={r}>ชั้น {r}</option>)}</select></div>}
          </div>

          {role === 'student' && <div><label className="block font-bold text-slate-700 mb-1">เลขที่ *</label><input type="number" min={1} required value={number} onChange={e => setNumber(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" /></div>}

          <div>
            <label className="block font-bold text-slate-700 mb-1"><Mail className="w-3.5 h-3.5 inline mr-1" />อีเมล *</label>
            <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={role === 'teacher' ? 'teacher@nsw.ac.th' : 'student@nsw.ac.th'} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block font-bold text-slate-700 mb-1"><Lock className="w-3.5 h-3.5 inline mr-1" />รหัสผ่าน *</label><input type="password" minLength={4} required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" /></div>
            <div><label className="block font-bold text-slate-700 mb-1">ยืนยันรหัสผ่าน *</label><input type="password" minLength={4} required autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5" /></div>
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> ยืนยันการลงทะเบียน</button>
        </form>

        <div className="border-t border-slate-100 pt-3 text-center">
          <button type="button" onClick={() => { onClose(); onOpenLogin(); }} className="text-rose-600 font-bold hover:underline inline-flex items-center gap-1 text-xs"><ArrowLeft className="w-3 h-3" /> กลับไปเข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  );
};
