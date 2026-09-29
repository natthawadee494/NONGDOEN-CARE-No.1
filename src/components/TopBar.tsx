import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  Phone,
  Music,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  ExternalLink,
  Youtube,
} from 'lucide-react';
import { User } from '../types';
import { isMuted, toggleMuted, playClick, playSuccess } from '../utils/audio';

interface TopBarProps {
  currentUser: User | null;
  onOpenMarchModal: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onOpenMarchModal,
  onOpenLogin,
  onLogout,
}) => {
  const [muted, setMutedState] = useState(isMuted());
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('th-TH', { dateStyle: 'long' }));
  }, []);

  const handleToggleSound = () => {
    const nextMuted = toggleMuted();
    setMutedState(nextMuted);
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left Side Links */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <a
            href="https://www.nsw-school.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 font-bold transition-colors group"
            title="เว็บไซต์ทางการ โรงเรียนหนองเดิ่นศรีเจริญวิทยา"
          >
            <Globe className="w-3.5 h-3.5 text-rose-400" />
            <span>เว็บทางการ: www.nsw-school.com</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </a>

          <span className="hidden md:inline text-slate-600">•</span>

          <a
            href="https://kku-creative.my.canva.site/dahu41ngfhw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-pink-300 hover:text-pink-100 font-medium transition-colors group"
            title="เว็บไซต์สื่อผลงานสร้างสรรค์ (ไม่ทางการ)"
          >
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>เว็บสื่อสร้างสรรค์</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </a>

          <span className="hidden sm:inline text-slate-600">•</span>

          <a
            href="https://youtube.com/@nongdoen473?si=8eBwG6yslxnSZ2Mn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold transition-colors group"
            title="ช่อง YouTube โรงเรียนหนองเดิ่นศรีเจริญวิทยา"
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube: @nongdoen473</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </a>

          <span className="hidden lg:inline text-slate-600">•</span>

          <span className="hidden xl:flex items-center gap-1 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>ม.11 ต.หนองกอมเกาะ อ.เมืองหนองคาย</span>
          </span>

          <a
            href="tel:0910610997"
            className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            <span>0910610997</span>
          </a>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* School March Anthem Button */}
          <button
            onClick={() => {
              playClick();
              onOpenMarchModal();
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/60 hover:bg-rose-900/80 transition-colors font-medium text-[11px] cursor-pointer"
            title="เปิดฟังเพลงมาร์ช โรงเรียนหนองเดิ่นศรีเจริญวิทยา"
          >
            <Music className="w-3 h-3" />
            <span>เพลงมาร์ช รร.</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors text-[11px] cursor-pointer"
            title={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
          >
            {muted ? (
              <VolumeX className="w-3 h-3 text-red-400" />
            ) : (
              <Volume2 className="w-3 h-3 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{muted ? 'เสียงปิด' : 'เสียงเปิด'}</span>
          </button>

          {/* Thai Date */}
          <span className="hidden md:inline text-slate-400 px-1">{dateStr}</span>

          {/* User Profile / Quick Switcher / Logout */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                  <span>{currentUser.firstName.slice(0, 1)}</span>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-semibold text-white leading-tight">
                    {currentUser.prefix} {currentUser.firstName}
                  </span>
                  <span className="text-[10px] text-rose-300 leading-none">
                    {currentUser.role === 'teacher' ? 'ครูประจำชั้น' : `นักเรียน (${currentUser.room || ''})`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  onLogout();
                }}
                className="p-1 text-slate-400 hover:text-rose-300 transition-colors ml-1 cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playClick();
                onOpenLogin();
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
