import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Share2,
  Check,
  CheckSquare,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Assignment, Student, Submission } from '../types';
import { playClick, playSuccess, triggerConfetti } from '../utils/audio';

interface HomeworkTabProps {
  currentRoom: string;
  students: Student[];
  assignments: Assignment[];
  submissions: Submission[];
  onToggleSubmission: (assignmentId: string, studentId: string, isSubmitted: boolean) => void;
  onViewImage: (url: string, caption?: string) => void;
  onOpenLineModal: () => void;
}

export const HomeworkTab: React.FC<HomeworkTabProps> = ({
  currentRoom,
  students,
  assignments,
  submissions,
  onToggleSubmission,
  onViewImage,
  onOpenLineModal,
}) => {
  const roomAssignments = assignments.filter((a) => a.room === currentRoom || a.room === 'ทุกห้อง');
  const [selectedAsgId, setSelectedAsgId] = useState<string>(roomAssignments[0]?.id || '');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentAssignment = assignments.find((a) => a.id === selectedAsgId) || roomAssignments[0];

  const roomStudents = students
    .filter((s) => s.room === currentRoom)
    .sort((a, b) => a.number - b.number);

  const getSubmission = (studentId: string): Submission | undefined => {
    if (!currentAssignment) return undefined;
    return submissions.find((s) => s.assignmentId === currentAssignment.id && s.studentId === studentId);
  };

  const handleBulkMarkAll = () => {
    if (!currentAssignment) return;
    playSuccess();
    triggerConfetti();
    roomStudents.forEach((std) => {
      onToggleSubmission(currentAssignment.id, std.id, true);
    });
  };

  const filteredStudents = roomStudents.filter((std) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        std.firstName.toLowerCase().includes(q) ||
        std.lastName.toLowerCase().includes(q) ||
        std.nickname?.toLowerCase().includes(q) ||
        String(std.number).includes(q);
      if (!match) return false;
    }

    const sub = getSubmission(std.id);
    const isSubmitted = !!sub && (sub.status === 'submitted' || sub.status === 'graded');
    const isGraded = sub?.status === 'graded';

    if (filter === 'submitted') return isSubmitted;
    if (filter === 'pending') return !isSubmitted;
    if (filter === 'graded') return isGraded;
    return true;
  });

  const total = roomStudents.length;
  const submittedCount = roomStudents.filter((s) => {
    const sub = getSubmission(s.id);
    return !!sub && (sub.status === 'submitted' || sub.status === 'graded');
  }).length;
  const pendingCount = total - submittedCount;
  const submitRate = total > 0 ? Math.round((submittedCount / total) * 100) : 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                ติดตามการบ้าน & ใบงาน
              </span>
              <span className="text-xs font-bold text-slate-500">ห้อง {currentRoom}</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mt-1">
              ระบบเช็กสถานะการส่งงานและใบงานนักเรียน
            </h2>
            <p className="text-xs text-slate-500">
              ติดตามงานค้าง เลือกส่งงาน และส่งแจ้งเตือนการบ้านเข้า LINE กลุ่มผู้ปกครอง
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkMarkAll}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>เลือกส่งแล้วทุกคน</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onOpenLineModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>แจ้งเตือนผ่าน LINE</span>
            </button>
          </div>
        </div>

        {/* Assignment selector & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-700 shrink-0">เลือกการบ้าน:</span>
            {roomAssignments.length > 0 ? (
              <select
                value={currentAssignment?.id || ''}
                onChange={(e) => {
                  playClick();
                  setSelectedAsgId(e.target.value);
                }}
                className="bg-rose-50/70 border border-rose-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 w-full max-w-md focus:outline-hidden focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                {roomAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.subject}] {a.title} (ครบกำหนด {a.dueDate})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400">ยังไม่มีการบ้านในห้องนี้</span>
            )}
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              ส่งแล้ว: {submittedCount}/{total} คน ({submitRate}%)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              ค้างส่ง: {pendingCount} คน
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClick();
                setFilter('all');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({total})
            </button>
            <button
              onClick={() => {
                playClick();
                setFilter('pending');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              ค้างส่ง ({pendingCount})
            </button>
            <button
              onClick={() => {
                playClick();
                setFilter('submitted');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'submitted'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ส่งแล้ว ✓ ({submittedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหรือเลขที่..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Students Submissions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-rose-200 text-slate-400">
            ไม่พบรายการที่ตรงกับเงื่อนไข
          </div>
        ) : (
          filteredStudents.map((std) => {
            const sub = getSubmission(std.id);
            const isSubmitted = !!sub && (sub.status === 'submitted' || sub.status === 'graded');

            return (
              <div
                key={std.id}
                className={`bg-white rounded-2xl border-2 transition-all p-4 shadow-2xs flex flex-col justify-between space-y-3 ${
                  isSubmitted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200/80 hover:border-rose-400'
                }`}
              >
                {/* Header: Student name, number, avatar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-rose-200 shadow-2xs">
                      {std.avatarUrl ? (
                        <img src={std.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        std.firstName.slice(0, 1)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          #{std.number}
                        </span>
                        {std.nickname && (
                          <span className="text-xs font-black text-slate-800 truncate">
                            น้อง{std.nickname}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {std.prefix} {std.firstName} {std.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Submission status badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                      isSubmitted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {isSubmitted ? 'ส่งแล้ว ✓' : 'ค้างส่ง'}
                  </span>
                </div>

                {/* Sub details: image, note */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  {sub?.imageUrl ? (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700 font-semibold text-[11px]">แนบภาพถ่ายแล้ว</span>
                      <button
                        onClick={() => onViewImage(sub.imageUrl!, `ใบงานของ ${std.firstName}`)}
                        className="inline-flex items-center gap-1 text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>เปิดดูภาพ</span>
                      </button>
                    </div>
                  ) : sub?.note ? (
                    <p className="text-slate-700 italic">"{sub.note}"</p>
                  ) : (
                    <p className="text-slate-400 text-[11px]">ยังไม่มีบันทึกหรือไฟล์แนบ</p>
                  )}

                  {isSubmitted && sub?.submittedAt && (
                    <p className="text-[10px] text-slate-400">
                      เวลาส่ง: {new Date(sub.submittedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </p>
                  )}
                </div>

                {/* Bottom Toggle: เลือกส่งงาน */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (!currentAssignment) return;
                      const next = !isSubmitted;
                      if (next) {
                         playSuccess();
                        triggerConfetti();
                      } else {
                        playClick();
                      }
                      onToggleSubmission(currentAssignment.id, std.id, next);
                    }}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSubmitted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-emerald-300'
                        : 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSubmitted ? 'ส่งแล้ว (คลิกเพื่อยกเลิก)' : 'เลือกว่าส่งแล้ว'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
