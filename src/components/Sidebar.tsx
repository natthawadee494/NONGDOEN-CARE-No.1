import React from 'react';
import {
  Home,
  CheckSquare,
  ClipboardList,
  BookOpen,
  Users,
  Wrench,
  ChevronRight,
  ExternalLink,
  Globe,
  Music,
  Table,
  Layers,
  Sparkles,
  Menu,
  X,
  GraduationCap,
  LogOut,
  Youtube,
} from 'lucide-react';
import { User, GoogleSheetsConfig } from '../types';
import { Mascot } from './Mascot';
import { playClick } from '../utils/audio';

export const ROOMS_LIST = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentRoom: string;
  onChangeRoom: (room: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenMarchModal: () => void;
  sheetsConfig?: GoogleSheetsConfig;
  onOpenLogin?: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  currentRoom,
  onChangeRoom,
  currentUser,
  onLogout,
  onOpenMarchModal,
  sheetsConfig,
  onOpenLogin,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  const handleNavClick = (tabId: string) => {
    playClick();
    onSelectTab(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* 1. Mobile Sticky Top Header with 3-lines menu button (☰) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClick();
              setIsMobileOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            aria-label="เปิดเมนูด้านซ้าย"
            title="เปิดเมนูด้านซ้าย (เมนู 3 ขีด)"
          >
            <Menu className="w-5 h-5 text-rose-600 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <Mascot size="sm" variant="mascot" />
            <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white border-2 border-pink-400 shadow-2xs">
              <span className="font-black text-xs text-slate-700 tracking-tight">
                NONGDOEN <span className="text-pink-600">CARE</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              <button
                onClick={() => handleNavClick('seating')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'seating'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span>ผังที่นั่ง & เช็กชื่อ ({currentRoom})</span>
                {activeTab === 'seating' && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>

              <button
                onClick={() => handleNavClick('grading')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'grading'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>ตรวจงาน & สมุดคะแนน</span>
                {activeTab === 'grading' && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>

              <button
                onClick={() => handleNavClick('homework')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'homework'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span>ติดตามการบ้าน & ใบงาน</span>
                {activeTab === 'homework' && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>

              <button
                onClick={() => handleNavClick('students')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>ทะเบียนนักเรียน (เพิ่ม/ลบ)</span>
                {activeTab === 'students' && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>

              <button
                onClick={() => handleNavClick('tools')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'tools'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-4 h-4 shrink-0" />
                <span>เครื่องมือครู (นาฬิกา/สุ่ม)</span>
                {activeTab === 'tools' && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>

              <button
              </>
          )}

          {/* External Links Section */}
          <div className="pt-4 pb-1">
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              เว็บไซต์ & สื่อโรงเรียน (3 ช่องทาง)
            </div>

            <a
              href="https://www.nsw-school.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-700 hover:text-rose-700 hover:bg-rose-50 transition-all group"
            >
              <Globe className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">เว็บทางการ (NSW)</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-rose-600 ml-auto shrink-0" />
            </a>

            <a
              href="https://kku-creative.my.canva.site/dahu41ngfhw"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-700 hover:text-pink-700 hover:bg-pink-50 transition-all group"
            >
              <Globe className="w-4 h-4 text-pink-600 shrink-0" />
              <span className="truncate">เว็บสื่อสร้างสรรค์</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-pink-600 ml-auto shrink-0" />
            </a>

            <a
              href="https://youtube.com/@nongdoen473?si=8eBwG6yslxnSZ2Mn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-700 hover:text-red-700 hover:bg-red-50 transition-all group"
            >
              <Youtube className="w-4 h-4 text-red-600 shrink-0" />
              <span className="truncate">YouTube รร. (@nongdoen473)</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-red-600 ml-auto shrink-0" />
            </a>

            <button
              onClick={() => {
                playClick();
                onOpenMarchModal();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-rose-800 hover:bg-rose-50 transition-all text-left cursor-pointer"
            >
              <Music className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">เพลงมาร์ชประจำ รร.</span>
            </button>
          </div>
        </div>

        {/* Bottom account actions */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={() => {
              playClick();
              onLogout();
            }}
            className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
};
