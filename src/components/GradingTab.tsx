import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Save,
  Award,
  Sparkles,
  Layers,
  Table,
  Check,
  Search,
} from 'lucide-react';
import { Assignment, EvalType, Student, Subject, Submission, User } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';

interface GradingTabProps {
  currentRoom: string;
  currentUser: User | null;
  students: Student[];
  assignments: Assignment[];
  submissions: Submission[];
  subjects: Subject[];
  onAddAssignment: (asg: Assignment) => void;
  onGradeSubmission: (
    assignmentId: string,
    studentId: string,
    score: number | undefined,
    feedback: string
  ) => void;
  onViewImage: (url: string, caption?: string) => void;
  onOpenSheetsModal: () => void;
}

export const GradingTab: React.FC<GradingTabProps> = ({
  currentRoom,
  currentUser,
  students,
  assignments,
  submissions,
  subjects,
  onAddAssignment,
  onGradeSubmission,
  onViewImage,
  onOpenSheetsModal,
}) => {
  const roomAssignments = assignments.filter((a) => a.room === currentRoom || a.room === 'ทุกห้อง');
  const [selectedAsgId, setSelectedAsgId] = useState<string>(roomAssignments[0]?.id || '');
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New assignment form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'ภาษาไทย');
  const [newRoom, setNewRoom] = useState(currentRoom);
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date(Date.now() + 3 * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const [newEvalType, setNewEvalType] = useState<EvalType>('score');
  const [newMaxScore, setNewMaxScore] = useState(10);
  const [newImageUrl, setNewImageUrl] = useState('');

  const currentAssignment = assignments.find((a) => a.id === selectedAsgId) || roomAssignments[0];

  const roomStudents = students
    .filter((s) => s.room === currentRoom)
    .sort((a, b) => a.number - b.number);

  const filteredStudents = roomStudents.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.nickname?.toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  });

  const getStudentSubmission = (studentId: string): Submission | undefined => {
    if (!currentAssignment) return undefined;
    return submissions.find((s) => s.assignmentId === currentAssignment.id && s.studentId === studentId);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      room: newRoom,
      title: newTitle.trim(),
      subject: newSubject,
      description: newDescription.trim(),
      dueDate: newDueDate,
      evalType: newEvalType,
      maxScore: Number(newMaxScore) || 10,
      imageUrl: newImageUrl.trim() || undefined,
      teacherId: currentUser?.id || 'usr-teacher-care',
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    onAddAssignment(newAsg);
    setSelectedAsgId(newAsg.id);
    setIsCreatingModal(false);
    playSuccess();
    triggerConfetti();

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
  };

  const handleQuickFullScore = (studentId: string) => {
    if (!currentAssignment) return;
    playSuccess();
    onGradeSubmission(currentAssignment.id, studentId, currentAssignment.maxScore, 'ทำได้ถูกต้อง ครบถ้วน ยอดเยี่ยมมากครับ ⭐');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-pink-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
                โต๊ะตรวจงาน & สมุดคะแนน
              </span>
              <span className="text-xs font-bold text-slate-500">ห้อง {currentRoom}</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mt-1">
              ตรวจการบ้านและบันทึกคะแนนนักเรียน
            </h2>
            <p className="text-xs text-slate-500">
              ให้คะแนนแบบเรียลไทม์ พร้อมตรวจดูภาพถ่ายใบงานที่นักเรียนส่งมา
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                playClick();
                setIsCreatingModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สั่งการบ้านใหม่ (+ มอบหมายงาน)</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onOpenSheetsModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="จัดการเชื่อมต่อหรือดึงการบ้านจาก Google Sheets"
            >
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Google Sheets</span>
            </button>
          </div>
        </div>

        {/* Assignment Picker Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-700 shrink-0">เลือกการบ้าน:</span>
            {roomAssignments.length > 0 ? (
              <select
                value={currentAssignment?.id || ''}
                onChange={(e) => {
                  playClick();
                  setSelectedAsgId(e.target.value);
                }}
                className="bg-pink-50/70 border border-pink-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 w-full max-w-md focus:outline-hidden focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                {roomAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.subject}] {a.title} (ครบกำหนด: {a.dueDate})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400">ยังไม่มีการบ้านในห้องนี้</span>
            )}
          </div>

          {/* Search box for students */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรือเลขที่..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-pink-500"
            />
          </div>
        </div>

        {/* Current Assignment Summary Card */}
        {currentAssignment && (
          <div className="bg-gradient-to-r from-pink-50/60 to-white rounded-2xl p-4 border border-pink-200 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-pink-600 text-white font-black text-xs">
                  {currentAssignment.subject}
                </span>
                <h3 className="font-black text-slate-800 text-sm">{currentAssignment.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>กำหนดส่ง: {currentAssignment.dueDate}</span>
                <span>•</span>
                <span className="font-bold text-pink-600">
                  คะแนนเต็ม: {currentAssignment.maxScore} คะแนน
                </span>
              </div>
            </div>
            {currentAssignment.description && (
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-pink-100">
                {currentAssignment.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Scorebook Table */}
      <div className="bg-white rounded-3xl border-2 border-pink-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pink-50/70 border-b border-pink-100 text-slate-700 font-black">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">เลขที่</th>
                <th className="py-3.5 px-4 min-w-[180px]">นักเรียน</th>
                <th className="py-3.5 px-4 w-28 text-center">สถานะส่งงาน</th>
                <th className="py-3.5 px-4 w-32 text-center">ภาพถ่ายใบงาน</th>
                <th className="py-3.5 px-4 w-32 text-center">
                  คะแนน ({currentAssignment?.maxScore || 10})
                </th>
                <th className="py-3.5 px-4 min-w-[220px]">คำแนะนำ/คำชมจากครู</th>
                <th className="py-3.5 px-4 w-24 text-center">คะแนนเต็ม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    ไม่พบรายชื่อนักเรียน
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const sub = getStudentSubmission(std.id);
                  const isSubmitted = !!sub && (sub.status === 'submitted' || sub.status === 'graded');

                  return (
                    <tr
                      key={std.id}
                      className={`hover:bg-pink-50/20 transition-colors ${
                        isSubmitted ? 'bg-emerald-50/10' : ''
                      }`}
                    >
                      {/* Number */}
                      <td className="py-3 px-4 text-center font-black text-pink-600">
                        {std.number}
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-pink-200">
                            {std.avatarUrl ? (
                              <img src={std.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              std.firstName.slice(0, 1)
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {std.prefix} {std.firstName} {std.lastName}
                            </span>
                            {std.nickname && (
                              <span className="text-[11px] text-pink-600 font-semibold">
                                ({std.nickname})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Submission Status */}
                      <td className="py-3 px-4 text-center">
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ส่งแล้ว</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <Clock className="w-3 h-3" />
                            <span>ยังไม่ส่ง</span>
                          </span>
                        )}
                      </td>

                      {/* Attached Work Photo */}
                      <td className="py-3 px-4 text-center">
                        {sub?.imageUrl ? (
                          <button
                            onClick={() => onViewImage(sub.imageUrl!, `ใบงานของ ${std.firstName}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold border border-pink-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ดูภาพงาน</span>
                          </button>
                        ) : sub?.note ? (
                          <span
                            className="text-[11px] text-slate-600 italic max-w-[120px] truncate block"
                            title={sub.note}
                          >
                            "{sub.note}"
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Score Input */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          max={currentAssignment?.maxScore || 10}
                          value={sub?.score !== undefined ? sub.score : ''}
                          onChange={(e) => {
                            if (!currentAssignment) return;
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            onGradeSubmission(currentAssignment.id, std.id, val, sub?.feedback || '');
                          }}
                          placeholder="-"
                          className="w-16 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-center text-xs font-black text-slate-800 focus:bg-white focus:border-pink-500 focus:outline-hidden"
                        />
                      </td>

                      {/* Teacher Feedback input */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={sub?.feedback || ''}
                          onChange={(e) => {
                            if (!currentAssignment) return;
                            onGradeSubmission(currentAssignment.id, std.id, sub?.score, e.target.value);
                          }}
                          placeholder="พิมพ์คำชม หรือจุดที่ควรพัฒนา..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1 px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-pink-500 focus:outline-hidden"
                        />
                      </td>

                      {/* Quick Full Score button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleQuickFullScore(std.id)}
                          className="px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-600 hover:text-white text-pink-700 font-bold text-[11px] border border-pink-200 transition-all cursor-pointer"
                          title="ให้คะแนนเต็มทันที"
                        >
                          เต็ม 10
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Assignment Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">สั่งการบ้านใหม่ (มอบหมายงาน)</h3>
                  <p className="text-xs text-slate-500">ตรงตามโครงสร้างและชีต Google Sheets</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">ชื่อการบ้าน / ภาระงาน: *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น แบบฝึกหัดคณิตศาสตร์ หน้า 15 ข้อ 1-5"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-pink-500 focus:outline-hidden"
                />
              </div>

              {/* Subject & Room Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">กลุ่มสาระการเรียนรู้: *</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:border-pink-500 focus:outline-hidden"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">ห้องเรียนที่มอบหมาย: *</label>
                  <select
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:border-pink-500 focus:outline-hidden"
                  >
                    <option value="ทุกห้อง">ทุกห้อง (มอบหมายรวมทั้งโรงเรียน)</option>
                    {['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'].map((r) => (
                      <option key={r} value={r}>
                        ชั้น {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">คำอธิบายและคำสั่ง:</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="เขียนคำชี้แจง รายละเอียด หรือข้อควรระวังในการทำการบ้าน..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-pink-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Due Date & Max Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">กำหนดส่งงาน (DueDate): *</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:border-pink-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">คะแนนเต็ม (MaxScore): *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:bg-white focus:border-pink-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  ลิงก์รูปภาพใบงาน / ตัวอย่าง (ImageUrl - ถ้ามี):
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-pink-500 focus:outline-hidden"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกและสั่งการบ้าน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
