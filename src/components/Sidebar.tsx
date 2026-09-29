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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <span>{currentUser.nickname || currentUser.firstName}</span>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* 3. Aside Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between shadow-lg lg:shadow-xs transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div>
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <Mascot size="md" variant="mascot" className="group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white border-2 border-pink-400 shadow-2xs">
                  <span className="font-black text-xs text-slate-700 tracking-tight">
                    NONGDOEN <span className="text-pink-600">CARE</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold leading-tight line-clamp-1 mt-1">
                  รร.หนองเดิ่นศรีเจริญวิทยา
                </span>
                <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wider">สพป.หนองคาย เขต 1</span>
              </div>
            </button>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-3 bg-gradient-to-r from-rose-50/60 to-pink-50/40 border-b border-rose-100/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span>{currentUser?.nickname?.slice(0,1) || currentUser?.firstName?.slice(0,1) || 'N'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-xs text-slate-900 truncate">{currentUser?.prefix} {currentUser?.firstName}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {currentUser?.role === 'teacher' ? 'ครูประจำชั้น' : `นักเรียนชั้น ${currentUser?.room || ''}`}
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-rose-200/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-600 font-bold"><Layers className="w-3.5 h-3.5 text-rose-600" /><span>{isStudent ? 'ระดับชั้นที่เรียน:' : 'เปลี่ยนห้อง:'}</span></div>
              {isStudent ? (
                <span className="px-2.5 py-0.5 rounded-lg bg-pink-100 text-pink-700 font-black text-xs">{currentUser?.room || currentRoom}</span>
              ) : (
                <select value={currentRoom} onChange={(e) => onChangeRoom(e.target.value)} className="bg-transparent text-xs font-black text-rose-700 focus:outline-hidden cursor-pointer">
                  {ROOMS_LIST.map((room) => <option key={room} value={room}>{room.startsWith('อ.') ? `อนุบาล ${room.slice(2)} (${room})` : `ประถม ${room.slice(2)} (${room})`}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">แถบเมนูหลัก (Navigation)</div>
          <button onClick={() => handleNavClick('home')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'home' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
            <Home className="w-4 h-4" /><span>หน้าแรก & สารสนเทศ</span>{activeTab === 'home' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <button onClick={() => handleNavClick('profile')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'profile' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
            <User className="w-4 h-4" /><span>บัญชีส่วนตัว</span>{activeTab === 'profile' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          {isStudent && (
            <button onClick={() => handleNavClick('student-portal')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'student-portal' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
              <GraduationCap className="w-4 h-4" /><span>การบ้าน & ภาระงานของฉัน</span>{activeTab === 'student-portal' && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          )}

          {isTeacher && (
            <>
              <button onClick={() => handleNavClick('seating')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'seating' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                <CheckSquare className="w-4 h-4" /><span>ผังที่นั่ง & เช็กชื่อ ({currentRoom})</span>
              </button>
              <button onClick={() => handleNavClick('grading')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'grading' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                <BookOpen className="w-4 h-4" /><span>ตรวจงาน & สมุดคะแนน</span>
              </button>
              <button onClick={() => handleNavClick('homework')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'homework' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                <ClipboardList className="w-4 h-4" /><span>ติดตามการบ้าน & ใบงาน</span>
              </button>
              <button onClick={() => handleNavClick('students')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'students' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                <Users className="w-4 h-4" /><span>ทะเบียนนักเรียน (เพิ่ม/ลบ)</span>
              </button>
              <button onClick={() => handleNavClick('tools')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left ${activeTab === 'tools' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                <Wrench className="w-4 h-4" /><span>เครื่องมือครู (นาฬิกา/สุ่ม)</span>
              </button>
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
