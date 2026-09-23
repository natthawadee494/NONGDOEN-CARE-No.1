import React, { useState } from 'react';
import {
  ExternalLink,
  Phone,
  Sparkles,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User as UserIcon,
  Layers,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Youtube,
  MessageCircle,
  Copy,
  Check,
  Table,
  Send,
  Globe,
} from 'lucide-react';
import { User, Student } from '../types';
import { Mascot } from './Mascot';
import { playClick, playSuccess } from '../utils/audio';

interface LandingPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onQuickDemoTeacher: () => void;
  onQuickDemoStudent: () => void;
  existingStudents: Student[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onRegister,
  onQuickDemoTeacher,
  onQuickDemoStudent,
  existingStudents,
}) => {
  const [roleTab, setRoleTab] = useState<'teacher' | 'student'>('teacher');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('0910610997'); // phone or email
  const [loginPassword, setLoginPassword] = useState('1234');
  const [studentRoom, setStudentRoom] = useState('ป.1');
  const [studentNumber, setStudentNumber] = useState<number>(1);

  // Register form state
  const [prefix, setPrefix] = useState('คุณครู');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0910610997');
  const [room, setRoom] = useState('ป.1');
  const [number, setNumber] = useState<number>(1);
  const [password, setPassword] = useState('');
  const [copiedLine, setCopiedLine] = useState(false);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccess();

    if (roleTab === 'teacher') {
      const isCare =
        loginIdentifier === '0910610997' ||
        loginIdentifier.toLowerCase().includes('care') ||
        loginIdentifier.toLowerCase().includes('nongdoen');

      const teacherUser: User = {
        id: isCare ? 'usr-teacher-care' : `usr-teacher-${Date.now()}`,
        role: 'teacher',
        login: loginIdentifier,
        prefix: 'คุณครู',
        firstName: isCare ? 'ครูแคร์' : 'คุณครู',
        lastName: isCare ? 'ศรีเจริญ' : '',
        nickname: isCare ? 'ครูแคร์' : 'ครู',
        email: loginIdentifier.includes('@') ? loginIdentifier : 'care@nsw-school.com',
        phone: loginIdentifier.includes('@') ? '0910610997' : loginIdentifier,
        room: 'ป.1',
        exp: 999,
        bio: 'ครูประจำชั้น โรงเรียนหนองเดิ่นศรีเจริญวิทยา สพป.หนองคาย เขต 1',
      };
      onLogin(teacherUser);
    } else {
      // Student login
      const matched = existingStudents.find(
        (s) =>
          (s.room === studentRoom && s.number === studentNumber) ||
          s.email?.toLowerCase() === loginIdentifier.toLowerCase() ||
          s.phone === loginIdentifier
      );

      const isDoen =
        matched?.id === 'std-p1-doen' ||
        loginIdentifier === '0910610997' ||
        (studentRoom === 'ป.1' && studentNumber === 1);

      const studentUser: User = {
        id: matched ? matched.id : isDoen ? 'std-p1-doen' : `usr-std-${Date.now()}`,
        role: 'student',
        login: loginIdentifier,
        prefix: matched ? matched.prefix : 'เด็กชาย',
        firstName: matched ? matched.firstName : 'น้องเดิ่น',
        lastName: matched ? matched.lastName : 'ศรีเจริญ',
        nickname: matched ? matched.nickname : 'เดิ่น',
        room: matched ? matched.room : studentRoom,
        number: matched ? matched.number : studentNumber,
        email: loginIdentifier.includes('@') ? loginIdentifier : matched?.email || 'doen@nsw-school.com',
        phone: loginIdentifier.includes('@') ? matched?.phone || '0910610997' : loginIdentifier,
        exp: matched ? matched.exp : 100,
        bio: 'นักเรียนโรงเรียนหนองเดิ่นศรีเจริญวิทยา (NONGDOEN CARE)',
      };
      onLogin(studentUser);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccess();

    const newUser: User = {
      id: `usr-${roleTab}-${Date.now()}`,
      role: roleTab,
      prefix: prefix || (roleTab === 'teacher' ? 'คุณครู' : 'เด็กชาย'),
      firstName: firstName || (roleTab === 'teacher' ? 'คุณครู' : 'นักเรียน'),
      lastName: lastName || '',
      nickname: nickname || firstName,
      email: email || `${phone}@nsw-school.com`,
      phone: phone || '0910610997',
      room: room,
      number: roleTab === 'student' ? Number(number) || 1 : undefined,
      exp: roleTab === 'student' ? 50 : 999,
      bio: `${roleTab === 'teacher' ? 'คุณครู' : 'นักเรียนชั้น'} โรงเรียนหนองเดิ่นศรีเจริญวิทยา`,
    };

    onRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-slate-50 to-pink-50/40 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Official Top Bar */}
      <header className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ระบบบริการอิเล็กทรอนิกส์ โรงเรียนหนองเดิ่นศรีเจริญวิทยา สพป.หนองคาย เขต 1</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-[11px] flex-wrap">
            <a
              href="https://www.nsw-school.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-300 hover:text-white font-semibold transition-colors flex items-center gap-1"
            >
              <span>เว็บทางการ: www.nsw-school.com</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="https://kku-creative.my.canva.site/dahu41ngfhw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>เว็บสื่อสร้างสรรค์</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="https://youtube.com/@nongdoen473?si=8eBwG6yslxnSZ2Mn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-white font-semibold transition-colors flex items-center gap-1"
            >
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>YouTube: @nongdoen473</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">โทร: 0910610997</span>
          </div>
        </div>
      </header>

      {/* Main Landing Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center w-full">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2 max-w-xl">
          <div className="flex items-center justify-center gap-3">
            <Mascot size="lg" variant="logo" className="hover:scale-105 transition-transform" />
            <Mascot size="lg" variant="mascot" className="hover:scale-105 transition-transform" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>NONGDOEN CARE • ระบบดูแลช่วยเหลือนักเรียนและจัดการชั้นเรียน</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            โรงเรียนหนองเดิ่นศรีเจริญวิทยา
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            สำนักงานเขตพื้นที่การศึกษาประถมศึกษาหนองคาย เขต 1 (สพป.นค.1)
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden max-w-xl w-full">
          {/* Top Role Selector Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              onClick={() => {
                playClick();
                setRoleTab('teacher');
                setPrefix('คุณครู');
              }}
              className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                roleTab === 'teacher'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>ห้องครูประจำชั้น</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setRoleTab('student');
                setPrefix('เด็กชาย');
              }}
              className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                roleTab === 'student'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-white" />
              <span>พอร์ทัลนักเรียน</span>
            </button>
          </div>

          {/* Quick Trial Demo Banner */}
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 p-3.5 border-b border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-[11px] font-black text-rose-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
              <span>บัญชีทดลองใช้ (Trial Demo):</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  playSuccess();
                  onQuickDemoTeacher();
                }}
                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="ทดลองใช้งานในบทบาท ครูแคร์"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>ทดลองใช้: ครูแคร์</span>
              </button>

              <button
                onClick={() => {
                  playSuccess();
                  onQuickDemoStudent();
                }}
                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="ทดลองใช้งานในบทบาท น้องเดิ่น"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>ทดลองใช้: น้องเดิ่น</span>
              </button>
            </div>
          </div>

          {/* Login / Register Toggle Header */}
          <div className="flex border-b border-slate-100 px-6 pt-4 text-xs font-bold">
            <button
              onClick={() => {
                playClick();
                setAuthMode('login');
              }}
              className={`pb-2.5 mr-6 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ ({roleTab === 'teacher' ? 'คุณครู' : 'นักเรียน'})</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setAuthMode('register');
              }}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ลงทะเบียนบัญชีจริง ({roleTab === 'teacher' ? 'คุณครู' : 'นักเรียน'})</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {authMode === 'login' ? (
              roleTab === 'teacher' ? (
                /* TEACHER LOGIN */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-rose-600" />
                      <span>อีเมล หรือ เบอร์โทรศัพท์ประจำตัวครู:</span>
                    </label>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="เช่น 0910610997 หรือ care@nsw-school.com"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-500">
                      * คุณครูใช้เบอร์โทรหรืออีเมลที่ลงทะเบียนไว้ (ทดลองใช้: 0910610997)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>รหัสผ่าน:</span>
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <LogIn className="w-4 h-4 text-rose-400" />
                    <span>เข้าสู่ระบบห้องครูประจำชั้น</span>
                  </button>
                </form>
              ) : (
                /* STUDENT LOGIN */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-rose-600" />
                        <span>ระดับชั้น:</span>
                      </label>
                      <select
                        value={studentRoom}
                        onChange={(e) => setStudentRoom(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden cursor-pointer"
                      >
                        {['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'].map((r) => (
                          <option key={r} value={r}>
                            ชั้น {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">เลขที่:</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(Number(e.target.value))}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-rose-600" />
                      <span>หรือ อีเมล / เบอร์โทรศัพท์นักเรียน:</span>
                    </label>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="เช่น doen@nsw-school.com หรือ 0910610997"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>รหัสผ่าน:</span>
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบพอร์ทัลนักเรียน</span>
                  </button>
                </form>
              )
            ) : (
              /* DEDICATED REGISTER FORM (No need to select teacher/student again!) */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    กำลังลงทะเบียนในบทบาท:{' '}
                    <strong className="underline">
                      {roleTab === 'teacher' ? 'คุณครูประจำชั้น' : 'นักเรียน'}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      คำนำหน้า:
                    </label>
                    <select
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                    >
                      {roleTab === 'teacher' ? (
                        <>
                          <option value="คุณครู">คุณครู</option>
                          <option value="นาย">นาย</option>
                          <option value="นาง">นาง</option>
                          <option value="นางสาว">นางสาว</option>
                        </>
                      ) : (
                        <>
                          <option value="เด็กชาย">เด็กชาย</option>
                          <option value="เด็กหญิง">เด็กหญิง</option>
                          <option value="นาย">นาย</option>
                          <option value="นางสาว">นางสาว</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ชื่อจริง:
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="เช่น สมชาย"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      นามสกุล:
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="เช่น ใจดี"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ชื่อเล่น:
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="เช่น เดิ่น"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {roleTab === 'teacher' ? 'ชั้นเรียนประจำชั้น:' : 'ระดับชั้น:'}
                    </label>
                    <select
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                    >
                      {['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'].map((r) => (
                        <option key={r} value={r}>
                          {r.startsWith('อ.') ? `อนุบาล ${r.slice(2)} (${r})` : `ประถม ${r.slice(2)} (${r})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {roleTab === 'student' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      เลขที่ในห้องเรียน:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={number}
                      onChange={(e) => setNumber(Number(e.target.value))}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-rose-600" />
                      <span>อีเมล:</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="เช่น student@nsw-school.com"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-rose-600" />
                      <span>เบอร์โทรศัพท์:</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="เช่น 0910610997"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose-600" />
                    <span>ตั้งรหัสผ่าน:</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 4 ตัวอักษร"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    ยืนยันการลงทะเบียน ({roleTab === 'teacher' ? 'คุณครูประจำชั้น' : 'นักเรียน'})
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-500 text-xs border-t border-slate-200/60 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            โรงเรียนหนองเดิ่นศรีเจริญวิทยา หมู่ 11 ตำบลหนองกอมเกาะ อำเภอเมืองหนองคาย จังหวัดหนองคาย 43000
          </p>
          <p className="text-[11px] text-slate-500">
            สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาหนองคาย เขต 1 (สพป.นค.1) | โทรศัพท์ 0910610997
          </p>
        </div>
      </footer>
    </div>
  );
};
