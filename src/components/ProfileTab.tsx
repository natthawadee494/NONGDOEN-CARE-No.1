import React from 'react';
import { User as UserIcon, Camera, MapPin, Save } from 'lucide-react';
import { User } from '../types';
import { compressImageDataUrl } from '../utils/image';

interface ProfileTabProps {
  currentUser: User | null;
  onUpdateUser: (updated: User) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser, onUpdateUser }) => {
  if (!currentUser) return null;

  const saveField = (field: keyof User, value: unknown) => {
    onUpdateUser({ ...currentUser, [field]: value } as User);
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await compressImageDataUrl(file, 512, 30000);
      saveField('avatarUrl', url);
    } catch {
      alert('ไม่สามารถประมวลผลรูปโปรไฟล์ได้');
    }
  };

  const displayName = [currentUser.prefix, currentUser.firstName, currentUser.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-rose-600 to-pink-500 h-28" />
        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative w-28 h-28 rounded-3xl bg-rose-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-3xl font-black text-rose-700">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12" />
              )}
              <label className="absolute inset-0 bg-black/45 text-white opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[10px] font-bold">
                <Camera className="w-5 h-5 mb-1" />
                เปลี่ยนรูป
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </label>
            </div>
            <div className="pb-1">
              <div className="text-xs font-bold text-rose-600">
                {currentUser.role === 'teacher' ? 'ครูผู้ดูแลระบบ' : 'นักเรียน'}
              </div>
              <h1 className="text-2xl font-black text-slate-900">{displayName || 'ยังไม่ได้ระบุชื่อ'}</h1>
              {currentUser.nickname && (
                <div className="text-sm font-bold text-slate-500">ชื่อเล่น: {currentUser.nickname}</div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[11px] font-bold text-slate-400 mb-1">ชื่อ-นามสกุล</div>
              <div className="font-bold text-slate-800">{displayName || '-'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> ประจำชั้น
              </div>
              <div className="font-bold text-slate-800">{currentUser.room || 'ยังไม่ได้ระบุชั้น'}</div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-[11px] font-bold text-slate-400 mb-1">ข้อความแนะนำตัว (Bio)</div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {currentUser.bio || 'ยังไม่ได้เขียนข้อความแนะนำตัว'}
            </p>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5 space-y-4">
            <h2 className="font-black text-slate-800">แก้ไขข้อมูลที่แสดง</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-bold text-slate-600">
                ชื่อเล่น
                <input
                  value={currentUser.nickname || ''}
                  onChange={(e) => saveField('nickname', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </label>
              <label className="text-xs font-bold text-slate-600">
                ประจำชั้น
                <input
                  value={currentUser.room || ''}
                  onChange={(e) => saveField('room', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </label>
            </div>
            <label className="text-xs font-bold text-slate-600 block">
              ข้อความไบโอ
              <textarea
                value={currentUser.bio || ''}
                onChange={(e) => saveField('bio', e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-medium resize-none"
                placeholder="เขียนข้อความแนะนำตัว..."
              />
            </label>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Save className="w-4 h-4" />
              ข้อมูลจะบันทึกเข้าบัญชีผู้ใช้และระบบ Cloud ตามการซิงค์ของระบบ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
