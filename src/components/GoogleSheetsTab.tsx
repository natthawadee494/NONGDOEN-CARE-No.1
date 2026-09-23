import React, { useState } from 'react';
import {
  Table,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Assignment, GoogleSheetsConfig } from '../types';
import {
  fetchAssignmentsFromGoogleSheets,
  exportAssignmentsToCsv,
  downloadCsvFile,
  SAMPLE_GOOGLE_SHEET_CSV,
} from '../utils/googleSheets';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';
import { APPS_SCRIPT_CODE } from '../utils/appsScriptCode';

interface GoogleSheetsTabProps {
  assignments: Assignment[];
  sheetsConfig: GoogleSheetsConfig;
  onUpdateSheetsConfig: (cfg: GoogleSheetsConfig) => void;
  onSyncAssignments: (newAssignments: Assignment[]) => void;
}

export const GoogleSheetsTab: React.FC<GoogleSheetsTabProps> = ({
  assignments,
  sheetsConfig,
  onUpdateSheetsConfig,
  onSyncAssignments,
}) => {
  const [sheetUrl, setSheetUrl] = useState(sheetsConfig.sheetUrl);
  const [sheetName, setSheetName] = useState(sheetsConfig.sheetName);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(sheetsConfig.statusMsg || null);
  const [isSuccess, setIsSuccess] = useState<boolean>(sheetsConfig.isConnected);
  const [hasCopiedTemplate, setHasCopiedTemplate] = useState(false);
  const [hasCopiedScript, setHasCopiedScript] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'sync' | 'template' | 'guide'>('sync');

  const handleSyncNow = async () => {
    if (!sheetUrl.trim()) {
      setStatusMessage('กรุณากรอกลิงก์ Google Sheets');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setStatusMessage('กำลังเชื่อมต่อและดึงข้อมูลจาก Google Sheets...');
    playClick();

    const result = await fetchAssignmentsFromGoogleSheets(sheetUrl, sheetName);

    setIsLoading(false);
    if (result.success) {
      setIsSuccess(true);
      setStatusMessage(`ซิงค์ข้อมูลสำเร็จ! ดึงการบ้านได้ทั้งหมด ${result.data.length} รายการ`);
      playSuccess();
      triggerConfetti();

      onSyncAssignments(result.data);
      onUpdateSheetsConfig({
        sheetUrl,
        sheetName,
        lastSyncedAt: new Date().toISOString(),
        autoSync: sheetsConfig.autoSync,
        isConnected: true,
        statusMsg: `ซิงค์ข้อมูลสำเร็จ (${result.data.length} รายการ)`,
      });
    } else {
      setIsSuccess(false);
      setStatusMessage(result.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
  };

  const handleDownloadTemplate = () => {
    playClick();
    downloadCsvFile(SAMPLE_GOOGLE_SHEET_CSV, 'nongdoen-care-assignments-template.csv');
  };

  const handleExportCurrent = () => {
    playClick();
    const csvContent = exportAssignmentsToCsv(assignments);
    downloadCsvFile(csvContent, `nongdoen-care-assignments-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleCopyCsvHeaders = () => {
    navigator.clipboard.writeText(
      'AssignmentId,Room,Title,Subject,Description,DueDate,EvalType,MaxScore,ImageUrl,TeacherId,CreatedAt,Status'
    );
    setHasCopiedTemplate(true);
    playClick();
    setTimeout(() => setHasCopiedTemplate(false), 2500);
  };

  const appsScriptCode = APPS_SCRIPT_CODE;


  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                  Google Sheets Integration
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  หัวตาราง: AssignmentId,Room,Title,Subject...
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-800 mt-1">
                ระบบเชื่อมต่อและดึงข้อมูล Google Sheets
              </h2>
              <p className="text-xs text-slate-500">
                ซิงค์ภาระงาน การบ้าน และคะแนนจาก Google Sheets สดแบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>ดาวน์โหลดแม่แบบ CSV</span>
            </button>

            <button
              onClick={handleExportCurrent}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-200"
            >
              <Upload className="w-4 h-4" />
              <span>ส่งออกการบ้านปัจจุบัน</span>
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-2 pt-1 border-b border-slate-100">
          <button
            onClick={() => setActiveSubTab('sync')}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'sync'
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ตั้งค่าและดึงข้อมูลสด (Live Sync)
          </button>
          <button
            onClick={() => setActiveSubTab('template')}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'template'
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            โครงสร้างตาราง 12 คอลัมน์
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-4 py-2 font-black text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'guide'
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            วิธีตั้งค่าแชร์ Google Sheets
          </button>
        </div>
      </div>

      {/* Tab 1: Live Sync & URL Form */}
      {activeSubTab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-4">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-600" />
              <span>ตั้งค่าลิงก์ Google Sheets</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  URL ของ Google Sheets (หรือ Published CSV Link):
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400">
                  รองรับทั้งลิงก์แชร์ทั่วไป, ลิงก์เผยแพร่ไปยังเว็บ (Publish to web), และ Google Apps Script Web App
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    ชื่อแท็บชีต (Sheet Name):
                  </label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Assignments"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSyncNow}
                    disabled={isLoading}
                    className="w-full py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลจากชีต (Fetch & Sync Now)'}</span>
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
                    isSuccess
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{statusMessage}</span>
                  {sheetsConfig.lastSyncedAt && (
                    <span className="ml-auto text-[10px] text-slate-500">
                      ล่าสุด: {new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString('th-TH')} น.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Synced Assignments Preview Table */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  รายการการบ้านในระบบที่ซิงค์กับ Google Sheets ({assignments.length} งาน)
                </h3>
                <p className="text-xs text-slate-500">
                  คอลัมน์มาตรฐาน: AssignmentId, Room, Title, Subject, DueDate, EvalType, MaxScore
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50 text-emerald-950 font-black border-b border-emerald-200">
                  <tr>
                    <th className="py-2.5 px-3">AssignmentId</th>
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">DueDate</th>
                    <th className="py-2.5 px-3">MaxScore</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-emerald-50/20 font-medium">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{asg.id}</td>
                      <td className="py-2 px-3 font-bold text-pink-600">{asg.room}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{asg.title}</td>
                      <td className="py-2 px-3 text-slate-600">{asg.subject}</td>
                      <td className="py-2 px-3 text-slate-600">{asg.dueDate}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">{asg.maxScore}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {asg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Column Specification */}
      {activeSubTab === 'template' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 className="font-black text-slate-800 text-base">
                โครงสร้าง 12 คอลัมน์ที่รองรับใน Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                แถวแรกของชีตต้องมีชื่อคอลัมน์ตรงตามนี้เพื่อการดึงข้อมูลที่แม่นยำ
              </p>
            </div>
            <button
              onClick={handleCopyCsvHeaders}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {hasCopiedTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopiedTemplate ? 'คัดลอกแล้ว!' : 'คัดลอกชื่อหัวตาราง'}</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
            <code>
              AssignmentId,Room,Title,Subject,Description,DueDate,EvalType,MaxScore,ImageUrl,TeacherId,CreatedAt,Status
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">1. AssignmentId</strong>
              <p className="text-slate-600">รหัสการบ้าน เช่น asg-01, hw-math-01</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">2. Room</strong>
              <p className="text-slate-600">ชั้นเรียน เช่น ป.1, ป.2 หรือ ทุกห้อง</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">3. Title</strong>
              <p className="text-slate-600">ชื่อการบ้าน / ภาระงาน เช่น แบบฝึกหัดคณิตศาสตร์ หน้า 12</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">4. Subject</strong>
              <p className="text-slate-600">วิชา เช่น ภาษาไทย, คณิตศาสตร์, วิทยาศาสตร์</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">5. Description</strong>
              <p className="text-slate-600">คำสั่งหรือคำชี้แจงในการทำใบงาน</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">6. DueDate</strong>
              <p className="text-slate-600">วันครบกำหนดส่ง รูปแบบ YYYY-MM-DD เช่น 2026-09-30</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">7. EvalType</strong>
              <p className="text-slate-600">ประเภทการวัดผล เช่น score, pass_fail, check</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">8. MaxScore</strong>
              <p className="text-slate-600">คะแนนเต็ม เช่น 10, 20, 100</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">9. ImageUrl</strong>
              <p className="text-slate-600">ลิงก์ภาพถ่ายใบงาน หรือภาพตัวอย่าง (ใส่หรือไม่ใส่ก็ได้)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">10. TeacherId</strong>
              <p className="text-slate-600">รหัสคุณครูผู้สั่งงาน เช่น usr-teacher-care</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">11. CreatedAt</strong>
              <p className="text-slate-600">วันที่สร้าง เช่น 2026-09-23T08:00:00.000Z</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-emerald-700">12. Status</strong>
              <p className="text-slate-600">สถานะเปิดหรือปิดรับงาน เช่น open หรือ closed</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Step-by-Step Guide */}
      {activeSubTab === 'guide' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-5">
          <div className="border-b border-emerald-100 pb-3">
            <h3 className="font-black text-slate-800 text-base">
              ขั้นตอนการตั้งค่าแชร์ Google Sheets ให้เว็บดึงข้อมูลได้
            </h3>
            <p className="text-xs text-slate-500">ทำตามขั้นตอนง่ายๆ 3 ขั้นตอนดังนี้</p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-700">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>เปิดสิทธิ์การแชร์ให้ทุกคนที่มีลิงก์</span>
              </div>
              <p className="pl-8 text-slate-600">
                ใน Google Sheets ของท่าน ให้คลิกปุ่ม <strong>"แชร์ (Share)"</strong> ที่มุมขวาบน ➡️ เปลี่ยนการเข้าถึงทั่วไปเป็น{' '}
                <strong>"ทุกคนที่มีลิงก์ (Anyone with the link)"</strong> ➡️ สิทธิ์เป็น{' '}
                <strong>"มีสิทธิ์ดู (Viewer)"</strong> ➡️ คัดลอกลิงก์มาวางในช่อง URL ด้านบน
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>หรือ เผยแพร่ไปยังเว็บ (Publish to web)</span>
              </div>
              <p className="pl-8 text-slate-600">
                ไปที่เมนู <strong>ไฟล์ (File)</strong> ➡️ <strong>แชร์ (Share)</strong> ➡️{' '}
                <strong>เผยแพร่ไปยังเว็บ (Publish to web)</strong> ➡️ เลือกแท็บ Assignments และเปลี่ยนรูปแบบเป็น{' '}
                <strong>ค่าที่คั่นด้วยจุลภาค (.csv)</strong> ➡️ คลิกเผยแพร่ แล้วคัดลอกลิงก์มาวาง
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                  3
                </span>
                <span>(ทางเลือกขั้นสูง) ใช้งานผ่าน Google Apps Script</span>
              </div>
              <div className="pl-8 space-y-2">
                <p className="text-slate-600">
                  สำหรับโรงเรียนที่ต้องการ Web App API สามารถไปที่ Extensions ➡️ Apps Script แล้วนำโค้ดด้านล่างนี้ไปวางและกด Deploy as Web App ได้ทันที:
                </p>
                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {appsScriptCode}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appsScriptCode);
                      setHasCopiedScript(true);
                      playClick();
                      setTimeout(() => setHasCopiedScript(false), 2500);
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {hasCopiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{hasCopiedScript ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
