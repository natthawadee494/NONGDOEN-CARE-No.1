import React from 'react';
import { Home, CheckSquare, BookOpen, ClipboardList, Menu, GraduationCap, User as UserIcon } from 'lucide-react';
import { playClick } from '../utils/audio';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  role: 'teacher' | 'student';
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  role,
  onOpenSidebar,
}) => {
  const handleTabClick = (tabId: string) => {
    playClick();
    onSelectTab(tabId);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
      <button
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'text-rose-600 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">หน้าแรก</span>
      </button>

      {role === 'teacher' ? (
        <>
          <button
            onClick={() => handleTabClick('seating')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'seating'
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className={`w-5 h-5 ${activeTab === 'seating' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">ผังที่นั่ง</span>
          </button>

          <button
            onClick={() => handleTabClick('grading')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'grading'
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'grading' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">ตรวจงาน</span>
          </button>

          <button
            onClick={() => handleTabClick('homework')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'homework'
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${activeTab === 'homework' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">การบ้าน</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => handleTabClick('student-portal')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'student-portal'
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className={`w-5 h-5 ${activeTab === 'student-portal' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">การบ้านของฉัน</span>
          </button>

          <button
            onClick={() => handleTabClick('profile')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">บัญชีของฉัน</span>
          </button>
        </>
      )}

      {/* Hamburger Menu 3 bars */}
      <button
        onClick={() => {
          playClick();
          onOpenSidebar();
        }}
        className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
        aria-label="เมนูทั้งหมด 3 ขีด"
      >
        <Menu className="w-5 h-5 stroke-[2.5] text-rose-600" />
        <span className="text-[10px] font-bold text-rose-600">เมนู 3 ขีด</span>
      </button>
    </nav>
  );
};
