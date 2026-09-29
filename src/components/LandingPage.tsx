import React from 'react';
import { LogIn, UserPlus, ShieldCheck, GraduationCap, ExternalLink } from 'lucide-react';
import { playClick } from '../utils/audio';

interface LandingPageProps {
  onLogin: (role: 'teacher' | 'student') => void;
  onRegister: (role: 'teacher' | 'student') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 flex flex-col">
      <header className="bg-slate-900 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-bold">
            NONGDOEN CARE
            <span className="text-slate-400 font-medium ml-2">โรงเรียนหนองเดิ่นศรีเจริญวิทยา</span>
          </div>
          <a href="https://www.nsw-school.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-rose-300 hover:text-white flex items-center gap-1">
            เว็บไซต์โรงเรียน <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10 sm:py-16 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-black mb-4">
              ระบบดูแลช่วยเหลือนักเรียนและจัดการชั้นเรียน
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">ยินดีต้อนรับสู่ NONGDOEN CARE</h1>
            <p className="mt-3 text-sm sm:text-base text-slate-500">กรุณาลงทะเบียนบัญชีของคุณก่อน แล้วจึงเข้าสู่ระบบเพื่อใช้งาน</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5"><ShieldCheck className="w-7 h-7" /></div>
              <h2 className="text-xl font-black text-slate-900">สำหรับคุณครู</h2>
              <p className="text-sm text-slate-500 mt-2 min-h-12">จัดการชั้นเรียน การเข้าเรียน งาน คะแนน และข้อมูลนักเรียน</p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button type="button" onClick={() => { playClick(); onLogin('teacher'); }} className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> เข้าสู่ระบบ</button>
                <button type="button" onClick={() => { playClick(); onRegister('teacher'); }} className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-sm flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> ลงทะเบียน</button>
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-rose-200 shadow-xl p-6 sm:p-8">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-5"><GraduationCap className="w-7 h-7" /></div>
              <h2 className="text-xl font-black text-slate-900">สำหรับนักเรียน</h2>
              <p className="text-sm text-slate-500 mt-2 min-h-12">ดูงานที่ได้รับ ส่งงาน ตรวจคะแนน และติดตามสถานะการเรียน</p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button type="button" onClick={() => { playClick(); onLogin('student'); }} className="py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> เข้าสู่ระบบ</button>
                <button type="button" onClick={() => { playClick(); onRegister('student'); }} className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-sm flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> ลงทะเบียน</button>
              </div>
            </section>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-7">ไม่มีโหมดทดลองใช้ • การเข้าใช้งานต้องผ่านบัญชีที่ลงทะเบียนในระบบ</p>
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/70">โรงเรียนหนองเดิ่นศรีเจริญวิทยา • สพป.หนองคาย เขต 1</footer>
    </div>
  );
};
