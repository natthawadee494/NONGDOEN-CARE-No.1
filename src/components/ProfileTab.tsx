import React, { useState } from 'react';
import {
  User as UserIcon,
  Palette,
  Database,
  Save,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  Camera,
  Layers,
  Heart,
  Check,
  Table,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AppState, ThemeColor, User, Assignment, GoogleSheetsConfig } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';
import { exportBackupJson } from '../utils/storage';
import {
  fetchAssignmentsFromGoogleSheets,
  exportAssignmentsToCsv,
  downloadCsvFile,
  SAMPLE_GOOGLE_SHEET_CSV,
} from '../utils/googleSheets';

interface ProfileTabProps {
  currentUser: User | null;
  appState: AppState;
  onUpdateUser: (updated: User) => void;
  onImportBackup: (state: AppState) => void;
  onResetDefaultData: () => void;
  assignments?: Assignment[];
  sheetsConfig?: GoogleSheetsConfig;
  onUpdateSheetsConfig?: (cfg: GoogleSheetsConfig) => void;
  onSyncAssignments?: (newAssignments: Assignment[]) => void;
}

export const THEMES: {
  id: ThemeColor;
  name: string;
  emoji: string;
  badge: string;
  previewColor: string;
  accentText: string;
}[] = [
  {
    id: 'rose',
    name: 'ชมพูซากุระ (Sakura Rose)',
    emoji: '🌸',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    previewColor: '#e11d48',
    accentText: 'text-rose-600',
  },
  {
    id: 'lavender',
    name: 'ลาเวนเดอร์นุ่มนวล (Soft Lavender)',
    emoji: '💜',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    previewColor: '#9333ea',
    accentText: 'text-purple-600',
  },
  {
    id: 'mint',
    name: 'มิ้นต์สดชื่นสบายตา (Fresh Mint)',
    emoji: '🍃',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    previewColor: '#10b981',
    accentText: 'text-emerald-600',
  },
  {
    id: 'sky',
    name: 'ท้องฟ้าสดใส (Clear Sky)',
    emoji: '🌊',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    previewColor: '#0284c7',
    accentText: 'text-sky-600',
  },
  {
    id: 'official',
    name: 'ชมพู-ดำ อัตลักษณ์ รร. (Official Pink-Black)',
    emoji: '🖤',
    badge: 'bg-slate-900 text-rose-300 border-slate-700',
    previewColor: '#0f172a',
    accentText: 'text-rose-500',
  },
];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  appState,
  onUpdateUser,
  onImportBackup,
  onResetDefaultData,
  assignments = [],
  sheetsConfig = appState.sheetsConfig,
  onUpdateSheetsConfig,
  onSyncAssignments,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'theme' | 'backup' | 'sheets'>('info');

  // Google Sheets state
  const [sheetUrl, setSheetUrl] = useState(sheetsConfig?.sheetUrl || '');
  const [sheetName, setSheetName] = useState(sheetsConfig?.sheetName || 'Sheet1');
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetStatusMsg, setSheetStatusMsg] = useState<string | null>(sheetsConfig?.statusMsg || null);
  const [isSheetConnected, setIsSheetConnected] = useState<boolean>(sheetsConfig?.isConnected || false);

  const [prefix, setPrefix] = useState(currentUser?.prefix || (currentUser?.role === 'teacher' ? 'คุณครู' : 'เด็กชาย'));
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [room, setRoom] = useState(currentUser?.room || 'ป.1');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [avatarSize, setAvatarSize] = useState<number>(currentUser?.avatarSize || 96);
  const [themeColor, setThemeColor] = useState<ThemeColor>(currentUser?.themeColor || 'rose');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: User = {
      ...currentUser,
      prefix,
      firstName,
      lastName,
      nickname,
      email,
      phone,
      room,
      bio,
      avatarUrl,
      avatarSize,
      themeColor,
    };

    onUpdateUser(updated);
    playSuccess();
    triggerConfetti();
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.students)) {
            onImportBackup(parsed);
            playSuccess();
            triggerConfetti();
            alert('นำเข้าข้อมูลสำรองสำเร็จแล้ว!');
          } else {
            alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
          }
        } catch {
          alert('ไม่สามารถอ่านไฟล์ JSON สำรองได้');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSyncSheets = async () => {
    if (!sheetUrl.trim()) {
      setSheetStatusMsg('กรุณากรอกลิงก์ Google Sheets');
      setIsSheetConnected(false);
      return;
    }

    setIsSyncing(true);
    setSheetStatusMsg('กำลังเชื่อมต่อและดึงข้อมูลจาก Google Sheets...');
    playClick();

    const result = await fetchAssignmentsFromGoogleSheets(sheetUrl, sheetName);
    setIsSyncing(false);

    if (result.success) {
      setIsSheetConnected(true);
      setSheetStatusMsg(`ซิงค์ข้อมูลสำเร็จ! ดึงการบ้านได้ทั้งหมด ${result.data.length} รายการ`);
      playSuccess();
      triggerConfetti();

      if (onSyncAssignments) onSyncAssignments(result.data);
      if (onUpdateSheetsConfig) {
        onUpdateSheetsConfig({
          sheetUrl,
          sheetName,
          lastSyncedAt: new Date().toISOString(),
          autoSync: sheetsConfig?.autoSync || false,
          isConnected: true,
          statusMsg: `ซิงค์สำเร็จ (${result.data.length} รายการ)`,
        });
      }
    } else {
      setIsSheetConnected(false);
      setSheetStatusMsg(result.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheets');
    }
  };

  const handleExportCsv = () => {
    playClick();
    const csvContent = exportAssignmentsToCsv(assignments);
    downloadCsvFile(csvContent, `nongdoen-care-assignments-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleDownloadTemplate = () => {
    playClick();
    downloadCsvFile(SAMPLE_GOOGLE_SHEET_CSV, 'nongdoen-care-assignments-template.csv');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Profile Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div
            style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
            className="rounded-3xl bg-rose-100 border-2 border-rose-400 overflow-hidden flex items-center justify-center font-black text-rose-700 text-3xl shrink-0 shadow-md transition-all relative group"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              firstName.slice(0, 1) || 'N'
            )}
            <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold">
              <Camera className="w-4 h-4 mb-0.5" />
              <span>เปลี่ยนรูป</span>
              <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
            </label>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-200">
                {currentUser?.role === 'teacher' ? 'คุณครูผู้ดูแลระบบ' : 'นักเรียน'}
              </span>
              <span className="text-xs font-bold text-slate-500">
                ชั้น {room}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              {prefix} {firstName} {lastName}
              {nickname && <span className="text-rose-600 font-bold ml-1.5">({nickname})</span>}
            </h2>
            <p className="text-xs text-slate-500">
              โรงเรียนหนองเดิ่นศรีเจริญวิทยา สพป.หนองคาย เขต 1
            </p>
            {currentUser?.role === 'student' && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  <span>แต้มความดี: {currentUser.exp || 100} EXP</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-2">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'info'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ข้อมูลส่วนตัว
          </button>
          <button
            onClick={() => setActiveSubTab('theme')}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'theme'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ตกแต่งธีม & ปรับขนาดรูป
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'backup'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            สำรองและกู้คืนข้อมูล
          </button>
          {currentUser?.role === 'teacher' && (
            <button
              onClick={() => setActiveSubTab('sheets')}
              className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'sheets'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              <span>ฐานข้อมูล Google Sheets</span>
            </button>
          )}
        </div>

        {/* Tab 1: Personal Info Form */}
        {activeSubTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">คำนำหน้า:</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">ชื่อจริง: *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">ชื่อเล่น:</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="เช่น ครูแคร์ / น้องเดิ่น"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">เบอร์โทรศัพท์:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0910610997"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">อีเมล:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nsw.ac.th"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">ข้อความแนะนำตัว (Bio):</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="เขียนประวัติย่อหรือคำอธิบายเกี่ยวกับตัวท่าน..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">URL รูปภาพประจำตัว (หรืออัปโหลดด้านบน):</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลส่วนตัว</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Theme & Avatar Size */}
        {activeSubTab === 'theme' && (
          <div className="space-y-6 pt-2 text-xs">
            {/* Theme Selector */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-700">เลือกชุดสีธีมของฉัน:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((th) => {
                  const isSelected = themeColor === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        setThemeColor(th.id);
                        if (currentUser) {
                          onUpdateUser({ ...currentUser, themeColor: th.id });
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          style={{ backgroundColor: th.previewColor }}
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-sm shadow-2xs"
                        >
                          {th.emoji}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block">{th.name}</span>
                          <span className="text-[10px] text-slate-400">โทนสีและแถบหัว</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Avatar Size Slider */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">
                  ปรับขนาดรูปภาพโปรไฟล์: {avatarSize}px
                </label>
                <span className="text-xs text-slate-500">60px - 140px</span>
              </div>
              <input
                type="range"
                min={60}
                max={140}
                value={avatarSize}
                onChange={(e) => {
                  const sz = Number(e.target.value);
                  setAvatarSize(sz);
                  if (currentUser) {
                    onUpdateUser({ ...currentUser, avatarSize: sz });
                  }
                }}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex items-center justify-center pt-2">
                <div
                  style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
                  className="rounded-2xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-rose-700 font-bold overflow-hidden shadow-xs transition-all"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    firstName.slice(0, 1) || 'N'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Backup & Restore */}
        {activeSubTab === 'backup' && (
          <div className="space-y-5 pt-2 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Database className="w-4 h-4 text-rose-600" />
                <span>สำรองข้อมูลระบบ (Export Backup JSON)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                ดาวน์โหลดข้อมูลนักเรียน การบ้าน การเช็กชื่อ และคะแนนทั้งหมดเก็บไว้เป็นไฟล์สำรอง .json
              </p>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  exportBackupJson(appState);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์สำรองข้อมูล (.json)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-rose-600" />
                <span>นำเข้าข้อมูลสำรอง (Import Backup JSON)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                เลือกไฟล์ .json ที่เคยสำรองไว้เพื่อนำข้อมูลกลับมาใช้งาน
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-xs cursor-pointer mt-2">
                <Upload className="w-4 h-4" />
                <span>เลือกไฟล์นำเข้า (.json)</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
              <h4 className="font-bold text-rose-800 text-sm flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>รีเซ็ตเป็นข้อมูลเริ่มต้น (Reset to Factory Defaults)</span>
              </h4>
              <p className="text-rose-700/80 leading-relaxed">
                ล้างข้อมูลและคืนค่าระบบกลับเป็นค่าโรงเรียนเริ่มต้น (มีนักเรียนและข้อมูลตัวอย่างครบถ้วน)
              </p>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'คุณแน่ใจหรือไม่ที่จะคืนค่าระบบเริ่มต้น? ข้อมูลที่บันทึกไว้จะถูกรีเซ็ตกลับเป็นค่าตั้งต้นของโรงเรียน'
                    )
                  ) {
                    onResetDefaultData();
                    playSuccess();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>รีเซ็ตข้อมูลเริ่มต้น</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Google Sheets Database (ส่วนชีตในบัญชีส่วนตัวของคุณครู) */}
        {activeSubTab === 'sheets' && currentUser?.role === 'teacher' && (
          <div className="space-y-5 text-xs pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">การเชื่อมต่อ Google Sheets</h4>
                  <p className="text-slate-500 text-[11px]">
                    จัดการการซิงค์ข้อมูลภาระงานและการบ้านของโรงเรียนหนองเดิ่นศรีเจริญวิทยา
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-black ${
                    isSheetConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isSheetConnected ? '● เชื่อมต่อแล้ว (Connected)' : '○ พร้อมเชื่อมต่อ'}
                </span>
                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดชีต</span>
                  </a>
                )}
              </div>
            </div>

            {/* Config Form */}
            <div className="space-y-3 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  ลิงก์ Google Sheets (แชร์แบบ Anyone with link can view หรือ Web Published):
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                  className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 font-mono text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">ชื่อแผ่นงาน (Sheet Tab Name):</label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="เช่น Sheet1 หรือ การบ้าน"
                    className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 font-bold focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleSyncSheets}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'ทดสอบ & ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
                  </button>
                </div>
              </div>

              {sheetStatusMsg && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
                    isSheetConnected
                      ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {isSheetConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{sheetStatusMsg}</span>
                </div>
              )}
            </div>

            {/* CSV Export & Template Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportCsv}
                className="p-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between font-bold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>ดาวน์โหลดข้อมูลการบ้านเป็น CSV</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">.csv</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="p-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between font-bold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-600" />
                  <span>ดาวน์โหลดไฟล์ต้นแบบสำหรับชีต</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Template</span>
              </button>
            </div>

            {/* Assignments synced count */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
              <div className="flex items-center justify-between font-bold text-slate-700 text-xs">
                <span>จำนวนการบ้านที่เชื่อมโยงกับฐานข้อมูล ({assignments.length} รายการ)</span>
                <span className="text-emerald-700 font-mono">
                  {sheetsConfig?.lastSyncedAt
                    ? `ซิงค์ล่าสุด: ${new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString('th-TH')}`
                    : 'ยังไม่มีการซิงค์'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
