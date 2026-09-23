import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Upload,
  Calendar,
  Sparkles,
  FileText,
  AlertCircle,
  Eye,
  Camera,
  Star,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Assignment, Submission, User, Student } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';

interface StudentPortalTabProps {
  currentUser: User | null;
  students: Student[];
  assignments: Assignment[];
  submissions: Submission[];
  onSubmitHomework: (assignmentId: string, studentId: string, imageUrl?: string, note?: string) => void;
  onToggleHomeworkStatus: (assignmentId: string, studentId: string, isSubmitted: boolean) => void;
  onViewImage: (url: string, caption?: string) => void;
}

export const StudentPortalTab: React.FC<StudentPortalTabProps> = ({
  currentUser,
  students,
  assignments,
  submissions,
  onSubmitHomework,
  onToggleHomeworkStatus,
  onViewImage,
}) => {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'pending'>('all');
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState('');
  const [uploadImagePreview, setUploadImagePreview] = useState<string | null>(null);
  const [copiedLine, setCopiedLine] = useState(false);

  // Find student profile matching current user
  const activeStudent =
    students.find((s) => s.id === currentUser?.id) ||
    students.find((s) => s.room === currentUser?.room && s.number === currentUser?.number) || {
      id: currentUser?.id || 'std-active',
      prefix: currentUser?.prefix || 'เด็กชาย',
      firstName: currentUser?.firstName || 'นักเรียน',
      lastName: currentUser?.lastName || 'ศรีเจริญ',
      nickname: currentUser?.nickname || currentUser?.firstName || 'น้องเดิ่น',
      room: currentUser?.room || 'ป.1',
      number: currentUser?.number || 1,
      phone: currentUser?.phone || '0910610997',
      status: 'normal' as const,
      exp: currentUser?.exp || 150,
      avatarUrl: currentUser?.avatarUrl,
    };

  const studentRoom = activeStudent.room || currentUser?.room || 'ป.1';
  const myAssignments = assignments.filter((a) => a.room === studentRoom || a.room === 'ทุกห้อง');

  const getSubmission = (asgId: string): Submission | undefined => {
    return submissions.find((s) => s.assignmentId === asgId && s.studentId === activeStudent.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickToggle = (asgId: string, currentIsSubmitted: boolean) => {
    playClick();
    const nextSubmitted = !currentIsSubmitted;
    if (nextSubmitted) {
      playSuccess();
      triggerConfetti();
    }
    onToggleHomeworkStatus(asgId, activeStudent.id, nextSubmitted);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignmentId) return;

    playSuccess();
    triggerConfetti();
    onSubmitHomework(submittingAssignmentId, activeStudent.id, uploadImagePreview || undefined, uploadNote.trim());

    setSubmittingAssignmentId(null);
    setUploadNote('');
    setUploadImagePreview(null);
  };

  // Filter assignments
  const filteredAssignments = myAssignments.filter((asg) => {
    const sub = getSubmission(asg.id);
    const isSubmitted = !!sub && (sub.status === 'submitted' || sub.status === 'graded');
    if (filter === 'submitted') return isSubmitted;
    if (filter === 'pending') return !isSubmitted;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Student Profile Card Banner */}
      <div
        className={`rounded-3xl bg-gradient-to-r ${
          currentUser?.themeColor === 'sakura'
            ? 'from-pink-900 via-rose-800 to-slate-900'
            : currentUser?.themeColor === 'lavender'
            ? 'from-purple-950 via-indigo-900 to-slate-900'
            : currentUser?.themeColor === 'mint'
            ? 'from-emerald-950 via-teal-900 to-slate-900'
            : currentUser?.themeColor === 'sky'
            ? 'from-sky-950 via-blue-900 to-slate-900'
            : currentUser?.themeColor === 'official'
            ? 'from-black via-slate-950 to-rose-950'
            : 'from-pink-950 via-rose-900 to-slate-950'
        } text-white p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6`}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              width: `${currentUser?.avatarSize || 80}px`,
              height: `${currentUser?.avatarSize || 80}px`,
            }}
            className="rounded-2xl bg-pink-600 flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden border-2 border-pink-300 shrink-0 transition-all"
          >
            {activeStudent.avatarUrl ? (
              <img src={activeStudent.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              activeStudent.firstName.slice(0, 1) || 'น'
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-pink-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>พอร์ทัลการบ้านนักเรียน • รร.หนองเดิ่นศรีเจริญวิทยา</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <span>
                {activeStudent.prefix} {activeStudent.firstName} {activeStudent.lastName}
              </span>
              {activeStudent.nickname && (
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/30 text-pink-200 text-xs font-bold border border-pink-400/40">
                  น้อง{activeStudent.nickname}
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5">
              <span>ชั้น {activeStudent.room}</span>
              <span>•</span>
              <span>เลขที่ {activeStudent.number}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-amber-300 font-extrabold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>แต้มความดี: {activeStudent.exp || 100} EXP</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Submit Counter */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 shrink-0">
          <div className="text-center px-2">
            <span className="text-[11px] text-pink-200 font-semibold block">การบ้านทั้งหมด</span>
            <span className="text-2xl font-black text-white">{myAssignments.length}</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <span className="text-[11px] text-emerald-200 font-semibold block">ส่งแล้ว</span>
            <span className="text-2xl font-black text-emerald-300">
              {myAssignments.filter((a) => !!getSubmission(a.id)).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              setFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ทั้งหมด ({myAssignments.length})
          </button>
          <button
            onClick={() => {
              playClick();
              setFilter('pending');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ยังไม่ส่ง ({myAssignments.filter((a) => !getSubmission(a.id)).length})
          </button>
          <button
            onClick={() => {
              playClick();
              setFilter('submitted');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'submitted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ส่งแล้ว ✓ ({myAssignments.filter((a) => !!getSubmission(a.id)).length})
          </button>
        </div>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">ยอดเยี่ยมมาก! ไม่มีงานค้างในหมวดนี้</h3>
          <p className="text-xs text-slate-500">นักเรียนส่งการบ้านครบถ้วน หรือยังไม่มีภาระงานใหม่</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((asg) => {
            const sub = getSubmission(asg.id);
            const isSubmitted = !!sub && (sub.status === 'submitted' || sub.status === 'graded');
            const isGraded = sub?.status === 'graded';

            return (
              <div
                key={asg.id}
                className={`bg-white rounded-2xl border-2 transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                  isSubmitted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-pink-200/80 hover:border-pink-400'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Subject & Status Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200">
                      {asg.subject}
                    </span>

                    {isSubmitted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                        <span>ส่งแล้ว</span>
                        {isGraded && sub.score !== undefined && (
                          <span className="ml-1 bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black text-[10px]">
                            {sub.score}/{asg.maxScore}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>รอส่งการบ้าน</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-slate-800 text-base leading-snug">
                    {asg.title}
                  </h3>

                  {/* Description */}
                  {asg.description && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {asg.description}
                    </p>
                  )}

                  {/* Attached worksheet image from teacher */}
                  {asg.imageUrl && (
                    <div className="pt-1">
                      <button
                        onClick={() => onViewImage(asg.imageUrl!, asg.title)}
                        className="inline-flex items-center gap-1.5 text-xs text-pink-600 font-bold hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูภาพถ่ายใบงานที่คุณครูแนบมา</span>
                      </button>
                    </div>
                  )}

                  {/* Submission details if already submitted */}
                  {sub && (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                        <span>ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleString('th-TH')}</span>
                        {sub.imageUrl && (
                          <button
                            onClick={() => onViewImage(sub.imageUrl!, `งานของ ${activeStudent.firstName}`)}
                            className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ดูรูปงานที่ส่ง</span>
                          </button>
                        )}
                      </div>
                      {sub.note && (
                        <p className="text-slate-700">
                          <strong>บันทึกของฉัน:</strong> {sub.note}
                        </p>
                      )}
                      {sub.feedback && (
                        <p className="text-emerald-900 bg-white/70 p-2 rounded-lg border border-emerald-200 mt-1">
                          <strong>คุณครูให้คำแนะนำ:</strong> {sub.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Due Date & Max Score info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>กำหนดส่ง: {asg.dueDate}</span>
                    </div>
                    <span>คะแนนเต็ม: {asg.maxScore} คะแนน</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {/* Quick Toggle: เลือกว่าส่งแล้ว (กรณีส่งแล้ว ✓) */}
                  <button
                    onClick={() => handleQuickToggle(asg.id, isSubmitted)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSubmitted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isSubmitted ? 'text-emerald-600' : 'text-pink-500'}`} />
                    <span>{isSubmitted ? 'ส่งแล้ว ✓ (คลิกเพื่อยกเลิก)' : 'เลือกว่าส่งแล้ว (กรณีส่งแล้ว ✓)'}</span>
                  </button>

                  {/* Attach Homework Image / Note Button */}
                  <button
                    onClick={() => {
                      playClick();
                      setSubmittingAssignmentId(asg.id);
                      setUploadNote(sub?.note || '');
                      setUploadImagePreview(sub?.imageUrl || null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto"
                  >
                    <Upload className="w-3.5 h-3.5 text-pink-400" />
                    <span>{isSubmitted ? 'แก้ไข/แนบรูปใหม่' : 'แนบรูปส่งการบ้าน'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student LINE Official Account (LINE OA) Section - เฉพาะสแกน QR Code ไม่มีการส่งข้อความหรือชีต */}
      <div className="bg-white rounded-3xl border-2 border-emerald-400/80 shadow-md p-6 relative overflow-hidden mt-6">
        <div className="absolute right-0 top-0 w-52 h-52 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#06C755] font-black text-xs">
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>LINE Official Account โรงเรียนหนองเดิ่นศรีเจริญวิทยา</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              สแกน QR Code เพื่อเพิ่มเพื่อน LINE OA
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              ให้นักเรียนหรือผู้ปกครองสแกน QR Code นี้ เพื่อติดตามข่าวสาร กิจกรรมโรงเรียน แจ้งเตือนการบ้าน และผลการมาเรียนประจำวันของห้อง <strong>{studentRoom}</strong> ได้อย่างสะดวกรวดเร็ว
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <a
                href="https://line.me/R/ti/p/@nongdoen"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="px-4 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>เพิ่มเพื่อนทาง LINE</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold text-[11px]">LINE ID:</span>
                <code className="font-mono font-bold text-slate-800">@nongdoen</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('@nongdoen');
                    setCopiedLine(true);
                    setTimeout(() => setCopiedLine(false), 2000);
                    playSuccess();
                  }}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
                  title="คัดลอก LINE ID"
                >
                  {copiedLine ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="shrink-0 flex flex-col items-center bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-300 shadow-xs">
            <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-center">
              <img
                src="/line_oa_qr.png"
                alt="LINE OA QR Code โรงเรียนหนองเดิ่นศรีเจริญวิทยา"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 mt-2">
              สแกน QR Code ด้วยกล้องหรือแอป LINE
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              @nongdoen
            </span>
          </div>
        </div>
      </div>

      {/* Homework Submission Modal */}
      {submittingAssignmentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">แนบภาพถ่ายส่งการบ้าน</h3>
                  <p className="text-xs text-slate-500">ถ่ายรูปใบงานหรือบันทึกข้อความส่งคุณครู</p>
                </div>
              </div>
              <button
                onClick={() => setSubmittingAssignmentId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              {/* File input / camera */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ถ่ายภาพหรือเลือกไฟล์รูปภาพใบงาน:
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-2xl p-5 hover:bg-pink-50/50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadImagePreview ? (
                    <div className="relative group/img">
                      <img
                        src={uploadImagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-xl object-contain shadow-md border"
                      />
                      <span className="block text-[11px] font-bold text-pink-600 text-center mt-2 group-hover/img:underline">
                        คลิกเพื่อเปลี่ยนรูปภาพ
                      </span>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">คลิกเพื่อถ่ายรูปหรือเลือกรูปภาพ</p>
                      <p className="text-[10px] text-slate-400">รองรับ JPG, PNG, WEBP จากกล้องหรืออัลบั้ม</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Note input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  ข้อความหรือหมายเหตุถึงคุณครู (ถ้ามี):
                </label>
                <textarea
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  placeholder="เช่น ทำเสร็จเรียบร้อยแล้วครับคุณครู, สงสัยข้อ 3 นิดหน่อยครับ"
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium focus:bg-white focus:border-pink-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignmentId(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ยืนยันส่งการบ้าน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
